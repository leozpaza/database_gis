import { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, FolderTree, Upload, Plus, Edit, Trash2, Save, X, BarChart3 } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../store';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['stats'], queryFn: api.adminGetStats });
  if (isLoading) return <LoadingSpinner />;
  const stats = data?.data || {};
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Статьи', value: stats.articles, icon: FileText, color: 'blue' },
        { label: 'Категории', value: stats.categories, icon: FolderTree, color: 'green' },
        { label: 'Обращения', value: stats.appeals, icon: BarChart3, color: 'purple' },
        { label: 'Просмотры', value: stats.totalViews, icon: BarChart3, color: 'orange' }
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card p-6">
          <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div className="text-2xl font-bold">{value || 0}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      ))}
    </div>
  );
}

function ArticlesList() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const { data: articles, isLoading } = useQuery({ queryKey: ['admin-articles'], queryFn: () => api.adminGetArticles() });
  const { data: categories } = useQuery({ queryKey: ['admin-categories'], queryFn: api.adminGetCategories });

  const createMutation = useMutation({
    mutationFn: api.adminCreateArticle,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-articles'] }); setEditing(null); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.adminUpdateArticle(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-articles'] }); setEditing(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: api.adminDeleteArticle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
  });

  const handleSave = () => {
    if (editing.id) updateMutation.mutate({ id: editing.id, data: editing });
    else createMutation.mutate(editing);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Статьи</h2>
        <button onClick={() => setEditing({ title: '', summary: '', content: '', categoryId: '', keywords: [], isPublished: false })} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Создать
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 mb-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">{editing.id ? 'Редактирование' : 'Новая статья'}</h3>
            <button onClick={() => setEditing(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={20} /></button>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Категория</label>
              <select value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })} className="input">
                <option value="">Выберите...</option>
                {categories?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Заголовок</label>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Краткое описание</label>
              <textarea value={editing.summary} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} rows={2} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Содержимое</label>
              <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={8} className="input font-mono text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Шаблон ответа</label>
              <textarea value={editing.responseTemplate || ''} onChange={(e) => setEditing({ ...editing, responseTemplate: e.target.value })} rows={5} className="input font-mono text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ключевые слова (через запятую)</label>
              <input value={editing.keywords?.join(', ') || ''} onChange={(e) => setEditing({ ...editing, keywords: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} className="input" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={editing.isPublished} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} />
              <label htmlFor="published">Опубликовано</label>
            </div>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2 justify-center">
              <Save size={18} /> Сохранить
            </button>
          </div>
        </motion.div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="text-left p-4 font-medium">Заголовок</th>
              <th className="text-left p-4 font-medium hidden md:table-cell">Категория</th>
              <th className="text-left p-4 font-medium hidden sm:table-cell">Статус</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {articles?.data?.articles?.map((a: any) => (
              <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="p-4">{a.title}</td>
                <td className="p-4 hidden md:table-cell text-slate-500">{a.category?.code}</td>
                <td className="p-4 hidden sm:table-cell">
                  <span className={`text-xs px-2 py-1 rounded ${a.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {a.isPublished ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(a)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><Edit size={16} /></button>
                    <button onClick={() => { if (confirm('Удалить?')) deleteMutation.mutate(a.id); }} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesList() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const { data, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: api.adminGetCategories });

  const createMutation = useMutation({
    mutationFn: api.adminCreateCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setEditing(null); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.adminUpdateCategory(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setEditing(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: api.adminDeleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
  });

  const handleSave = () => {
    if (editing.id) updateMutation.mutate({ id: editing.id, data: editing });
    else createMutation.mutate(editing);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Категории</h2>
        <button onClick={() => setEditing({ code: '', name: '', description: '', icon: '' })} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Создать
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 mb-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">{editing.id ? 'Редактирование' : 'Новая категория'}</h3>
            <button onClick={() => setEditing(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={20} /></button>
          </div>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Код</label>
                <input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} className="input" placeholder="12.14" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Иконка (Lucide)</label>
                <input value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="input" placeholder="Sparkles" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Название</label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="input" />
            </div>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2 justify-center">
              <Save size={18} /> Сохранить
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data?.map((c: any) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{c.code}</span>
                <h3 className="font-semibold mt-2">{c.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{c._count?.articles || 0} статей</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(c)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><Edit size={16} /></button>
                <button onClick={() => { if (confirm('Удалить?')) deleteMutation.mutate(c.id); }} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: () => api.adminImport(file!),
    onSuccess: (data) => {
      setResult(data.data);
      queryClient.invalidateQueries();
    }
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Импорт из Excel</h2>
      <div className="card p-8">
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300 mb-4">Загрузите Excel-файл с обращениями</p>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="file-input" />
          <label htmlFor="file-input" className="btn-secondary cursor-pointer inline-block">
            Выбрать файл
          </label>
          {file && <p className="mt-4 text-sm text-slate-500">{file.name}</p>}
        </div>
        {file && (
          <button onClick={() => importMutation.mutate()} disabled={importMutation.isPending} className="btn-primary w-full mt-4">
            {importMutation.isPending ? 'Импорт...' : 'Начать импорт'}
          </button>
        )}
        {result && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <h3 className="font-semibold mb-2">Результаты импорта</h3>
            <p>Успешно: {result.success}</p>
            <p>Ошибок: {result.errors}</p>
            <p>Пропущено: {result.skipped}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user } = useStore();
  const location = useLocation();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
    return <Navigate to="/login" replace />;
  }

  const tabs = [
    { path: '/admin', label: 'Обзор', icon: LayoutDashboard },
    { path: '/admin/articles', label: 'Статьи', icon: FileText },
    { path: '/admin/categories', label: 'Категории', icon: FolderTree },
    { path: '/admin/import', label: 'Импорт', icon: Upload }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Админ-панель</h1>
      
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              location.pathname === path
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Icon size={18} /> {label}
          </Link>
        ))}
      </div>

      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="articles" element={<ArticlesList />} />
        <Route path="categories" element={<CategoriesList />} />
        <Route path="import" element={<ImportPage />} />
      </Routes>
    </div>
  );
}
