import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  uniqueRooms: string[];
  uniqueTeachers: string[];
  uniqueClasses: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, uniqueRooms, uniqueTeachers, uniqueClasses }) => {
  const { t } = useTranslation();
  const reset = () => onChange({ search: '', className: '', room: '', teacher: '', sessionTime: '' });

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t('filter.searchPlaceholder')}
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:flex gap-3 items-center">
        <select
          value={filters.className}
          onChange={(e) => onChange({ ...filters, className: e.target.value })}
          className="h-11 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
        >
          <option value="">{t('filter.allClasses')}</option>
          {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.room}
          onChange={(e) => onChange({ ...filters, room: e.target.value })}
          className="h-11 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
        >
          <option value="">{t('filter.allRooms')}</option>
          {uniqueRooms.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          value={filters.teacher}
          onChange={(e) => onChange({ ...filters, teacher: e.target.value })}
          className="h-11 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
        >
          <option value="">{t('filter.allTeachers')}</option>
          {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {(filters.search || filters.className || filters.room || filters.teacher) && (
          <button
            onClick={reset}
            className="h-11 w-11 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
            title={t('filter.clear')}
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};


export default FilterBar;
