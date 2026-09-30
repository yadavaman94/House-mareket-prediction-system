import React, { useState } from 'react';
import { PropertyFeatures, ValuationResult, MicroMarket } from '../types/housing';
import { FileText, Printer, Copy, Check, X, ShieldCheck } from 'lucide-react';

interface ExportReportModalProps {
  features: PropertyFeatures;
  valuation: ValuationResult;
  currentMarket: MicroMarket;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  features,
  valuation,
  currentMarket,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const generateReportText = () => {
    return `HOUSE MARKET PREDICTION SYSTEM VALUATION DOSSIER
Generated: ${new Date().toLocaleDateString()}
------------------------------------------------------------
SUBJECT PROPERTY OVERVIEW
Market: ${currentMarket.name} (${currentMarket.metroArea})
Property Typology: ${features.propertyType.replace('_', ' ').toUpperCase()}
Living Footprint: ${features.squareFeet.toLocaleString()} sq ft
Lot Size: ${features.lotSquareFeet.toLocaleString()} sq ft
Bedrooms / Bathrooms: ${features.bedrooms} Beds / ${features.bathrooms} Baths
Year Built: ${features.yearBuilt} (Age: ${2026 - features.yearBuilt} yrs)
Condition Tier: ${features.condition.replace('_', ' ').toUpperCase()}
School District Score: ${features.schoolRating}/10

MACHINE LEARNING VALUATION
Point Estimate: ${formatCurrency(valuation.estimatedPrice)}
95% Confidence Interval: ${formatCurrency(valuation.priceLowRange)} - ${formatCurrency(valuation.priceHighRange)}
Price / SqFt: $${valuation.estimatedPricePerSqFt} / sq ft
Estimated Days On Market (DOM): ${valuation.estimatedDaysOnMarket} Days
Monthly Rental Projection: ${formatCurrency(valuation.estimatedMonthlyRent)} / mo (Cap Rate: ${valuation.capRateEstimated}%)

MODEL VALIDATION CERTIFICATION
Algorithm: ${valuation.metrics.name}
R-Squared Score: ${valuation.metrics.rSquared}
Mean Absolute Percentage Error (MAPE): ${valuation.metrics.mape}%
Trained Sample Size: ${valuation.metrics.sampleSize} verified local sales

TOP COMPARABLE SALES
${valuation.comparableSales.slice(0, 3).map((c, i) => `${i + 1}. ${c.sale.address} | Sold: ${formatCurrency(c.sale.salePrice)} | Adjusted: ${formatCurrency(c.adjustedPrice)} | Match: ${c.similarityScore}%`).join('\n')}
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Machine Learning Valuation Dossier
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Banner */}
        <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-neutral-400">Micro-Market Target Area</div>
            <div className="text-sm font-semibold text-white">{currentMarket.name}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5 font-mono">
              Evaluated against {valuation.metrics.sampleSize} historical transactions
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-400">Certified Model Accuracy</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              R² {valuation.metrics.rSquared} · MAPE {valuation.metrics.mape}%
            </div>
          </div>
        </div>

        {/* Big Valuation Block */}
        <div className="p-5 bg-neutral-950/60 rounded-lg border border-neutral-800/80 text-center space-y-1">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Machine Learning Projected Valuation
          </div>
          <div className="text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {formatCurrency(valuation.estimatedPrice)}
          </div>
          <div className="text-xs text-neutral-400 font-mono tabular-nums">
            95% Confidence Range: <span className="text-neutral-200">{formatCurrency(valuation.priceLowRange)}</span> — <span className="text-neutral-200">{formatCurrency(valuation.priceHighRange)}</span>
          </div>
        </div>

        {/* Property Specs Breakdown */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Subject Property Attributes
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-neutral-500 block text-[11px]">Living Footprint</span>
              <span className="text-white font-semibold">{features.squareFeet.toLocaleString()} sqft</span>
            </div>
            <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-neutral-500 block text-[11px]">Bed / Bath</span>
              <span className="text-white font-semibold">{features.bedrooms}b / {features.bathrooms}ba</span>
            </div>
            <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-neutral-500 block text-[11px]">Year Built / Lot</span>
              <span className="text-white font-semibold">{features.yearBuilt} · {features.lotSquareFeet} sqft</span>
            </div>
            <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-neutral-500 block text-[11px]">Condition</span>
              <span className="text-emerald-400 font-semibold capitalize">{features.condition.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Feature Contribution Decomposition Table */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            SHAP Marginal Value Attribution
          </div>
          <div className="space-y-1.5 text-xs">
            {valuation.attributions.map((attr, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 px-3 bg-neutral-950 rounded border border-neutral-800/80">
                <span className="text-neutral-300 font-medium">{attr.featureName}</span>
                <span className={`font-mono tabular-nums font-semibold ${attr.impactValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {attr.impactValue >= 0 ? '+' : ''}{formatCurrency(attr.impactValue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearest Comps */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Top Nearest Comparable MLS Sales
          </div>
          <div className="space-y-2 text-xs">
            {valuation.comparableSales.slice(0, 3).map((comp, idx) => (
              <div key={idx} className="p-2.5 bg-neutral-950 rounded border border-neutral-800 flex justify-between items-center">
                <div>
                  <div className="text-neutral-200 font-medium">{comp.sale.address}</div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    {comp.sale.squareFeet} sqft · {comp.sale.bedrooms}b/{comp.sale.bathrooms}ba · Sold {comp.sale.saleDate}
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-white font-semibold">{formatCurrency(comp.sale.salePrice)}</div>
                  <div className="text-[11px] text-emerald-400">Adj: {formatCurrency(comp.adjustedPrice)} ({comp.similarityScore}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 font-mono">
            Powered by House Market Prediction System ML Models
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Dossier!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
