import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ArticlesResponse,
  FavoritesResponse,
  CategoriesResponse,
  SourcesResponse,
  FilterParams,
  SearchParams,
  User,
  UserPreferences,
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use your computer's IP address instead of localhost for mobile testing
    this.baseURL = 'http://192.168.29.31:5000/api'; // Your computer's IP address
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage and redirect to login
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
          // You can emit an event here to trigger navigation to login
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', credentials);
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<{ message: string; preferences: UserPreferences }> {
    const response = await this.api.put('/auth/preferences', preferences);
    return response.data;
  }

  // Article methods
  async getArticles(params: FilterParams = {}): Promise<ArticlesResponse> {
    const response = await this.api.get('/articles', { params });
    return response.data;
  }

  async searchArticles(params: SearchParams): Promise<ArticlesResponse> {
    const response = await this.api.get('/articles/search', { params });
    return response.data;
  }

  async getArticleById(id: number): Promise<{ article: any }> {
    const response = await this.api.get(`/articles/${id}`);
    return response.data;
  }

  async getCategories(): Promise<CategoriesResponse> {
    const response = await this.api.get('/articles/categories');
    return response.data;
  }

  async getSources(): Promise<SourcesResponse> {
    const response = await this.api.get('/articles/sources');
    return response.data;
  }

  async getTrendingArticles(limit: number = 10): Promise<{ articles: any[] }> {
    const response = await this.api.get('/articles/trending', { params: { limit } });
    return response.data;
  }

  async refreshNews(): Promise<{ message: string; result: any }> {
    const response = await this.api.post('/articles/refresh');
    return response.data;
  }

  // Favorites methods
  async getFavorites(params: { page?: number; limit?: number } = {}): Promise<FavoritesResponse> {
    const response = await this.api.get('/favorites', { params });
    return response.data;
  }

  async addFavorite(articleId: number): Promise<{ message: string; articleId: number }> {
    const response = await this.api.post('/favorites', { articleId });
    return response.data;
  }

  async removeFavorite(articleId: number): Promise<{ message: string; articleId: number }> {
    const response = await this.api.delete(`/favorites/${articleId}`);
    return response.data;
  }

  async checkFavorite(articleId: number): Promise<{ isFavorited: boolean; articleId: number }> {
    const response = await this.api.get(`/favorites/${articleId}`);
    return response.data;
  }

  async toggleFavorite(articleId: number): Promise<{ message: string; isFavorited: boolean; articleId: number }> {
    const response = await this.api.post('/favorites/toggle', { articleId });
    return response.data;
  }

  // Utility methods
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
  }

  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  async removeAuthToken(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  }

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  }

  async getUser(): Promise<User | null> {
    const userString = await AsyncStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem('user');
  }

  async logout(): Promise<void> {
    await this.removeAuthToken();
    await this.removeUser();
  }
}

export default new ApiService();
