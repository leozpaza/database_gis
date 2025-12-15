import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Calendar, FileText } from 'lucide-react';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    viewCount: number;
    updatedAt: string;
    category?: { name: string; code: string };
    responseTemplate?: string;
  };
  index?: number;
}

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/article/${article.slug}`}
        className="card p-5 block group hover:border-primary-500/30 border border-transparent"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {article.category && (
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-lg">
                {article.category.code}
              </span>
            )}
            {article.responseTemplate && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <FileText size={12} /> Шаблон
              </span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
          {article.summary}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Eye size={14} /> {article.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} /> {new Date(article.updatedAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
