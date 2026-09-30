import React, { useState, useMemo } from 'react';
import { PropertyFeatures, ValuationResult, RenovationOption } from '../types/housing';
import { ML_PREDICTOR } from '../ml/engine';
import { Wrench, ArrowRight, Check, TrendingUp, Sparkles, DollarSign } from 'lucide-react';

interface RenovationROIProps {
  features: PropertyFeatures;
  setFeatures: React.Dispatch<React.SetStateAction<PropertyFeatures>>;
  baseValuation: ValuationResult;
}

export const RenovationROI: React.FC<RenovationROIProps> = ({
  features,
  setFeatures,
  baseValuation
}) => {
  const [selectedRenovations, setSelectedRenovations] = useState<string[]>(['kitchen', 'solar']);

  const renovationCatalog: RenovationOption[] = [
    {
      id: 'kitchen',
      name: "Chef's Kitchen Architectural Remodel",
      category: 'interior',
      estimatedCost: 38000,
      projectedEquityIncrease: 62000,
      roiPercentage: 63,
      description: 'Custom flat-panel cabinetry, commercial induction range, waterfall quartz island, and integrated panel-ready appliances.',
      featureMutator: (p) => ({
        ...p,
        condition: (p.condition === 'fixer' || p.condition === 'fair') ? 'updated' : 'turnkey_luxury'
      })
    },
    {
      id: 'primary_suite',
      name: 'Primary Suite & Spa Bath Addition',
      category: 'addition',
      estimatedCost: 48000,
      projectedEquityIncrease: 78000,
      roiPercentage: 62.5,
      description: 'Adds 320 sqft finished luxury suite with frameless glass double shower, radiant heated floor, and dual walk-in dressing rooms.',
      featureMutator: (p) => ({
        ...p,
        squareFeet: p.squareFeet + 320,
        bedrooms: p.bedrooms + 1,
        bathrooms: p.bathrooms + 1,
        condition: p.condition === 'turnkey_luxury' ? 'turnkey_luxury' : 'updated'
      })
    },
    {
      id: 'basement',
      name: 'Finished Media & Walkout Basement',
      category: 'interior',
      estimatedCost: 32000,
      projectedEquityIncrease: 51000,
      roiPercentage: 59.4,
      description: 'Adds 450 sqft of permitted finished flex living volume, wet bar, and acoustic insulation.',
      featureMutator: (p) => ({
        ...p,
        hasFinishedBasement: true,
        squareFeet: p.hasFinishedBasement ? p.squareFeet : p.squareFeet + 450
      })
    },
    {
      id: 'solar',
      name: 'Solar PV Micro-Grid & Storage',
      category: 'energy',
      estimatedCost: 22000,
      projectedEquityIncrease: 28500,
      roiPercentage: 29.5,
      description: '10.2 kW tier-1 monocrystalline rooftop array with 15 kWh battery backup and smart energy gateway.',
      featureMutator: (p) => ({
        ...p,
        hasSolarPanels: true,
        hasEvCharger: true
      })
    },
    {
      id: 'pool',
      name: 'Architectural In-Ground Pool & Patio',
      category: 'exterior',
      estimatedCost: 65000,
      projectedEquityIncrease: 52000,
      roiPercentage: -20.0,
      description: 'Gunite saltwater plunge pool with integrated coping, bluestone paver surround, and ambient LED fixtures.',
      featureMutator: (p) => ({
        ...p,
        hasPool: true
      })
    },
    {
      id: 'climate',
      name: 'Cold-Climate Heat Pump & Whole-Home AC',
      category: 'energy',
      estimatedCost: 16500,
      projectedEquityIncrease: 23000,
      roiPercentage: 39.4,
      description: 'Hyper-heating variable inverter heat pump system eliminating fossil fuels with multi-zone digital thermostats.',
      featureMutator: (p) => ({
        ...p,
        hasHeatPumpAic: true
      })
    }
  ];

  const toggleRenovation = (id: string) => {
    setSelectedRenovations(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  // Compute combined feature vector & new valuation
  const simulation = useMemo(() => {
    let modified = { ...features };
    let totalCost = 0;

    for (const id of selectedRenovations) {
      const item = renovationCatalog.find(r => r.id === id);
      if (item) {
        totalCost += item.estimatedCost;
        modified = item.featureMutator(modified);
      }
    }

    const newResult = ML_PREDICTOR.predictProperty(modified, 'ensemble');
    const grossEquityGain = newResult.estimatedPrice - baseValuation.estimatedPrice;
    const netProfit = grossEquityGain - totalCost;
    const netRoi = totalCost > 0 ? Number(((netProfit / totalCost) * 100).toFixed(1)) : 0;

    return {
      modifiedFeatures: modified,
      totalCost,
      newEstimatedPrice: newResult.estimatedPrice,
      grossEquityGain,
      netProfit,
      netRoi,
      newPpsf: newResult.estimatedPricePerSqFt
    };
  }, [features, selectedRenovations, baseValuation]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const commitRenovations = () => {
    setFeatures(simulation.modifiedFeatures);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Header */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-400" />
          Value-Add Capital Improvement & Renovation ROI Simulator
        </h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          Evaluate capital expenditure projects against the machine learning valuation model. The system recalculates square footage coefficients, condition multipliers, and premium amenity elasticity to project your post-renovation equity.
        </p>
      </div>

      {/* Simulator Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="text-xs text-neutral-400">Total Renovation Budget</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
            {formatCurrency(simulation.totalCost)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5 font-mono">
            {selectedRenovations.length} projects selected
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="text-xs text-neutral-400">Projected Post-Reno Value</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {formatCurrency(simulation.newEstimatedPrice)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
            Base: {formatCurrency(baseValuation.estimatedPrice)}
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="text-xs text-neutral-400">Gross Equity Gain</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
            +{formatCurrency(simulation.grossEquityGain)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5 font-mono">
            ${simulation.newPpsf}/sqft (+${simulation.newPpsf - baseValuation.estimatedPricePerSqFt})
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="text-xs text-neutral-400">Net Profit & Value-Add ROI</div>
          <div className={`text-2xl font-bold font-mono tabular-nums mt-1 ${simulation.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {simulation.netProfit >= 0 ? '+' : ''}{formatCurrency(simulation.netProfit)}
          </div>
          <div className="text-[11px] font-mono tabular-nums text-neutral-300 mt-0.5">
            Composite ROI: <strong className={simulation.netRoi >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{simulation.netRoi}%</strong>
          </div>
        </div>
      </div>

      {/* Catalog of Renovation Options */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h3 className="text-sm font-semibold text-white">
            Available Capital Improvement Projects
          </h3>
          <button
            onClick={commitRenovations}
            disabled={selectedRenovations.length === 0}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 rounded transition-colors"
          >
            Apply to Active Property
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {renovationCatalog.map((item) => {
            const isSelected = selectedRenovations.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => toggleRenovation(item.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer select-none space-y-2.5 ${
                  isSelected
                    ? 'bg-neutral-950 border-emerald-500/80 shadow-sm'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500 text-neutral-950'
                          : 'border-neutral-700 bg-neutral-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{item.name}</div>
                      <div className="text-[10px] text-neutral-400 capitalize">{item.category}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs font-bold text-neutral-200">
                      {formatCurrency(item.estimatedCost)}
                    </div>
                    <div className="text-[10px] text-neutral-500">Estimated cost</div>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-neutral-500">Projected Equity Add:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">
                      +{formatCurrency(item.projectedEquityIncrease)}
                    </span>
                    <span className={`text-[11px] ${item.roiPercentage >= 0 ? 'text-emerald-400' : 'text-neutral-400'}`}>
                      ({item.roiPercentage >= 0 ? '+' : ''}{item.roiPercentage}% ROI)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
