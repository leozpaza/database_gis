import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Home } from 'lucide-react';
import { api } from '../api';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Category() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => api.getCategory(slug!),
    enabled: !!slug
  });

  if (isLoading) return <LoadingSpinner />;
  if (error || !data?.data) return <div className="text-center py-12">Категория не найдена</div>;

  const category = data.data;

  return (
    <div className="animate-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-6 text-slate-500">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
          <Home size={16} /> Главная
        </Link>
        <ChevronRight size={16} />
        {category.parent && (
          <>
            <Link to={`/category/${category.parent.slug}`} className="hover:text-primary-600">
              {category.parent.name}
            </Link>
            <ChevronRight size={16} />
          </>
        )}
        <span className="text-slate-900 dark:text-white">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="card p-8 mb-8">
        <div className="flex items-start gap-4">
          <span className="text-sm font-mono text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-lg">
            {category.code}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-slate-600 dark:text-slate-300">{category.description}</p>
        )}
      </div>

      {/* Subcategories */}
      {category.children?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Подкатегории</h2>
          <div className="flex flex-wrap gap-3">
            {category.children.map((child: any) => (
              <Link
                key={child.id}
                to={`/category/${child.slug}`}
                className="btn-secondary text-sm"
              >
                {child.code} - {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Статьи ({category.articles?.length || 0})
        </h2>
        {category.articles?.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {category.articles.map((article: any, i: number) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-slate-500">
            В этой категории пока нет статей
          </div>
        )}
      </div>
    </div>
  );
}
