import axios from 'axios';

class ApiService {
  constructor() {
    // Get API URL from environment variable
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(credentials) {
    const response = await this.api.post('/auth/register', credentials);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async updatePreferences(preferences) {
    const response = await this.api.put('/auth/preferences', preferences);
    return response.data;
  }

  // Article methods
  async getArticles(params = {}) {
    const response = await this.api.get('/articles', { params });
    return response.data;
  }

  async searchArticles(params) {
    const response = await this.api.get('/articles/search', { params });
    return response.data;
  }

  async getArticleById(id) {
    const response = await this.api.get(`/articles/${id}`);
    return response.data;
  }

  async getCategories() {
    const response = await this.api.get('/articles/categories');
    return response.data;
  }

  async getSources() {
    const response = await this.api.get('/articles/sources');
    return response.data;
  }

  async getTrendingArticles(limit = 10) {
    const response = await this.api.get('/articles/trending', { params: { limit } });
    return response.data;
  }

  async refreshNews() {
    const response = await this.api.post('/articles/refresh');
    return response.data;
  }

  // Favorites methods
  async getFavorites(params = {}) {
    const response = await this.api.get('/favorites', { params });
    return response.data;
  }

  async addFavorite(articleId) {
    const response = await this.api.post('/favorites', { articleId });
    return response.data;
  }

  async removeFavorite(articleId) {
    const response = await this.api.delete(`/favorites/${articleId}`);
    return response.data;
  }

  async checkFavorite(articleId) {
    const response = await this.api.get(`/favorites/${articleId}`);
    return response.data;
  }

  async toggleFavorite(articleId) {
    const response = await this.api.post('/favorites/toggle', { articleId });
    return response.data;
  }

  // Utility methods
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }

  removeUser() {
    localStorage.removeItem('user');
  }

  logout() {
    this.removeAuthToken();
    this.removeUser();
  }
}

export default new ApiService();
