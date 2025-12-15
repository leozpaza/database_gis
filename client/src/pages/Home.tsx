import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, BookOpen } from 'lucide-react';
import { api } from '../api';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const { data: categories, isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories
  });

  const { data: popular } = useQuery({
    queryKey: ['popular'],
    queryFn: api.getPopularArticles
  });

  const { data: recent } = useQuery({
    queryKey: ['recent'],
    queryFn: api.getRecentArticles
  });

  if (loadingCats) return <LoadingSpinner />;

  return (
    <div className="animate-in">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 rounded-3xl -z-10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 rounded-3xl -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto px-4"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            База знаний <span className="text-primary-600 dark:text-primary-400">ГИС ЖКХ</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Быстрый поиск инструкций и шаблонов ответов для обработки обращений граждан
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar large autoFocus />
          </div>
        </motion.div>
      </section>

      {/* Categories Bento Grid */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Темы обращений</h2>
        </div>
        <div className="bento-grid">
          {categories?.data?.map((cat: any, i: number) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </section>

      {/* Popular & Recent Articles */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Popular */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Популярные статьи</h2>
          </div>
          <div className="space-y-4">
            {popular?.data?.slice(0, 5).map((article: any, i: number) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </section>

        {/* Recent */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Недавно обновлённые</h2>
          </div>
          <div className="space-y-4">
            {recent?.data?.slice(0, 5).map((article: any, i: number) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
