import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

interface AppState {
  theme: 'light' | 'dark';
  user: User | null;
  accessToken: string | null;
  searchHistory: string[];
  toggleTheme: () => void;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
  addSearchQuery: (query: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      user: null,
      accessToken: null,
      searchHistory: [],
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        set({ theme: newTheme });
      },
      
      setUser: (user, accessToken) => set({ user, accessToken }),
      
      logout: () => set({ user: null, accessToken: null }),
      
      addSearchQuery: (query) => {
        const history = get().searchHistory.filter(q => q !== query);
        set({ searchHistory: [query, ...history].slice(0, 10) });
      }
    }),
    { name: 'gis-kb-storage' }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('gis-kb-storage');
  if (stored) {
    const { state } = JSON.parse(stored);
    document.documentElement.classList.toggle('dark', state?.theme === 'dark');
  }
}
