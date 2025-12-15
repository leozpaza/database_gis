import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Home, Eye, Calendar, Copy, Check, Scale, ChevronDown, User } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const [expandedExamples, setExpandedExamples] = useState<Set<number>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.getArticle(slug!),
    enabled: !!slug
  });

  const copyTemplate = async () => {
    if (data?.data?.responseTemplate) {
      await navigator.clipboard.writeText(data.data.responseTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleExample = (i: number) => {
    setExpandedExamples(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error || !data?.data) return <div className="text-center py-12">Статья не найдена</div>;

  const article = data.data;

  return (
    <div className="animate-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-6 text-slate-500 flex-wrap">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
          <Home size={16} /> Главная
        </Link>
        <ChevronRight size={16} />
        {article.category && (
          <>
            <Link to={`/category/${article.category.slug}`} className="hover:text-primary-600">
              {article.category.name}
            </Link>
            <ChevronRight size={16} />
          </>
        )}
        <span className="text-slate-900 dark:text-white line-clamp-1">{article.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Main Content */}
        <main>
          {/* Header */}
          <div className="card p-8 mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {article.category && (
                <span className="text-sm font-mono text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-lg">
                  {article.category.code}
                </span>
              )}
              {article.legalReference && (
                <span className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-lg flex items-center gap-1">
                  <Scale size={14} /> {article.legalReference}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Eye size={16} /> {article.viewCount}</span>
              <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(article.updatedAt).toLocaleDateString('ru-RU')}</span>
              {article.author && <span className="flex items-center gap-1"><User size={16} /> {article.author.name}</span>}
            </div>
          </div>

          {/* Summary */}
          <div className="card p-6 mb-6 border-l-4 border-primary-500">
            <p className="text-lg text-slate-700 dark:text-slate-300">{article.summary}</p>
          </div>

          {/* Content */}
          <div className="card p-8 mb-6 prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>').replace(/^# (.+)$/gm, '<h1>$1</h1>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^- (.+)$/gm, '<li>$1</li>').replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>') }} />
          </div>

          {/* Response Template */}
          {article.responseTemplate && (
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Шаблон ответа</h2>
                <button
                  onClick={copyTemplate}
                  className={`btn-secondary text-sm flex items-center gap-2 ${copied ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}`}
                >
                  {copied ? <><Check size={16} /> Скопировано</> : <><Copy size={16} /> Копировать</>}
                </button>
              </div>
              <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                {article.responseTemplate}
              </pre>
            </div>
          )}

          {/* Example Appeals */}
          {article.appeals?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Примеры обращений</h2>
              <div className="space-y-3">
                {article.appeals.map((appeal: any, i: number) => (
                  <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleExample(i)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <span className="font-medium">Пример #{i + 1}</span>
                      <ChevronDown size={20} className={`transition-transform ${expandedExamples.has(i) ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedExamples.has(i) && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        className="border-t border-slate-200 dark:border-slate-700"
                      >
                        <div className="p-4 space-y-4">
                          <div>
                            <div className="text-sm font-medium text-slate-500 mb-1">Текст обращения:</div>
                            <p className="text-sm">{appeal.appealText}</p>
                          </div>
                          {appeal.responseText && (
                            <div>
                              <div className="text-sm font-medium text-slate-500 mb-1">Ответ:</div>
                              <p className="text-sm">{appeal.responseText}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold mb-4">Ключевые слова</h3>
            <div className="flex flex-wrap gap-2">
              {article.keywords?.map((kw: string, i: number) => (
                <Link
                  key={i}
                  to={`/search?q=${encodeURIComponent(kw)}`}
                  className="text-sm bg-slate-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 px-3 py-1 rounded-lg transition-colors"
                >
                  {kw}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
