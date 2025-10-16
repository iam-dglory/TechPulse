import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getApiBaseUrl, getApiTimeout, getApiRetryAttempts, isDevelopment, DEV_UTILS } from '../config/api';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Get API URL from app configuration
    this.baseURL = getApiBaseUrl();
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: getApiTimeout(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    
    // Log configuration in development
    if (isDevelopment()) {
      DEV_UTILS.logConfig();
    }
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
                text2: (error.response.data as any)?.error || 'An unexpected error occurred',
                visibilityTime: 3000,
              });
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Health check endpoint
  async checkHealth(): Promise<any> {
    try {
      const baseUrl = this.baseURL.replace('/api', '');
      const response: AxiosResponse<any> = await axios.get(`${baseUrl}/health`, {
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


  // Discussion endpoints
  async getDiscussions(params?: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/discussions', { params });
    return response.data;
  }

  // Companies endpoints
  async getCompanies(params?: {
    search?: string;
    sector?: string;
    ethicsScoreMin?: number;
    fundingStage?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/companies', { params });
    return response.data;
  }

  async getCompanyById(id: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/companies/${id}`);
    return response.data;
  }

  async getCompanyBySlug(slug: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/companies/slug/${slug}`);
    return response.data;
  }

  async claimCompany(companyData: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/companies/claim', companyData);
    return response.data;
  }

  // Stories endpoints
  async getStories(params?: {
    sectorTag?: string;
    companyId?: string;
    impactTag?: string;
    sort?: 'hot' | 'new' | 'top';
    recommendedFor?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/stories', { params });
    return response.data;
  }

  async getStoryById(id: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/stories/${id}`);
    return response.data;
  }

  async getStoryDiscussions(storyId: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/stories/${storyId}/discussions`);
    return response.data;
  }

  async voteOnStory(storyId: string, voteData: {
    voteValue: 'helpful' | 'harmful' | 'neutral';
    comment?: string;
    industry?: string;
  }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(`/stories/${storyId}/vote`, voteData);
    return response.data;
  }

  async getBriefs(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/stories/briefs');
    return response.data;
  }

  // Graveyard endpoints
  async getGraveyardEntries(params?: {
    search?: string;
    failureType?: string;
    companyId?: string;
    published?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/graveyard', { params });
    return response.data;
  }

  async getGraveyardEntry(id: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/graveyard/${id}`);
    return response.data;
  }

  async getGraveyardStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/graveyard/stats');
    return response.data;
  }

  // ELI5 endpoints
  async getELI5(storyId: string, mode: 'simple' | 'technical' | 'both' = 'both'): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/stories/${storyId}/eli5`, {
      params: { mode }
    });
    return response.data;
  }

  async generateELI5(storyId: string, mode: 'simple' | 'technical' | 'both' = 'both'): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(`/stories/${storyId}/eli5`, { mode });
    return response.data;
  }

  async clearELI5(storyId: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.delete(`/stories/${storyId}/eli5`);
    return response.data;
  }

  // ELI5 Suggestions endpoints
  async getELI5Suggestions(params?: {
    storyId?: string;
    status?: string;
    mode?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/eli5-suggestions', { params });
    return response.data;
  }

  async createELI5Suggestion(data: {
    storyId: string;
    mode: 'simple' | 'technical';
    suggestedText: string;
    explanation?: string;
  }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/eli5-suggestions', data);
    return response.data;
  }

  async voteOnELI5Suggestion(suggestionId: string, voteType: 'upvote' | 'downvote'): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(`/eli5-suggestions/${suggestionId}/vote`, { voteType });
    return response.data;
  }

  async updateELI5Suggestion(suggestionId: string, data: { status: 'approved' | 'rejected'; reviewNotes?: string }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.put(`/eli5-suggestions/${suggestionId}`, data);
    return response.data;
  }

  // Daily Briefs endpoints
  async getDailyBrief(params?: {
    userId?: string;
    duration?: '5' | '10' | '15';
    mode?: 'personalized' | 'trending' | 'balanced';
    limit?: number;
  }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/briefs/daily', { params });
    return response.data;
  }

  async getBriefStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/briefs/stats');
    return response.data;
  }

  // Fetch-based methods (as requested)
  async getPosts(): Promise<any> {
    return fetch(`${this.baseURL}/posts`).then(r => r.json());
  }

  async getPostById(id: number): Promise<any> {
    return fetch(`${this.baseURL}/posts/${id}`).then(r => r.json());
  }

  async createPost(payload: any): Promise<any> {
    return fetch(`${this.baseURL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  }

  async votePost(id: number, voteType: string): Promise<any> {
    return fetch(`${this.baseURL}/posts/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: voteType })
    }).then(r => r.json());
  }
}

export default new ApiService();
