export type PropertyType = 'single_family' | 'townhouse' | 'condo' | 'craftsman' | 'ranch';

export type ConditionRating = 'fixer' | 'fair' | 'good' | 'updated' | 'turnkey_luxury';

export interface PropertyFeatures {
  id?: string;
  address?: string;
  neighborhoodId: string;
  propertyType: PropertyType;
  squareFeet: number;
  lotSquareFeet: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  condition: ConditionRating;
  stories: number;
  garageSpaces: number;
  schoolRating: number; // 1-10
  walkScore: number; // 1-100
  transitScore: number; // 1-100
  distanceToTechHub: number; // in miles
  hasSolarPanels: boolean;
  hasPool: boolean;
  hasFinishedBasement: boolean;
  hasView: boolean;
  hasEvCharger: boolean;
  hasHeatPumpAic: boolean;
}

export interface HistoricalSale extends PropertyFeatures {
  id: string;
  address: string;
  salePrice: number;
  originalListPrice: number;
  saleDate: string; // ISO format YYYY-MM-DD
  daysOnMarket: number;
  pricePerSqFt: number;
  buyerType: 'owner_occupant' | 'investor' | 'relocation';
  concessions: number;
}

export interface MonthlyTrendData {
  month: string; // "2024-01"
  label: string; // "Jan 2024"
  medianSalePrice: number;
  medianPricePerSqFt: number;
  activeListings: number;
  closedSales: number;
  medianDaysOnMarket: number;
  saleToListRatio: number; // e.g. 1.02 (102%)
  inventoryMonths: number; // months of supply
  mortgageRateAvg: number; // e.g. 6.62
}

export interface MicroMarket {
  id: string;
  name: string;
  metroArea: string;
  state: string;
  zipCode: string;
  description: string;
  image: string;
  averagePricePerSqFt: number;
  medianHomePrice: number;
  yoyAppreciationRate: number; // e.g. 0.054 = 5.4%
  schoolDistrictName: string;
  medianHouseholdIncome: number;
  techEmploymentDensity: 'Very High' | 'High' | 'Moderate';
  inventoryHealth: 'Sellers Market' | 'Balanced Market' | 'Buyers Market';
  lat: number;
  lng: number;
}

export interface ModelMetrics {
  algorithm: 'ridge' | 'gbdt' | 'knn' | 'ensemble';
  name: string;
  rSquared: number;
  mae: number; // Mean Absolute Error
  rmse: number; // Root Mean Squared Error
  mape: number; // Mean Absolute Percentage Error (e.g. 3.8%)
  sampleSize: number;
  trainingTimeMs: number;
  lossHistory: number[];
}

export interface FeatureAttribution {
  featureName: string;
  rawFeatureKey: string;
  impactValue: number; // Dollar impact (positive or negative)
  relativeImportance: number; // 0 to 1
  description: string;
}

export interface ValuationResult {
  estimatedPrice: number;
  priceLowRange: number;
  priceHighRange: number;
  confidenceScore: number; // 0 - 100
  estimatedPricePerSqFt: number;
  estimatedDaysOnMarket: number;
  estimatedMonthlyRent: number;
  grossRentalYield: number; // percentage
  capRateEstimated: number; // percentage
  attributions: FeatureAttribution[];
  baseMarketPrice: number;
  comparableSales: ComparableSaleMatch[];
  modelUsed: 'ridge' | 'gbdt' | 'knn' | 'ensemble';
  metrics: ModelMetrics;
}

export interface ComparableSaleMatch {
  sale: HistoricalSale;
  similarityScore: number; // 0 - 100%
  distanceMiles: number;
  adjustedPrice: number;
  adjustmentNotes: string[];
}

export interface TimeSeriesForecastPoint {
  month: string;
  label: string;
  actualPrice?: number;
  predictedPrice: number;
  confidenceLow: number;
  confidenceHigh: number;
  projectedPricePerSqFt: number;
  isProjected: boolean;
}

export interface RenovationOption {
  id: string;
  name: string;
  category: 'interior' | 'exterior' | 'addition' | 'energy';
  estimatedCost: number;
  projectedEquityIncrease: number;
  roiPercentage: number;
  featureMutator: (features: PropertyFeatures) => PropertyFeatures;
  description: string;
}
