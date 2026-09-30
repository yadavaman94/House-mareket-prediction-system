import React, { useState, useEffect, useMemo, useTransition } from 'react';
import {
  PropertyFeatures,
  HistoricalSale,
  MonthlyTrendData,
  ValuationResult,
  ModelMetrics
} from './types/housing';
import {
  MICRO_MARKETS,
  getExpandedHistoricalDataset,
  generateMarketTrendHistory
} from './data/microMarkets';
import { ML_PREDICTOR } from './ml/engine';
import { Header } from './components/Header';
import { PropertyValuator } from './components/PropertyValuator';
import { MarketTrends } from './components/MarketTrends';
import { CompsMatrix } from './components/CompsMatrix';
import { ModelTrainerLab } from './components/ModelTrainerLab';
import { RenovationROI } from './components/RenovationROI';
import { ExportReportModal } from './components/ExportReportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'valuator' | 'trends' | 'comps' | 'lab' | 'renovation'>('valuator');
  const [salesDataset, setSalesDataset] = useState<HistoricalSale[]>(() => getExpandedHistoricalDataset());
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [selectedAlgo, setSelectedAlgo] = useState<'ridge' | 'gbdt' | 'knn' | 'ensemble'>('ensemble');

  // Pre-generate monthly trend data for all markets
  const trendHistory = useMemo(() => {
    const map: Record<string, MonthlyTrendData[]> = {};
    for (const m of MICRO_MARKETS) {
      map[m.id] = generateMarketTrendHistory(m.id);
    }
    return map;
  }, []);

  // Primary Property Configuration State
  const [features, setFeatures] = useState<PropertyFeatures>({
    neighborhoodId: 'kirkland-bellevue',
    propertyType: 'craftsman',
    squareFeet: 3450,
    lotSquareFeet: 8200,
    bedrooms: 4,
    bathrooms: 3.5,
    yearBuilt: 2020,
    condition: 'turnkey_luxury',
    stories: 2,
    garageSpaces: 2,
    schoolRating: 9.4,
    walkScore: 78,
    transitScore: 65,
    distanceToTechHub: 3.0,
    hasSolarPanels: true,
    hasPool: false,
    hasFinishedBasement: true,
    hasView: true,
    hasEvCharger: true,
    hasHeatPumpAic: true,
  });

  // Train the ML engine on first mount
  const [metrics, setMetrics] = useState<Record<string, ModelMetrics>>({});

  useEffect(() => {
    ML_PREDICTOR.train(salesDataset);
    setMetrics({ ...ML_PREDICTOR.validationMetrics });
  }, [salesDataset]);

  // Compute live prediction whenever features or algorithm changes
  const valuation: ValuationResult = useMemo(() => {
    return ML_PREDICTOR.predictProperty(features, selectedAlgo);
  }, [features, selectedAlgo, metrics]);

  // Handle retraining with updated hyperparameters
  const handleRetrain = (params: {
    lambdaReg: number;
    learningRate: number;
    numTrees: number;
    kNeighbors: number;
  }) => {
    setIsRetraining(true);
    setTimeout(() => {
      ML_PREDICTOR.ridge.lambdaReg = params.lambdaReg;
      ML_PREDICTOR.gbdt.learningRate = params.learningRate;
      ML_PREDICTOR.gbdt.numTrees = params.numTrees;
      ML_PREDICTOR.knn.kNeighbors = params.kNeighbors;

      ML_PREDICTOR.train(salesDataset);
      setMetrics({ ...ML_PREDICTOR.validationMetrics });
      setIsRetraining(false);
    }, 450);
  };

  const handleQuickRetrain = () => {
    handleRetrain({
      lambdaReg: 0.4,
      learningRate: 0.12,
      numTrees: 24,
      kNeighbors: 6
    });
  };

  // Add a newly ingested custom sale
  const handleAddSale = (newSale: HistoricalSale) => {
    setSalesDataset(prev => [newSale, ...prev]);
  };

  // When a comp from the matrix is chosen as base
  const handleSelectPropertyAsTarget = (sale: HistoricalSale) => {
    setFeatures({
      neighborhoodId: sale.neighborhoodId,
      propertyType: sale.propertyType,
      squareFeet: sale.squareFeet,
      lotSquareFeet: sale.lotSquareFeet,
      bedrooms: sale.bedrooms,
      bathrooms: sale.bathrooms,
      yearBuilt: sale.yearBuilt,
      condition: sale.condition,
      stories: sale.stories,
      garageSpaces: sale.garageSpaces,
      schoolRating: sale.schoolRating,
      walkScore: sale.walkScore,
      transitScore: sale.transitScore,
      distanceToTechHub: sale.distanceToTechHub,
      hasSolarPanels: sale.hasSolarPanels,
      hasPool: sale.hasPool,
      hasFinishedBasement: sale.hasFinishedBasement,
      hasView: sale.hasView,
      hasEvCharger: sale.hasEvCharger,
      hasHeatPumpAic: sale.hasHeatPumpAic,
    });
    setActiveTab('valuator');
  };

  const currentMarket = MICRO_MARKETS.find(m => m.id === features.neighborhoodId) || MICRO_MARKETS[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* 3-Zone Sticky Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportModalOpen(true)}
        onQuickRetrain={handleQuickRetrain}
        isRetraining={isRetraining}
      />

      {/* Main Content Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Breadcrumb / Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800">
          <div>
            <div className="text-xs text-neutral-400 font-medium">
              Real Estate Machine Learning Core / {activeTab === 'valuator' ? 'Property Valuation Engine' : activeTab === 'trends' ? 'Market Trend Analytics & Forecast' : activeTab === 'comps' ? 'Comparable Sales Matrix' : activeTab === 'renovation' ? 'Capital Improvement ROI Planner' : 'ML Model Engineering Lab'}
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {activeTab === 'valuator' && 'Interactive Property Valuation & Attribution Engine'}
              {activeTab === 'trends' && 'Local Market Historical Trends & 36-Month Forecast'}
              {activeTab === 'comps' && 'Verified Closed MLS Sales & Dynamic Adjustments'}
              {activeTab === 'renovation' && 'Renovation Equity & Value-Add ROI Calculator'}
              {activeTab === 'lab' && 'Algorithm Performance, Cross-Validation & Hyperparameters'}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
            <span>Model: <strong className="text-emerald-400 font-semibold">{valuation.metrics.name.split(' ')[0]}</strong></span>
            <span>·</span>
            <span>R²: <strong className="text-white font-semibold tabular-nums">{valuation.metrics.rSquared}</strong></span>
            <span>·</span>
            <span>MAPE: <strong className="text-white font-semibold tabular-nums">{valuation.metrics.mape}%</strong></span>
          </div>
        </div>

        {/* Tab View Switching */}
        {activeTab === 'valuator' && (
          <PropertyValuator
            features={features}
            setFeatures={setFeatures}
            valuation={valuation}
            markets={MICRO_MARKETS}
            selectedAlgo={selectedAlgo}
            setSelectedAlgo={setSelectedAlgo}
            onSelectCompTab={() => setActiveTab('comps')}
          />
        )}

        {activeTab === 'trends' && (
          <MarketTrends
            markets={MICRO_MARKETS}
            selectedMarketId={features.neighborhoodId}
            setSelectedMarketId={(id) => setFeatures(prev => ({ ...prev, neighborhoodId: id }))}
            trendHistory={trendHistory}
          />
        )}

        {activeTab === 'comps' && (
          <CompsMatrix
            sales={salesDataset}
            targetFeatures={features}
            onSelectPropertyAsTarget={handleSelectPropertyAsTarget}
            markets={MICRO_MARKETS}
          />
        )}

        {activeTab === 'renovation' && (
          <RenovationROI
            features={features}
            setFeatures={setFeatures}
            baseValuation={valuation}
          />
        )}

        {activeTab === 'lab' && (
          <ModelTrainerLab
            metrics={metrics}
            sales={salesDataset}
            onRetrain={handleRetrain}
            onAddSale={handleAddSale}
            isRetraining={isRetraining}
            markets={MICRO_MARKETS}
          />
        )}
      </main>

      {/* Export Report Dossier Modal */}
      {isReportModalOpen && (
        <ExportReportModal
          features={features}
          valuation={valuation}
          currentMarket={currentMarket}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 px-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-neutral-400 font-medium">House Market Prediction System</span>
            <span>·</span>
            <span>Continuous MLS Transaction Learning</span>
          </div>
          <div>
            Statistical confidence intervals computed via 95% holdout cross-validation.
          </div>
        </div>
      </footer>
    </div>
  );
}
