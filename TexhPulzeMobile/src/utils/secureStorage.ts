import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage utility for handling authentication tokens and sensitive data
 * Falls back to AsyncStorage if SecureStore is not available
 */
class SecureStorage {
  /**
   * Store a value securely
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      // Try to use SecureStore first (more secure)
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn(`SecureStore failed for key ${key}, falling back to AsyncStorage:`, error);
      // Fallback to AsyncStorage
      await AsyncStorage.setItem(key, value);
    }
  }

  /**
   * Retrieve a value securely
   */
  async getItem(key: string): Promise<string | null> {
    try {
      // Try SecureStore first
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`SecureStore failed for key ${key}, falling back to AsyncStorage:`, error);
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(key);
    }
  }

  /**
   * Remove a value securely
   */
  async removeItem(key: string): Promise<void> {
    try {
      // Try SecureStore first
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn(`SecureStore failed for key ${key}, falling back to AsyncStorage:`, error);
      // Fallback to AsyncStorage
      await AsyncStorage.removeItem(key);
    }
  }

  /**
   * Store authentication token
   */
  async setAuthToken(token: string): Promise<void> {
    await this.setItem('authToken', token);
  }

  /**
   * Get authentication token
   */
  async getAuthToken(): Promise<string | null> {
    return await this.getItem('authToken');
  }

  /**
   * Remove authentication token
   */
  async removeAuthToken(): Promise<void> {
    await this.removeItem('authToken');
  }

  /**
   * Store refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    await this.setItem('refreshToken', token);
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await this.getItem('refreshToken');
  }

  /**
   * Remove refresh token
   */
  async removeRefreshToken(): Promise<void> {
    await this.removeItem('refreshToken');
  }

  /**
   * Clear all stored tokens
   */
  async clearAllTokens(): Promise<void> {
    await Promise.all([
      this.removeAuthToken(),
      this.removeRefreshToken(),
    ]);
  }

  /**
   * Check if device supports SecureStore
   */
  async isSecureStoreAvailable(): Promise<boolean> {
    try {
      await SecureStore.setItemAsync('test_key', 'test_value');
      await SecureStore.deleteItemAsync('test_key');
      return true;
    } catch {
      return false;
    }
  }
}

export default new SecureStorage();
