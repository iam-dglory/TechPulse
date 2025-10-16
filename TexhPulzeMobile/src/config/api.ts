/**
 * API Configuration for TexhPulze Mobile App
 * 
 * This file contains API endpoint configurations for different environments
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API Configuration Interface
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

/**
 * Development API Configuration
 * Update this IP address to match your local machine's IP
 * 
 * To find your IP address:
 * - Windows: ipconfig
 * - macOS/Linux: ifconfig | grep "inet "
 * 
 * Or run: npm run setup:local
 */
const DEVELOPMENT_CONFIG: ApiConfig = {
  baseUrl: "http://192.168.X.X:8090/api", // Replace with your local IP
  timeout: 10000,
  retryAttempts: 3,
};

/**
 * Staging API Configuration
 */
const STAGING_CONFIG: ApiConfig = {
  baseUrl: "https://texhpulze-staging.onrender.com/api",
  timeout: 15000,
  retryAttempts: 2,
};

/**
 * Production API Configuration
 */
const PRODUCTION_CONFIG: ApiConfig = {
  baseUrl: "https://texhpulze.onrender.com/api",
  timeout: 15000,
  retryAttempts: 2,
};

/**
 * Get API configuration based on environment
 */
export function getApiConfig(): ApiConfig {
  const environment = __DEV__ ? 'development' : 'production';
  
  switch (environment) {
    case 'development':
      return DEVELOPMENT_CONFIG;
    case 'staging':
      return STAGING_CONFIG;
    case 'production':
    default:
      return PRODUCTION_CONFIG;
  }
}

/**
 * Get API base URL for current environment
 */
export function getApiBaseUrl(): string {
  const config = getApiConfig();
  return config.baseUrl;
}

/**
 * Get API timeout for current environment
 */
export function getApiTimeout(): number {
  const config = getApiConfig();
  return config.timeout;
}

/**
 * Get API retry attempts for current environment
 */
export function getApiRetryAttempts(): number {
  const config = getApiConfig();
  return config.retryAttempts;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return __DEV__;
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

/**
 * Get device platform
 */
export function getPlatform(): string {
  return Platform.OS;
}

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  
  // Stories
  STORIES: {
    LIST: '/stories',
    DETAIL: (id: string) => `/stories/${id}`,
    CREATE: '/stories',
    UPDATE: (id: string) => `/stories/${id}`,
    VOTE: (id: string) => `/stories/${id}/discussions`,
    ELI5: (id: string) => `/stories/${id}/eli5`,
    RECOMMENDED: '/stories/recommended',
  },
  
  // Companies
  COMPANIES: {
    LIST: '/companies',
    DETAIL: (id: string) => `/companies/${id}`,
    CREATE: '/companies',
    UPDATE: (id: string) => `/companies/${id}`,
    CLAIM: '/companies/claim',
    PRODUCTS: (id: string) => `/companies/${id}/products`,
  },
  
  // User Impact
  USER_IMPACT: {
    GET: (userId: string) => `/users/${userId}/impact`,
    UPDATE: (userId: string) => `/users/${userId}/impact`,
  },
  
  // Daily Briefs
  BRIEFS: {
    DAILY: '/briefs/daily',
    GENERATE: '/briefs/generate',
  },
  
  // ELI5 Suggestions
  ELI5_SUGGESTIONS: {
    LIST: '/eli5-suggestions',
    CREATE: '/eli5-suggestions',
    VOTE: (id: string) => `/eli5-suggestions/${id}/vote`,
  },
  
  // Graveyard
  GRAVEYARD: {
    LIST: '/graveyard',
    DETAIL: (id: string) => `/graveyard/${id}`,
    CREATE: '/graveyard',
  },
  
  // Admin
  ADMIN: {
    CLAIMS: '/admin/claims',
    APPROVE_CLAIM: (id: string) => `/admin/claims/${id}/approve`,
    REJECT_CLAIM: (id: string) => `/admin/claims/${id}/reject`,
    FLAGS: '/admin/flags',
    REVIEW_FLAG: (id: string) => `/admin/flags/${id}/review`,
  },
  
  // Health & Status
  HEALTH: {
    API: '/health',
    DATABASE: '/health/database',
    REDIS: '/health/redis',
    ANALYTICS: '/health/analytics',
  },
} as const;

/**
 * Helper function to build full API URL
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
}

/**
 * Development utilities
 */
export const DEV_UTILS = {
  /**
   * Log API configuration (development only)
   */
  logConfig(): void {
    if (__DEV__) {
      const config = getApiConfig();
      console.log('🔧 API Configuration:', {
        baseUrl: config.baseUrl,
        timeout: config.timeout,
        retryAttempts: config.retryAttempts,
        platform: getPlatform(),
        environment: __DEV__ ? 'development' : 'production',
      });
    }
  },
  
  /**
   * Test API connectivity (development only)
   */
  async testConnectivity(): Promise<boolean> {
    if (!__DEV__) return true;
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/health`);
      const isConnected = response.ok;
      
      console.log(`🌐 API Connectivity: ${isConnected ? '✅ Connected' : '❌ Failed'}`);
      return isConnected;
    } catch (error) {
      console.log('❌ API Connectivity: Failed to connect');
      return false;
    }
  },
};

export default {
  getApiConfig,
  getApiBaseUrl,
  getApiTimeout,
  getApiRetryAttempts,
  isDevelopment,
  isIOS,
  isAndroid,
  getPlatform,
  API_ENDPOINTS,
  buildApiUrl,
  DEV_UTILS,
};
