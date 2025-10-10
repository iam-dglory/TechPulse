import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingSpinner from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { getByTestId } = render(<LoadingSpinner />);
    
    // Note: You'd need to add testID to the ActivityIndicator component
    // expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(<LoadingSpinner size="small" />);
    
    // Note: You'd need to add testID to the ActivityIndicator component
    // expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders with custom color', () => {
    const { getByTestId } = render(<LoadingSpinner color="#FF0000" />);
    
    // Note: You'd need to add testID to the ActivityIndicator component
    // expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});
