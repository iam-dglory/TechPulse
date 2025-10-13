import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_URL = process.env.API_URL || 'https://texhpulze.onrender.com/api';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Production API URL for TexhPulze on Render
    this.baseURL = API_URL;
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


  // Discussion endpoints
  async getDiscussions(params?: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/discussions', { params });
    return response.data;
  }

  // Fetch-based methods (as requested)
  async getPosts(): Promise<any> {
    return fetch(`${API_URL}/posts`).then(r => r.json());
  }

  async getPostById(id: number): Promise<any> {
    return fetch(`${API_URL}/posts/${id}`).then(r => r.json());
  }

  async createPost(payload: any): Promise<any> {
    return fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  }

  async votePost(id: number, voteType: string): Promise<any> {
    return fetch(`${API_URL}/posts/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: voteType })
    }).then(r => r.json());
  }
}

export default new ApiService();
