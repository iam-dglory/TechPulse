import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
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
    // Production API URL for TexhPulze on Render
    this.baseURL = 'https://texhpulze.onrender.com/api';
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

    // Response interceptor to handle errors and show toasts
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Handle network errors
        if (!error.response) {
          Toast.show({
            type: 'error',
            text1: 'Network Error',
            text2: 'Please check your internet connection',
            visibilityTime: 4000,
          });
        } else {
          // Handle HTTP errors
          switch (error.response.status) {
            case 401:
              await AsyncStorage.removeItem('authToken');
              Toast.show({
                type: 'error',
                text1: 'Authentication Error',
                text2: 'Please login again',
                visibilityTime: 3000,
              });
              break;
            case 500:
              Toast.show({
                type: 'error',
                text1: 'Server Error',
                text2: 'Something went wrong. Please try again later.',
                visibilityTime: 4000,
              });
              break;
            default:
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response.data?.error || 'An unexpected error occurred',
                visibilityTime: 3000,
              });
          }
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

  // Health check endpoint
  async checkHealth(): Promise<any> {
    try {
      const response: AxiosResponse<any> = await axios.get('https://texhpulze.onrender.com/health', {
        timeout: 10000,
      });
      
      if (response.data.status === 'ok') {
        Toast.show({
          type: 'success',
          text1: 'Server Connected',
          text2: `TexhPulze API is running (${response.data.database})`,
          visibilityTime: 3000,
        });
      }
      
      return response.data;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Server Offline',
        text2: 'Unable to connect to TexhPulze server',
        visibilityTime: 4000,
      });
      throw error;
    }
  }

  // Posts endpoints (for grievances and AI news)
  async getPosts(params?: any): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.get('/posts', { params });
      
      // Handle empty responses gracefully
      if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
        Toast.show({
          type: 'info',
          text1: 'No Posts Found',
          text2: 'Be the first to post a grievance or AI news!',
          visibilityTime: 3000,
        });
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Return empty array for graceful fallback
      return [];
    }
  }

  async createPost(post: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/posts', post);
    
    if (response.data) {
      Toast.show({
        type: 'success',
        text1: 'Post Created',
        text2: 'Your post has been submitted successfully',
        visibilityTime: 3000,
      });
    }
    
    return response.data;
  }

  async votePost(id: number, voteType: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(`/posts/${id}/vote`, { vote_type: voteType });
    
    if (response.data?.success) {
      Toast.show({
        type: 'success',
        text1: 'Vote Recorded',
        text2: `Your ${voteType}vote has been recorded`,
        visibilityTime: 2000,
      });
    }
    
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
