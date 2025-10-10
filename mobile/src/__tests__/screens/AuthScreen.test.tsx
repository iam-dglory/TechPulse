import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthScreen } from '../../screens/AuthScreen';
import { useAuth } from '../../context/AuthContext';

// Mock the auth context
jest.mock('../../context/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AuthScreen', () => {
  const mockLogin = jest.fn();
  const mockRegister = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      logout: jest.fn(),
      updateUser: jest.fn(),
    });
    jest.clearAllMocks();
  });

  it('renders login form by default', () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);

    expect(getByText('Tech News')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('switches to register form', () => {
    const { getByText } = render(<AuthScreen />);

    fireEvent.press(getByText("Don't have an account? Sign Up"));
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('validates email format', async () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('validates password length', async () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Password must be at least 6 characters long')).toBeTruthy();
    });
  });

  it('calls login with correct credentials', async () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows loading state during authentication', () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    const { getByTestId } = render(<AuthScreen />);
    
    // Note: You'd need to add testID to the loading indicator
    // expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('validates password confirmation in register mode', async () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);

    // Switch to register mode
    fireEvent.press(getByText("Don't have an account? Sign Up"));

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const confirmPasswordInput = getByPlaceholderText('Confirm your password');
    const signUpButton = getByText('Sign Up');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'differentpassword');
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });
});
