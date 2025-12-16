const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('gis-kb-storage');
  const accessToken = token ? JSON.parse(token).state?.accessToken : null;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options?.headers
    }
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const errorMessage = typeof data === 'object' && data !== null ? data.error : String(data || 'Request failed');
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchAPI<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  
  register: (email: string, password: string, name: string) =>
    fetchAPI<any>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  
  getMe: () => fetchAPI<any>('/auth/me'),

  // Categories
  getCategories: () => fetchAPI<any>('/categories'),
  getCategory: (slug: string) => fetchAPI<any>(`/categories/${slug}`),

  // Articles
  getArticles: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI<any>(`/articles${query}`);
  },
  getArticle: (slug: string) => fetchAPI<any>(`/articles/${slug}`),
  getPopularArticles: () => fetchAPI<any>('/articles/popular'),
  getRecentArticles: () => fetchAPI<any>('/articles/recent'),

  // Search
  search: (params: Record<string, string>) =>
    fetchAPI<any>(`/search?${new URLSearchParams(params).toString()}`),
  getSuggestions: (q: string) => fetchAPI<any>(`/search/suggestions?q=${encodeURIComponent(q)}`),

  // Admin
  adminGetArticles: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI<any>(`/admin/articles${query}`);
  },
  adminCreateArticle: (data: any) =>
    fetchAPI<any>('/admin/articles', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateArticle: (id: string, data: any) =>
    fetchAPI<any>(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteArticle: (id: string) =>
    fetchAPI<any>(`/admin/articles/${id}`, { method: 'DELETE' }),
  
  adminGetCategories: () => fetchAPI<any>('/admin/categories'),
  adminCreateCategory: (data: any) =>
    fetchAPI<any>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateCategory: (id: string, data: any) =>
    fetchAPI<any>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteCategory: (id: string) =>
    fetchAPI<any>(`/admin/categories/${id}`, { method: 'DELETE' }),
  
  adminGetStats: () => fetchAPI<any>('/admin/stats'),
  
  adminImport: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('gis-kb-storage');
    const accessToken = token ? JSON.parse(token).state?.accessToken : null;
    
    const res = await fetch(`${API_BASE}/admin/import`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData
    });
    return res.json();
  }
};
