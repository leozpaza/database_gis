// Shared types for GIS ZKH Knowledge Base

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  children?: Category[];
  articleCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id: string;
  categoryId: string;
  category?: Category;
  title: string;
  slug: string;
  summary: string;
  content: string;
  responseTemplate?: string;
  legalReference?: string;
  keywords: string[];
  viewCount: number;
  isPublished: boolean;
  authorId: string;
  author?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appeal {
  id: string;
  gisId: string;
  number: string;
  categoryId: string;
  category?: Category;
  appealText: string;
  responseText?: string;
  address?: string;
  linkedArticleId?: string;
  linkedArticle?: Article;
  createdAt: Date;
}

export interface SearchResult {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  q?: string;
  categoryId?: string;
  hasTemplate?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'relevance' | 'date' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ImportResult {
  success: number;
  errors: number;
  skipped: number;
  details: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
