// User types
export interface User {
  id: number;
  email: string;
  created_at: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  categories: string[];
  notification_settings: {
    email: boolean;
    push: boolean;
  };
}

// Article types
export interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  published_at: string;
  image_url?: string;
  created_at?: string;
}

export interface Favorite {
  favorite_id: number;
  favorited_at: string;
  id: number;
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  published_at: string;
  image_url?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: PaginationResponse;
}

export interface FavoritesResponse {
  favorites: Favorite[];
  pagination: PaginationResponse;
}

export interface CategoriesResponse {
  categories: Array<{
    category: string;
    count: number;
  }>;
}

export interface SourcesResponse {
  sources: Array<{
    source: string;
    count: number;
  }>;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Search types
export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
}

// Filter types
export interface FilterParams {
  category?: string;
  source?: string;
  page?: number;
  limit?: number;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ArticleDetail: { article: Article };
  Search: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Favorites: undefined;
  Profile: undefined;
};

// Component props types
export interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
  onFavorite: (articleId: number) => void;
  isFavorited?: boolean;
}

export interface CategoryFilterProps {
  categories: Array<{ category: string; count: number }>;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}
