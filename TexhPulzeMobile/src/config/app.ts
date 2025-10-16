import Constants from 'expo-constants';
import { getApiBaseUrl as getApiBaseUrlFromConfig } from './api';

/**
 * App configuration utility for accessing environment variables and app settings
 */
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
}

/**
 * Get app configuration from Expo Constants
 */
export function getAppConfig(): AppConfig {
  const extra = Constants.expoConfig?.extra || {};
  
  return {
    apiBaseUrl: getApiBaseUrlFromConfig(),
    environment: __DEV__ ? 'development' : 'production',
    debug: __DEV__,
  };
}

/**
 * Get API base URL from app configuration
 */
export function getApiBaseUrl(): string {
  return getApiBaseUrlFromConfig();
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getAppConfig().environment === 'development';
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return getAppConfig().debug;
}
