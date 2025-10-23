'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, TrendingUp, Clock } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All News' },
  { value: 'ai', label: 'AI' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'labor', label: 'Labor' },
  { value: 'environment', label: 'Environment' },
  { value: 'corporate', label: 'Corporate' },
];

const TIME_FILTERS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'discussed', label: 'Most Discussed' },
  { value: 'impact', label: 'Highest Impact' },
];

export function NewsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get('category') || 'all';
  const timeFilter = searchParams.get('time_filter') || 'all';
  const sort = searchParams.get('sort') || 'latest';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    params.delete('page'); // Reset to page 1 when filtering
    router.push(`/news?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => updateFilter('category', cat.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              category === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Time & Sort Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Time Filter */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <select
            value={timeFilter}
            onChange={(e) => updateFilter('time_filter', e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIME_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
