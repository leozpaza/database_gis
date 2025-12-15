import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, SortAsc } from 'lucide-react';
import { api } from '../api';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    categoryId: searchParams.get('categoryId') || '',
    sortBy: searchParams.get('sortBy') || 'relevance',
    page: searchParams.get('page') || '1'
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories
  });

  const { data, isLoading } = useQuery({
    queryKey: ['search', filters],
    queryFn: () => api.search(filters as Record<string, string>)
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: '1' }));
  };

  return (
    <div className="animate-in">
      <div className="mb-8">
        <SearchBar initialValue={filters.q} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="card p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-slate-500" />
              <span className="font-medium">Фильтры</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Категория</label>
                <select
                  value={filters.categoryId}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Все категории</option>
                  {categories?.data?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.code} - {cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Сортировка</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input text-sm"
                >
                  <option value="relevance">По релевантности</option>
                  <option value="date">По дате</option>
                  <option value="views">По популярности</option>
                  <option value="title">По алфавиту</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {filters.q ? `Результаты: "${filters.q}"` : 'Все статьи'}
            </h1>
            {data?.data && (
              <span className="text-sm text-slate-500">
                Найдено: {data.data.total}
              </span>
            )}
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : data?.data?.articles?.length > 0 ? (
            <>
              <div className="space-y-4">
                {data.data.articles.map((article: any, i: number) => (
                  <ArticleCard key={article.id} article={article} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {data.data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: Math.min(5, data.data.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handleFilterChange('page', String(page))}
                        className={`w-10 h-10 rounded-lg ${
                          parseInt(filters.page) === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center">
              <SortAsc className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Статьи не найдены</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
