import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { useStore } from '../store';

interface SearchBarProps {
  large?: boolean;
  autoFocus?: boolean;
  initialValue?: string;
}

export default function SearchBar({ large, autoFocus, initialValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { searchHistory, addSearchQuery } = useStore();
  const showSearchIcon = query.length === 0;

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', query],
    queryFn: () => api.getSuggestions(query),
    enabled: query.length >= 2 && focused
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addSearchQuery(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setFocused(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    navigate(`/article/${slug}`);
    setFocused(false);
  };

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={`relative flex items-center ${large ? 'h-16' : 'h-12'}`}>
        {showSearchIcon && (
          <Search className={`absolute left-4 text-slate-400 ${large ? 'w-6 h-6' : 'w-5 h-5'}`} />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Поиск по базе знаний..."
          autoFocus={autoFocus}
          className={`w-full ${large ? (showSearchIcon ? 'pl-14 pr-14 text-lg' : 'pl-4 pr-14 text-lg') : showSearchIcon ? 'pl-12 pr-12' : 'pl-4 pr-12'} input`}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className={`absolute ${large ? 'right-4' : 'right-3'} p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700`}
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {focused && (searchHistory.length > 0 || (suggestions?.data?.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            {suggestions?.data?.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase">Результаты</div>
                {suggestions.data.map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSuggestionClick(item.slug)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="font-medium text-slate-900 dark:text-white">{item.title}</div>
                    <div className="text-sm text-slate-500">{item.category?.name}</div>
                  </button>
                ))}
              </div>
            )}

            {!query && searchHistory.length > 0 && (
              <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
                  <Clock size={14} /> История поиска
                </div>
                {searchHistory.slice(0, 5).map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setQuery(item); inputRef.current?.focus(); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
