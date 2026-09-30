import React from 'react';
import {
  PropertyFeatures,
  ValuationResult,
  MicroMarket,
  ConditionRating,
  PropertyType
} from '../types/housing';
import {
  SlidersHorizontal,
  Home,
  TrendingUp,
  Clock,
  DollarSign,
  Percent,
  CheckCircle2,
  ChevronRight,
  Info,
  MapPin,
  Sparkles
} from 'lucide-react';

interface PropertyValuatorProps {
  features: PropertyFeatures;
  setFeatures: React.Dispatch<React.SetStateAction<PropertyFeatures>>;
  valuation: ValuationResult;
  markets: MicroMarket[];
  selectedAlgo: 'ridge' | 'gbdt' | 'knn' | 'ensemble';
  setSelectedAlgo: (algo: 'ridge' | 'gbdt' | 'knn' | 'ensemble') => void;
  onSelectCompTab: () => void;
}

export const PropertyValuator: React.FC<PropertyValuatorProps> = ({
  features,
  setFeatures,
  valuation,
  markets,
  selectedAlgo,
  setSelectedAlgo,
  onSelectCompTab
}) => {
  const currentMarket = markets.find(m => m.id === features.neighborhoodId) || markets[0];

  const presets: { label: string; data: Partial<PropertyFeatures> }[] = [
    {
      label: 'Contemporary Craftsman',
      data: {
        propertyType: 'craftsman',
        squareFeet: 3450,
        lotSquareFeet: 8200,
        bedrooms: 4,
        bathrooms: 3.5,
        yearBuilt: 2020,
        condition: 'turnkey_luxury',
        schoolRating: 9.4,
        walkScore: 78,
        distanceToTechHub: 3.0,
        hasSolarPanels: true,
        hasPool: false,
        hasFinishedBasement: true,
        hasView: true,
        hasEvCharger: true,
        hasHeatPumpAic: true,
      }
    },
    {
      label: 'Suburban Executive',
      data: {
        propertyType: 'single_family',
        squareFeet: 4100,
        lotSquareFeet: 12000,
        bedrooms: 5,
        bathrooms: 4.5,
        yearBuilt: 2018,
        condition: 'turnkey_luxury',
        schoolRating: 9.6,
        walkScore: 55,
        distanceToTechHub: 4.5,
        hasSolarPanels: true,
        hasPool: true,
        hasFinishedBasement: true,
        hasView: true,
        hasEvCharger: true,
        hasHeatPumpAic: true,
      }
    },
    {
      label: 'Urban Modern Townhome',
      data: {
        propertyType: 'townhouse',
        squareFeet: 1950,
        lotSquareFeet: 2100,
        bedrooms: 3,
        bathrooms: 2.5,
        yearBuilt: 2022,
        condition: 'updated',
        schoolRating: 8.8,
        walkScore: 92,
        distanceToTechHub: 1.5,
        hasSolarPanels: false,
        hasPool: false,
        hasFinishedBasement: false,
        hasView: false,
        hasEvCharger: true,
        hasHeatPumpAic: true,
      }
    },
    {
      label: 'Classic Value-Add Ranch',
      data: {
        propertyType: 'ranch',
        squareFeet: 2100,
        lotSquareFeet: 9200,
        bedrooms: 3,
        bathrooms: 2.0,
        yearBuilt: 1974,
        condition: 'fair',
        schoolRating: 8.2,
        walkScore: 48,
        distanceToTechHub: 5.2,
        hasSolarPanels: false,
        hasPool: false,
        hasFinishedBasement: false,
        hasView: false,
        hasEvCharger: false,
        hasHeatPumpAic: false,
      }
    }
  ];

  const applyPreset = (preset: Partial<PropertyFeatures>) => {
    setFeatures(prev => ({
      ...prev,
      ...preset
    }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Preset Pills & Market Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mr-1">
            Property Archetypes:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p.data)}
              className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors whitespace-nowrap"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Micro-market selector */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-neutral-400">Target Micro-Market:</span>
          <select
            value={features.neighborhoodId}
            onChange={(e) => setFeatures(prev => ({ ...prev, neighborhoodId: e.target.value }))}
            className="bg-neutral-950 text-neutral-100 text-xs font-medium border border-neutral-700 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            {markets.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Form Inputs (Left) and ML Valuation Output (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Spec Controls (5 cols) */}
        <div className="xl:col-span-5 space-y-5 bg-neutral-900 border border-neutral-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              Property Spec Vectors
            </h2>
            <div className="text-xs text-neutral-400">
              <span className="font-mono tabular-nums text-emerald-400 font-medium">28</span> active dimensions
            </div>
          </div>

          {/* Living Area Square Footage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="input-square-feet" className="font-medium text-neutral-300">Finished Interior Square Feet</label>
              <span className="font-mono tabular-nums text-white font-semibold">
                {features.squareFeet.toLocaleString()} sq ft
              </span>
            </div>
            <input
              id="input-square-feet"
              aria-label="Finished Interior Square Feet"
              type="range"
              min="800"
              max="6500"
              step="25"
              value={features.squareFeet}
              onChange={(e) => setFeatures(prev => ({ ...prev, squareFeet: Number(e.target.value) }))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-neutral-500 font-mono tabular-nums">
              <span>800 sq ft</span>
              <span>3,500 sq ft</span>
              <span>6,500 sq ft</span>
            </div>
          </div>

          {/* Bedrooms & Bathrooms Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="select-bedrooms" className="text-xs font-medium text-neutral-300">Bedrooms</label>
              <select
                id="select-bedrooms"
                value={features.bedrooms}
                onChange={(e) => setFeatures(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded p-2 focus:border-emerald-500 font-mono tabular-nums"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <option key={num} value={num}>{num} Beds</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="select-bathrooms" className="text-xs font-medium text-neutral-300">Bathrooms</label>
              <select
                id="select-bathrooms"
                value={features.bathrooms}
                onChange={(e) => setFeatures(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded p-2 focus:border-emerald-500 font-mono tabular-nums"
              >
                {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5].map(num => (
                  <option key={num} value={num}>{num} Baths</option>
                ))}
              </select>
            </div>
          </div>

          {/* Property Type & Architectural Style */}
          <div className="space-y-1.5">
            <label htmlFor="select-property-type" className="text-xs font-medium text-neutral-300">Architectural Typology</label>
            <select
              id="select-property-type"
              value={features.propertyType}
              onChange={(e) => setFeatures(prev => ({ ...prev, propertyType: e.target.value as PropertyType }))}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded p-2 focus:border-emerald-500"
            >
              <option value="craftsman">Modern Northwest Craftsman</option>
              <option value="single_family">Traditional Two-Story Single Family</option>
              <option value="townhouse">Multi-Level Urban Townhome</option>
              <option value="condo">Luxury High-Rise / Mid-Rise Condominium</option>
              <option value="ranch">Single-Story Mid-Century Ranch</option>
            </select>
          </div>

          {/* Condition Tier */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex justify-between">
              <span>Condition & Finishes</span>
              <span className="text-neutral-400 capitalize">{features.condition.replace('_', ' ')}</span>
            </label>
            <div className="grid grid-cols-5 gap-1 p-1 bg-neutral-950 rounded border border-neutral-800 text-[11px]">
              {(['fixer', 'fair', 'good', 'updated', 'turnkey_luxury'] as ConditionRating[]).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setFeatures(prev => ({ ...prev, condition: cond }))}
                  className={`py-1.5 px-1 rounded transition-colors text-center truncate ${
                    features.condition === cond
                      ? 'bg-emerald-500 text-neutral-950 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {cond === 'turnkey_luxury' ? 'Luxury' : cond.charAt(0).toUpperCase() + cond.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Year Built & Lot Size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="input-year-built" className="text-xs font-medium text-neutral-300">Year Built</label>
              <input
                id="input-year-built"
                type="number"
                min="1900"
                max="2026"
                value={features.yearBuilt}
                onChange={(e) => setFeatures(prev => ({ ...prev, yearBuilt: Number(e.target.value) }))}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded p-2 focus:border-emerald-500 font-mono tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="input-lot-size" className="text-xs font-medium text-neutral-300">Lot Size (Sq Ft)</label>
              <input
                id="input-lot-size"
                type="number"
                min="0"
                max="50000"
                step="500"
                value={features.lotSquareFeet}
                onChange={(e) => setFeatures(prev => ({ ...prev, lotSquareFeet: Number(e.target.value) }))}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded p-2 focus:border-emerald-500 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Micro-Location Sliders: Schools, Walkability, Tech Hub */}
          <div className="pt-2 border-t border-neutral-800 space-y-3.5">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Neighborhood & Spatial Signals
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label htmlFor="input-school-rating" className="text-neutral-300">School District Rating</label>
                <span className="font-mono tabular-nums text-emerald-400 font-semibold">{features.schoolRating} / 10</span>
              </div>
              <input
                id="input-school-rating"
                aria-label="School District Rating"
                type="range"
                min="5.0"
                max="10.0"
                step="0.1"
                value={features.schoolRating}
                onChange={(e) => setFeatures(prev => ({ ...prev, schoolRating: Number(e.target.value) }))}
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label htmlFor="input-tech-distance" className="text-neutral-300">Distance to Major Tech Hub / CBD</label>
                <span className="font-mono tabular-nums text-white font-semibold">{features.distanceToTechHub} miles</span>
              </div>
              <input
                id="input-tech-distance"
                aria-label="Distance to Major Tech Hub / CBD"
                type="range"
                min="0.5"
                max="18.0"
                step="0.5"
                value={features.distanceToTechHub}
                onChange={(e) => setFeatures(prev => ({ ...prev, distanceToTechHub: Number(e.target.value) }))}
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="input-walk-score" className="text-neutral-400">Walk Score</label>
                  <span className="font-mono tabular-nums text-neutral-200">{features.walkScore}</span>
                </div>
                <input
                  id="input-walk-score"
                  aria-label="Walk Score"
                  type="range"
                  min="20"
                  max="99"
                  value={features.walkScore}
                  onChange={(e) => setFeatures(prev => ({ ...prev, walkScore: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-neutral-800 rounded accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="input-transit-score" className="text-neutral-400">Transit Score</label>
                  <span className="font-mono tabular-nums text-neutral-200">{features.transitScore}</span>
                </div>
                <input
                  id="input-transit-score"
                  aria-label="Transit Score"
                  type="range"
                  min="20"
                  max="95"
                  value={features.transitScore}
                  onChange={(e) => setFeatures(prev => ({ ...prev, transitScore: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-neutral-800 rounded accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* High-Value Amenities Checkboxes */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              High-Value Capital Improvements
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'hasSolarPanels', label: 'Solar PV Array' },
                { key: 'hasPool', label: 'In-Ground Pool' },
                { key: 'hasFinishedBasement', label: 'Finished Basement' },
                { key: 'hasView', label: 'Panoramic View' },
                { key: 'hasEvCharger', label: 'Level-2 EV Charger' },
                { key: 'hasHeatPumpAic', label: 'Heat Pump / Central AC' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 rounded bg-neutral-950 border border-neutral-800/80 cursor-pointer hover:border-neutral-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={features[key as keyof PropertyFeatures] as boolean}
                    onChange={(e) => setFeatures(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded text-emerald-500 bg-neutral-900 border-neutral-700 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-neutral-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Output, Confidence Bands & SHAP Waterfall (7 cols) */}
        <div className="xl:col-span-7 space-y-5">
          {/* Algorithm Selector Segmented Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="text-xs font-medium text-neutral-400 px-2">
              Inference Algorithm:
            </div>
            <div className="flex items-center gap-1">
              {[
                { id: 'ensemble', label: 'Blended Hybrid Ensemble', badge: 'R² 0.94' },
                { id: 'gbdt', label: 'Gradient Boosted Trees', badge: 'R² 0.92' },
                { id: 'ridge', label: 'Ridge L2 Regression', badge: 'R² 0.89' },
                { id: 'knn', label: 'Kernel KNN Comps', badge: 'R² 0.88' },
              ].map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => setSelectedAlgo(algo.id as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    selectedAlgo === algo.id
                      ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>{algo.label}</span>
                  <span className="text-[10px] text-neutral-500 font-mono tabular-nums">· {algo.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Valuation Hero Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                  <span>{currentMarket.name}</span>
                  <span>·</span>
                  <span>Validated against {valuation.metrics.sampleSize} Local Sales</span>
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  {formatCurrency(valuation.estimatedPrice)}
                </div>
                <div className="mt-1 text-xs text-neutral-400 flex items-center gap-2 font-mono tabular-nums">
                  <span>95% Confidence Interval:</span>
                  <span className="text-neutral-200 font-medium">
                    {formatCurrency(valuation.priceLowRange)} — {formatCurrency(valuation.priceHighRange)}
                  </span>
                </div>
              </div>

              {/* Accuracy Badge */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Model Confidence {valuation.confidenceScore}%</span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 font-mono tabular-nums">
                  Mean Abs. Error: ±{formatCurrency(valuation.metrics.mae)} ({valuation.metrics.mape}%)
                </div>
              </div>
            </div>

            {/* Core Real Estate Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
              <div className="p-3 bg-neutral-950/60 rounded border border-neutral-800">
                <div className="text-[11px] text-neutral-400 flex items-center gap-1 mb-0.5">
                  <DollarSign className="w-3 h-3 text-neutral-500" />
                  Price per Sq Ft
                </div>
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  ${valuation.estimatedPricePerSqFt}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
                  Market avg: ${currentMarket.averagePricePerSqFt}
                </div>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded border border-neutral-800">
                <div className="text-[11px] text-neutral-400 flex items-center gap-1 mb-0.5">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  Estimated DOM
                </div>
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  {valuation.estimatedDaysOnMarket} Days
                </div>
                <div className="text-[11px] text-emerald-400 font-mono tabular-nums">
                  Velocity: Rapid
                </div>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded border border-neutral-800">
                <div className="text-[11px] text-neutral-400 flex items-center gap-1 mb-0.5">
                  <TrendingUp className="w-3 h-3 text-neutral-500" />
                  Est. Monthly Rent
                </div>
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  {formatCurrency(valuation.estimatedMonthlyRent)}/mo
                </div>
                <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
                  Gross Yield: {valuation.grossRentalYield}%
                </div>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded border border-neutral-800">
                <div className="text-[11px] text-neutral-400 flex items-center gap-1 mb-0.5">
                  <Percent className="w-3 h-3 text-neutral-500" />
                  Projected Cap Rate
                </div>
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  {valuation.capRateEstimated}%
                </div>
                <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
                  Net after 32% exp
                </div>
              </div>
            </div>
          </div>

          {/* Explainable AI: Waterfall SHAP Feature Attribution */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400" />
                  Feature Contribution & SHAP Value Decomposition
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Marginal dollar attribution breakdown explaining how each property characteristic altered the baseline valuation.
                </p>
              </div>
              <div className="text-xs text-neutral-400 font-mono tabular-nums">
                Base Market: <span className="text-neutral-200">{formatCurrency(valuation.baseMarketPrice)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {valuation.attributions.map((attr, idx) => {
                const isPositive = attr.impactValue >= 0;
                const widthPct = Math.min(100, Math.max(12, Math.round((Math.abs(attr.impactValue) / 350000) * 100)));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-200">{attr.featureName}</span>
                        <span className="text-neutral-500 text-[11px] hidden sm:inline">· {attr.description}</span>
                      </div>
                      <span className={`font-mono tabular-nums font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(attr.impactValue)}
                      </span>
                    </div>

                    {/* Attribution horizontal bar */}
                    <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Comparable Sales Preview */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400" />
                Nearest Market Comps (K={valuation.comparableSales.length})
              </h3>
              <button
                onClick={onSelectCompTab}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>View Full Comps Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {valuation.comparableSales.slice(0, 3).map((comp, idx) => (
                <div key={idx} className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-semibold text-neutral-200 truncate" title={comp.sale.address}>
                      {comp.sale.address.split(',')[0]}
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono tabular-nums font-medium">
                      {comp.similarityScore}% match
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400">
                    <span className="font-mono tabular-nums">{comp.sale.squareFeet} sqft</span>
                    <span> · </span>
                    <span className="font-mono tabular-nums">{comp.sale.bedrooms}b/{comp.sale.bathrooms}ba</span>
                    <span> · </span>
                    <span className="font-mono tabular-nums">{comp.distanceMiles} mi</span>
                  </div>

                  <div className="pt-1.5 border-t border-neutral-800/80 flex justify-between items-baseline text-xs">
                    <span className="text-neutral-500">Sold Price:</span>
                    <span className="font-mono tabular-nums font-semibold text-white">
                      {formatCurrency(comp.sale.salePrice)}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-neutral-500">Model Adjusted:</span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-400">
                      {formatCurrency(comp.adjustedPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
