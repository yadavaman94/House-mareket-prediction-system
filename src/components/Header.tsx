import React from 'react';
import { Sparkles, FileText, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'valuator' | 'trends' | 'comps' | 'lab' | 'renovation';
  setActiveTab: (tab: 'valuator' | 'trends' | 'comps' | 'lab' | 'renovation') => void;
  onOpenReport: () => void;
  onQuickRetrain: () => void;
  isRetraining: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  onQuickRetrain,
  isRetraining
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('valuator'); }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:text-emerald-400 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          House Market Prediction System
        </a>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('valuator')}
          className={`transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === 'valuator'
              ? 'text-white border-b-2 border-emerald-500 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Valuation Engine
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === 'trends'
              ? 'text-white border-b-2 border-emerald-500 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Market Trends & Forecast
        </button>
        <button
          onClick={() => setActiveTab('comps')}
          className={`transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === 'comps'
              ? 'text-white border-b-2 border-emerald-500 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Comps Matrix
        </button>
        <button
          onClick={() => setActiveTab('renovation')}
          className={`transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === 'renovation'
              ? 'text-white border-b-2 border-emerald-500 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Renovation ROI
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`transition-colors pb-0.5 whitespace-nowrap ${
            activeTab === 'lab'
              ? 'text-white border-b-2 border-emerald-500 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          ML Model Lab
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onQuickRetrain}
          disabled={isRetraining}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-md transition-colors whitespace-nowrap disabled:opacity-50"
          title="Re-fit models with current weights"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin text-emerald-400' : ''}`} />
          <span className="hidden lg:inline">{isRetraining ? 'Training...' : 'Retrain Models'}</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm whitespace-nowrap"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export Valuation</span>
        </button>
      </div>
    </header>
  );
};
