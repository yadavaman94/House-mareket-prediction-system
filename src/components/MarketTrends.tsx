import React, { useState, useMemo } from 'react';
import { MicroMarket, MonthlyTrendData, TimeSeriesForecastPoint } from '../types/housing';
import { ML_PREDICTOR } from '../ml/engine';
import { TrendingUp, Activity, BarChart3, Calendar, Layers, ShieldCheck, Compass } from 'lucide-react';

interface MarketTrendsProps {
  markets: MicroMarket[];
  selectedMarketId: string;
  setSelectedMarketId: (id: string) => void;
  trendHistory: Record<string, MonthlyTrendData[]>;
}

export const MarketTrends: React.FC<MarketTrendsProps> = ({
  markets,
  selectedMarketId,
  setSelectedMarketId,
  trendHistory
}) => {
  const [metric, setMetric] = useState<'price' | 'ppsf' | 'inventory' | 'dom' | 'ratio'>('price');
  const [scenario, setScenario] = useState<'base' | 'bullish' | 'conservative'>('base');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const currentMarket = markets.find(m => m.id === selectedMarketId) || markets[0];
  const historyData = trendHistory[selectedMarketId] || [];

  // Generate 36-month ML time series forecast
  const forecastSeries: TimeSeriesForecastPoint[] = useMemo(() => {
    if (historyData.length === 0) return [];
    return ML_PREDICTOR.forecastMarketTrend(historyData, 36, scenario);
  }, [historyData, scenario]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // SVG Chart Dimensions & Scales
  const width = 860;
  const height = 340;
  const padding = { top: 25, right: 35, bottom: 45, left: 75 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Compute values for selected metric
  const dataPoints = useMemo(() => {
    return forecastSeries.map((d, i) => {
      let val = d.predictedPrice;
      let low = d.confidenceLow;
      let high = d.confidenceHigh;

      if (metric === 'ppsf') {
        val = d.projectedPricePerSqFt;
        low = Math.round(d.projectedPricePerSqFt * (d.confidenceLow / d.predictedPrice));
        high = Math.round(d.projectedPricePerSqFt * (d.confidenceHigh / d.predictedPrice));
      } else if (metric === 'inventory') {
        const h = historyData[i];
        val = h ? h.inventoryMonths : (scenario === 'bullish' ? 1.6 : scenario === 'conservative' ? 3.4 : 2.2);
        low = Math.max(0.8, val - 0.4);
        high = val + 0.5;
      } else if (metric === 'dom') {
        const h = historyData[i];
        val = h ? h.medianDaysOnMarket : (scenario === 'bullish' ? 9 : scenario === 'conservative' ? 24 : 14);
        low = Math.max(4, val - 3);
        high = val + 4;
      } else if (metric === 'ratio') {
        const h = historyData[i];
        val = h ? h.saleToListRatio * 100 : (scenario === 'bullish' ? 103.5 : scenario === 'conservative' ? 98.5 : 101.2);
        low = val - 1.2;
        high = val + 1.2;
      }

      return {
        ...d,
        val,
        low,
        high,
        idx: i
      };
    });
  }, [forecastSeries, historyData, metric, scenario]);

  // Min / Max for Y-axis scale
  const minY = useMemo(() => {
    const minVal = Math.min(...dataPoints.map(d => d.low));
    return Math.floor(minVal * 0.95);
  }, [dataPoints]);

  const maxY = useMemo(() => {
    const maxVal = Math.max(...dataPoints.map(d => d.high));
    return Math.ceil(maxVal * 1.05);
  }, [dataPoints]);

  const getX = (i: number) => padding.left + (i / (dataPoints.length - 1)) * chartW;
  const getY = (val: number) => padding.top + chartH - ((val - minY) / (maxY - minY || 1)) * chartH;

  // Build SVG path strings
  const historicalCount = historyData.length;

  // Line paths
  const historyPath = dataPoints
    .slice(0, historicalCount)
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.val).toFixed(1)}`)
    .join(' ');

  const forecastPath = dataPoints
    .slice(historicalCount - 1)
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(historicalCount - 1 + i).toFixed(1)} ${getY(d.val).toFixed(1)}`)
    .join(' ');

  // Confidence Interval polygon area for forecast
  const forecastPoints = dataPoints.slice(historicalCount - 1);
  const upperPath = forecastPoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(historicalCount - 1 + i).toFixed(1)} ${getY(d.high).toFixed(1)}`)
    .join(' ');

  const lowerPathReversed = [...forecastPoints]
    .reverse()
    .map((d, i) => `L ${getX(historicalCount - 1 + forecastPoints.length - 1 - i).toFixed(1)} ${getY(d.low).toFixed(1)}`)
    .join(' ');

  const confidenceAreaPath = `${upperPath} ${lowerPathReversed} Z`;

  // Active hover point
  const activePoint = hoverIndex !== null ? dataPoints[hoverIndex] : dataPoints[dataPoints.length - 1];

  // Latest vital metrics from last closed month
  const lastRecorded = historyData[historyData.length - 1] || {
    medianSalePrice: 1200000,
    medianPricePerSqFt: 650,
    activeListings: 140,
    closedSales: 82,
    medianDaysOnMarket: 12,
    saleToListRatio: 1.018,
    inventoryMonths: 1.8,
    mortgageRateAvg: 6.12
  };

  return (
    <div className="space-y-6">
      {/* Micro-market selector tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg">
        {markets.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMarketId(m.id)}
            className={`px-4 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              selectedMarketId === m.id
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>{m.name}</span>
            <span className="text-[11px] text-neutral-500 font-mono tabular-nums">· ${m.averagePricePerSqFt}/sqft</span>
          </button>
        ))}
      </div>

      {/* Market Profile Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 bg-neutral-900 border border-neutral-800 rounded-lg items-center">
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>{currentMarket.metroArea}</span>
            <span>·</span>
            <span>{currentMarket.zipCode}</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">{currentMarket.inventoryHealth}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {currentMarket.name}
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
            {currentMarket.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-neutral-400">
            <span>School District: <strong className="text-neutral-200">{currentMarket.schoolDistrictName}</strong></span>
            <span>·</span>
            <span>Median Household Income: <strong className="text-neutral-200 font-mono tabular-nums">{formatCurrency(currentMarket.medianHouseholdIncome)}</strong></span>
            <span>·</span>
            <span>Tech Density: <strong className="text-emerald-400">{currentMarket.techEmploymentDensity}</strong></span>
          </div>
        </div>

        {/* Micro-market photo showcase */}
        <div className="lg:col-span-4 h-36 rounded-md overflow-hidden relative border border-neutral-800">
          <img
            src={currentMarket.image}
            alt={currentMarket.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
            <span className="text-xs text-neutral-200 font-medium">
              Regional Architectural Context
            </span>
          </div>
        </div>
      </div>

      {/* Market Vitals Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
          <div className="text-[11px] text-neutral-400">Median Sale Price</div>
          <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
            {formatCurrency(lastRecorded.medianSalePrice)}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono tabular-nums">
            +{(currentMarket.yoyAppreciationRate * 100).toFixed(1)}% YoY
          </div>
        </div>

        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
          <div className="text-[11px] text-neutral-400">Median Price / SqFt</div>
          <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
            ${lastRecorded.medianPricePerSqFt}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
            Per finished living foot
          </div>
        </div>

        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
          <div className="text-[11px] text-neutral-400">Median Days On Market</div>
          <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
            {lastRecorded.medianDaysOnMarket} Days
          </div>
          <div className="text-[11px] text-emerald-400 font-mono tabular-nums">
            High absorption speed
          </div>
        </div>

        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
          <div className="text-[11px] text-neutral-400">Sale-to-List Ratio</div>
          <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
            {(lastRecorded.saleToListRatio * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
            {lastRecorded.saleToListRatio > 1.0 ? 'Over asking price' : 'At asking price'}
          </div>
        </div>

        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
          <div className="text-[11px] text-neutral-400">Supply / Absorption</div>
          <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
            {lastRecorded.inventoryMonths} Months
          </div>
          <div className="text-[11px] text-amber-400 font-mono tabular-nums">
            Constrained inventory
          </div>
        </div>

        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
          <div className="text-[11px] text-neutral-400">Avg 30-Yr Mortgage</div>
          <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
            {lastRecorded.mortgageRateAvg}%
          </div>
          <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
            Prevailing conventional
          </div>
        </div>
      </div>

      {/* Main Chart Section: Controls + SVG Graph */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-neutral-800">
          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded border border-neutral-800 text-xs">
            {[
              { id: 'price', label: 'Median Price' },
              { id: 'ppsf', label: 'Price / SqFt' },
              { id: 'dom', label: 'Days On Market' },
              { id: 'ratio', label: 'Sale-to-List %' },
              { id: 'inventory', label: 'Months Supply' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id as any)}
                className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                  metric === m.id
                    ? 'bg-neutral-800 text-white font-medium shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">ML Forecast Scenario:</span>
            <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded border border-neutral-800 text-xs">
              {[
                { id: 'base', label: 'Baseline Trend' },
                { id: 'bullish', label: 'Bullish Growth' },
                { id: 'conservative', label: 'Conservative' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id as any)}
                  className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap text-xs ${
                    scenario === s.id
                      ? 'bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/40'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Interactive SVG Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none overflow-visible"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const yVal = minY + (maxY - minY) * (1 - pct);
              const yPos = padding.top + chartH * pct;
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={width - padding.right}
                    y2={yPos}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    className="text-[10px] fill-neutral-500 font-mono tabular-nums"
                  >
                    {metric === 'price'
                      ? `$${Math.round(yVal / 1000)}k`
                      : metric === 'ppsf'
                      ? `$${Math.round(yVal)}`
                      : metric === 'ratio'
                      ? `${yVal.toFixed(1)}%`
                      : yVal.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Vertical Split Indicator between History and Forecast */}
            <line
              x1={getX(historicalCount - 1)}
              y1={padding.top}
              x2={getX(historicalCount - 1)}
              y2={padding.top + chartH}
              stroke="#10B981"
              strokeDasharray="3 3"
              strokeOpacity="0.5"
            />
            <text
              x={getX(historicalCount - 1)}
              y={padding.top - 8}
              textAnchor="middle"
              className="text-[10px] fill-emerald-400 font-mono"
            >
              Today (ML Horizon)
            </text>

            {/* Shaded Forecast 95% Confidence Band */}
            <path
              d={confidenceAreaPath}
              fill="url(#forecastAreaGrad)"
            />

            {/* Historical Trend Line (Solid Emerald) */}
            <path
              d={historyPath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
            />

            {/* Forecast Trend Line (Dashed Cyan/Emerald) */}
            <path
              d={forecastPath}
              fill="none"
              stroke="#34D399"
              strokeWidth="2.2"
              strokeDasharray="5 4"
            />

            {/* X-axis labels (yearly markers) */}
            {dataPoints.map((d, i) => {
              if (i % 14 !== 0 && i !== dataPoints.length - 1) return null;
              return (
                <text
                  key={i}
                  x={getX(i)}
                  y={height - 12}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-400 font-mono"
                >
                  {d.label}
                </text>
              );
            })}

            {/* Interactive hover crosshair and tracking */}
            {hoverIndex !== null && (
              <g>
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={padding.top + chartH}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1"
                />
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(activePoint.val)}
                  r="5"
                  fill="#10B981"
                  stroke="#000"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Invisible overlay rects for hover detection */}
            {dataPoints.map((_, i) => (
              <rect
                key={i}
                x={getX(i) - (chartW / (dataPoints.length * 2))}
                y={padding.top}
                width={chartW / dataPoints.length}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
              />
            ))}
          </svg>

          {/* Hover Status Box */}
          <div className="mt-3 p-3 bg-neutral-950 rounded border border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-white font-semibold">{activePoint.label}</span>
              <span className="text-neutral-500">·</span>
              <span className={activePoint.isProjected ? 'text-emerald-400' : 'text-neutral-400'}>
                {activePoint.isProjected ? 'ML Projected Value' : 'Historical MLS Closed Data'}
              </span>
            </div>

            <div className="flex items-center gap-4 tabular-nums">
              <div>
                <span className="text-neutral-500 mr-1.5">Value:</span>
                <span className="text-white font-bold">
                  {metric === 'price' ? formatCurrency(activePoint.val) : `$${activePoint.val}/sqft`}
                </span>
              </div>

              {activePoint.isProjected && (
                <div>
                  <span className="text-neutral-500 mr-1.5">95% Range:</span>
                  <span className="text-neutral-300">
                    {formatCurrency(activePoint.low)} — {formatCurrency(activePoint.high)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Micro-Market Matrix */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          Cross-Market Micro-Index Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 font-semibold">Micro-Market</th>
                <th className="pb-3 font-semibold">Median Price</th>
                <th className="pb-3 font-semibold">Avg $/SqFt</th>
                <th className="pb-3 font-semibold">1-Yr Appreciation</th>
                <th className="pb-3 font-semibold">Median Income</th>
                <th className="pb-3 font-semibold">Tech Density</th>
                <th className="pb-3 font-semibold">Market Regime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono tabular-nums">
              {markets.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => setSelectedMarketId(m.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedMarketId === m.id ? 'bg-neutral-800/60 text-white' : 'hover:bg-neutral-800/30 text-neutral-300'
                  }`}
                >
                  <td className="py-3 font-sans font-medium text-white flex items-center gap-2">
                    {selectedMarketId === m.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    {m.name}
                  </td>
                  <td className="py-3 font-semibold">{formatCurrency(m.medianHomePrice)}</td>
                  <td className="py-3">${m.averagePricePerSqFt}</td>
                  <td className="py-3 text-emerald-400">+{(m.yoyAppreciationRate * 100).toFixed(1)}%</td>
                  <td className="py-3">{formatCurrency(m.medianHouseholdIncome)}</td>
                  <td className="py-3 font-sans">{m.techEmploymentDensity}</td>
                  <td className="py-3 font-sans">
                    <span className="text-emerald-400">{m.inventoryHealth}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
