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
    // Use your computer's IP address for mobile testing
    this.baseURL = 'http://192.168.29.31:5000/api'; // Your computer's IP
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
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
          // You might want to redirect to login screen here
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', credentials);
    return response.data;
  }

  // Article endpoints
  async getArticles(params?: FilterParams): Promise<ArticlesResponse> {
    const response: AxiosResponse<ArticlesResponse> = await this.api.get('/articles', { params });
    return response.data;
  }

  async getArticleById(id: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/articles/${id}`);
    return response.data;
  }

  async searchArticles(params: SearchParams): Promise<ArticlesResponse> {
    const response: AxiosResponse<ArticlesResponse> = await this.api.get('/articles/search', { params });
    return response.data;
  }

  async getCategories(): Promise<CategoriesResponse> {
    const response: AxiosResponse<CategoriesResponse> = await this.api.get('/articles/categories');
    return response.data;
  }

  async getSources(): Promise<SourcesResponse> {
    const response: AxiosResponse<SourcesResponse> = await this.api.get('/articles/sources');
    return response.data;
  }

  // Favorites endpoints
  async getFavorites(): Promise<FavoritesResponse> {
    const response: AxiosResponse<FavoritesResponse> = await this.api.get('/favorites');
    return response.data;
  }

  async addFavorite(articleId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/favorites', { articleId });
    return response.data;
  }

  async removeFavorite(articleId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.delete(`/favorites/${articleId}`);
    return response.data;
  }

  // User preferences
  async getUserPreferences(): Promise<UserPreferences> {
    const response: AxiosResponse<UserPreferences> = await this.api.get('/user/preferences');
    return response.data;
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response: AxiosResponse<UserPreferences> = await this.api.put('/user/preferences', preferences);
    return response.data;
  }

  // Grievance endpoints
  async getGrievances(params?: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/grievances', { params });
    return response.data;
  }

  async submitGrievance(grievance: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/grievances', grievance);
    return response.data;
  }

  async getGrievanceById(id: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/grievances/${id}`);
    return response.data;
  }

  async voteGrievance(id: number, voteType: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(`/grievances/${id}/vote`, { vote_type: voteType });
    return response.data;
  }

  // Discussion endpoints
  async getDiscussions(params?: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/discussions', { params });
    return response.data;
  }

  async createDiscussion(discussion: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/discussions', discussion);
    return response.data;
  }

  async getDiscussionById(id: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/discussions/${id}`);
    return response.data;
  }

  async addComment(discussionId: number, comment: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(`/discussions/${discussionId}/comments`, comment);
    return response.data;
  }

  async voteDiscussion(id: number, voteType: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(`/discussions/${id}/vote`, { vote_type: voteType });
    return response.data;
  }

  // Premium/Subscription endpoints
  async getSubscription(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/subscription');
    return response.data;
  }

  async updateSubscription(plan: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/subscription', { plan_type: plan });
    return response.data;
  }

  async getEarnings(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/earnings');
    return response.data;
  }
}

export default new ApiService();
