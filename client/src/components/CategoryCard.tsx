import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    code: string;
    description?: string;
    icon?: string;
    articleCount?: number;
  };
  index?: number;
}

export default function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const IconComponent = category.icon ? (Icons as any)[category.icon] || Icons.Folder : Icons.Folder;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/category/${category.slug}`}
        className="card p-6 block group hover:border-primary-500/30 dark:hover:border-primary-400/30 border border-transparent"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <IconComponent className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                {category.code}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {category.description}
              </p>
            )}
            {typeof category.articleCount === 'number' && (
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {category.articleCount} {category.articleCount === 1 ? 'статья' : 
                  category.articleCount < 5 ? 'статьи' : 'статей'}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
