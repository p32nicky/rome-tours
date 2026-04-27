import { useState, useEffect, useCallback, useMemo } from 'react';
import { ViatorProduct } from '../models/ViatorModels';
import { fetchRomeTours } from '../services/ViatorService';

export type TourFilter = 'all' | 'freeCancellation' | 'sellingFast' | 'topRated';

export const FILTER_OPTIONS: { key: TourFilter; label: string; icon: string }[] = [
  { key: 'all',             label: 'All',          icon: 'map' },
  { key: 'freeCancellation',label: 'Free Cancel',  icon: 'refresh-circle' },
  { key: 'sellingFast',     label: 'Selling Fast', icon: 'flame' },
  { key: 'topRated',        label: 'Top Rated',    icon: 'star' },
];

export function useTours() {
  const [tours, setTours] = useState<ViatorProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTour, setSelectedTour] = useState<ViatorProduct | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TourFilter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRomeTours();
      setTours(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load tours');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = tours;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }
    switch (filter) {
      case 'freeCancellation': result = result.filter((t) => t.flags?.includes('FREE_CANCELLATION')); break;
      case 'sellingFast':      result = result.filter((t) => t.flags?.includes('LIKELY_TO_SELL_OUT')); break;
      case 'topRated':         result = result.filter((t) => (t.reviews?.combinedAverageRating ?? 0) >= 4.5); break;
    }
    return result;
  }, [tours, search, filter]);

  return {
    tours: filtered,
    loading,
    error,
    selectedTour,
    setSelectedTour,
    search,
    setSearch,
    filter,
    setFilter,
    refresh: load,
  };
}
