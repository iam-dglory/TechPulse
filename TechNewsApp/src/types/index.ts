export interface User {
  id: number;
  username: string;
  email: string;
  preferences?: UserPreferences;
  created_at: string;
}

export interface UserPreferences {
  categories: string[];
  notification_settings: {
    push_notifications: boolean;
    email_notifications: boolean;
  };
}

export interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  published_at: string;
  image_url?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ArticlesResponse {
  page: number;
  limit: number;
  total: number;
  articles: Article[];
}

export interface FavoritesResponse {
  favorites: Article[];
}

export interface CategoriesResponse {
  categories: string[];
}

export interface SourcesResponse {
  sources: string[];
}

export interface FilterParams {
  page?: number;
  limit?: number;
  category?: string;
  source?: string;
}

export interface SearchParams extends FilterParams {
  search: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ArticleDetail: { article: Article };
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
};
