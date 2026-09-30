import React, { useState, useMemo } from 'react';
import { HistoricalSale, PropertyFeatures, MicroMarket } from '../types/housing';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, ExternalLink, MapPin } from 'lucide-react';

interface CompsMatrixProps {
  sales: HistoricalSale[];
  targetFeatures: PropertyFeatures;
  onSelectPropertyAsTarget: (sale: HistoricalSale) => void;
  markets: MicroMarket[];
}

export const CompsMatrix: React.FC<CompsMatrixProps> = ({
  sales,
  targetFeatures,
  onSelectPropertyAsTarget,
  markets
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'ppsf' | 'similarity'>('similarity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compute similarity score against target property
  const processedSales = useMemo(() => {
    return sales.map(sale => {
      // Calculate normalized similarity
      const sqftDelta = Math.abs(sale.squareFeet - targetFeatures.squareFeet) / (targetFeatures.squareFeet || 1);
      const bedDelta = Math.abs(sale.bedrooms - targetFeatures.bedrooms) * 0.15;
      const bathDelta = Math.abs(sale.bathrooms - targetFeatures.bathrooms) * 0.12;
      const marketMatch = sale.neighborhoodId === targetFeatures.neighborhoodId ? 0 : 0.45;
      const conditionMatch = sale.condition === targetFeatures.condition ? 0 : 0.2;

      const totalPenalty = (sqftDelta * 1.5) + bedDelta + bathDelta + marketMatch + conditionMatch;
      const similarityScore = Math.max(35, Math.min(99, Math.round(100 / (1 + totalPenalty * 0.9))));

      // Model adjusted comp price
      const sqftAdj = (targetFeatures.squareFeet - sale.squareFeet) * (sale.pricePerSqFt * 0.45);
      const bathAdj = (targetFeatures.bathrooms - sale.bathrooms) * 18000;
      const adjustedPrice = Math.round(sale.salePrice + sqftAdj + bathAdj);

      return {
        ...sale,
        similarityScore,
        adjustedPrice
      };
    });
  }, [sales, targetFeatures]);

  // Filter & Search
  const filteredSales = useMemo(() => {
    return processedSales.filter(s => {
      if (selectedMarket !== 'all' && s.neighborhoodId !== selectedMarket) return false;
      if (propertyTypeFilter !== 'all' && s.propertyType !== propertyTypeFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesAddress = s.address.toLowerCase().includes(query);
        const matchesType = s.propertyType.toLowerCase().includes(query);
        if (!matchesAddress && !matchesType) return false;
      }
      return true;
    });
  }, [processedSales, selectedMarket, propertyTypeFilter, searchTerm]);

  // Sort
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      let diff = 0;
      if (sortBy === 'similarity') diff = b.similarityScore - a.similarityScore;
      else if (sortBy === 'price') diff = b.salePrice - a.salePrice;
      else if (sortBy === 'ppsf') diff = b.pricePerSqFt - a.pricePerSqFt;
      else if (sortBy === 'date') diff = new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime();

      return sortOrder === 'desc' ? diff : -diff;
    });
  }, [filteredSales, sortBy, sortOrder]);

  return (
    <div className="space-y-5">
      {/* Header and Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by address, street, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs rounded pl-9 pr-3 py-2 w-64 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded px-3 py-2 focus:border-emerald-500"
          >
            <option value="all">All Micro-Markets ({sales.length} sales)</option>
            {markets.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <select
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded px-3 py-2 focus:border-emerald-500"
          >
            <option value="all">All Architectural Types</option>
            <option value="single_family">Single Family</option>
            <option value="craftsman">Craftsman</option>
            <option value="townhouse">Townhouse</option>
            <option value="condo">Condominium</option>
            <option value="ranch">Ranch</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Sort by:</span>
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded border border-neutral-800">
            {[
              { id: 'similarity', label: 'Match Similarity' },
              { id: 'date', label: 'Sale Date' },
              { id: 'price', label: 'Price' },
              { id: 'ppsf', label: '$/SqFt' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => {
                  if (sortBy === s.id) {
                    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy(s.id as any);
                    setSortOrder('desc');
                  }
                }}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  sortBy === s.id
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>{s.label}</span>
                {sortBy === s.id && (
                  <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Target Subject Benchmark Reference */}
      <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-neutral-400">Current Subject Benchmark:</span>
          <strong className="text-white font-mono tabular-nums">
            {targetFeatures.squareFeet.toLocaleString()} sqft · {targetFeatures.bedrooms}b/{targetFeatures.bathrooms}ba · Year {targetFeatures.yearBuilt} · {targetFeatures.condition.replace('_', ' ')}
          </strong>
        </div>
        <div className="text-neutral-400">
          Showing <span className="text-white font-semibold font-mono tabular-nums">{sortedSales.length}</span> matching comps
        </div>
      </div>

      {/* Comps High-Density Data Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
                <th className="py-3 px-4 font-semibold">Address & Market</th>
                <th className="py-3 px-3 font-semibold">Match Score</th>
                <th className="py-3 px-3 font-semibold">Closed Price</th>
                <th className="py-3 px-3 font-semibold">Model Adjusted</th>
                <th className="py-3 px-3 font-semibold">Price / SqFt</th>
                <th className="py-3 px-3 font-semibold">SqFt & Specs</th>
                <th className="py-3 px-3 font-semibold">DOM</th>
                <th className="py-3 px-3 font-semibold">Sale Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono tabular-nums">
              {sortedSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-500 font-sans">
                    No comparable sales found matching current filters.
                  </td>
                </tr>
              ) : (
                sortedSales.map((sale) => {
                  const listRatio = (sale.salePrice / (sale.originalListPrice || 1)) * 100;
                  const isHighMatch = sale.similarityScore >= 80;

                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-medium text-white truncate max-w-[220px]" title={sale.address}>
                          {sale.address}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <span>{sale.neighborhoodId}</span>
                          <span>·</span>
                          <span className="capitalize">{sale.propertyType.replace('_', ' ')}</span>
                          <span>·</span>
                          <span className="capitalize text-neutral-400">{sale.condition.replace('_', ' ')}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${isHighMatch ? 'text-emerald-400' : 'text-neutral-300'}`}>
                            {sale.similarityScore}%
                          </span>
                        </div>
                        <div className="h-1 w-14 bg-neutral-950 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${isHighMatch ? 'bg-emerald-500' : 'bg-neutral-500'}`}
                            style={{ width: `${sale.similarityScore}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-white">
                          {formatCurrency(sale.salePrice)}
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          {listRatio >= 100 ? `+${(listRatio - 100).toFixed(1)}% list` : `-${(100 - listRatio).toFixed(1)}% list`}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-emerald-400">
                          {formatCurrency(sale.adjustedPrice)}
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          {sale.adjustedPrice >= sale.salePrice ? '+' : ''}
                          {formatCurrency(sale.adjustedPrice - sale.salePrice)}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-medium text-neutral-200">
                        ${sale.pricePerSqFt}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-white">{sale.squareFeet.toLocaleString()} sqft</div>
                        <div className="text-[11px] text-neutral-400">
                          {sale.bedrooms}b / {sale.bathrooms}ba · Yr {sale.yearBuilt}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={sale.daysOnMarket <= 14 ? 'text-emerald-400 font-medium' : 'text-neutral-400'}>
                          {sale.daysOnMarket} d
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-neutral-400">
                        {sale.saleDate}
                      </td>

                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={() => onSelectPropertyAsTarget(sale)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded border border-neutral-700/80 transition-colors whitespace-nowrap"
                          title="Load this property into the Valuator"
                        >
                          Use as Base
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
