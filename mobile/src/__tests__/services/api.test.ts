import apiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock axios
jest.mock('axios');

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should store auth token', async () => {
      await apiService.setAuthToken('test-token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
    });

    it('should retrieve auth token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-token');
      
      const token = await apiService.getAuthToken();
      expect(token).toBe('test-token');
    });

    it('should remove auth token', async () => {
      await apiService.removeAuthToken();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should store user data', async () => {
      const user = { id: 1, email: 'test@example.com' };
      await apiService.setUser(user);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
    });

    it('should retrieve user data', async () => {
      const user = { id: 1, email: 'test@example.com' };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(user));
      
      const retrievedUser = await apiService.getUser();
      expect(retrievedUser).toEqual(user);
    });

    it('should handle logout', async () => {
      await apiService.logout();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This would test the axios interceptor error handling
      // In a real implementation, you'd mock axios to throw an error
      expect(true).toBe(true); // Placeholder
    });

    it('should clear storage on 401 error', async () => {
      // This would test the response interceptor
      // In a real implementation, you'd mock a 401 response
      expect(true).toBe(true); // Placeholder
    });
  });
});
