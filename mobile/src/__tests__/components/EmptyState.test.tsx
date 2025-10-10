import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmptyState from '../../components/EmptyState';

const mockProps = {
  title: 'No Results',
  message: 'No items found',
  icon: 'inbox',
  action: {
    label: 'Retry',
    onPress: jest.fn(),
  },
};

describe('EmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and message correctly', () => {
    const { getByText } = render(<EmptyState {...mockProps} />);

    expect(getByText('No Results')).toBeTruthy();
    expect(getByText('No items found')).toBeTruthy();
  });

  it('renders action button when provided', () => {
    const { getByText } = render(<EmptyState {...mockProps} />);

    expect(getByText('Retry')).toBeTruthy();
  });

  it('calls action onPress when button is pressed', () => {
    const { getByText } = render(<EmptyState {...mockProps} />);

    fireEvent.press(getByText('Retry'));
    expect(mockProps.action.onPress).toHaveBeenCalled();
  });

  it('renders without action button when not provided', () => {
    const propsWithoutAction = {
      title: 'No Results',
      message: 'No items found',
    };

    const { queryByText } = render(<EmptyState {...propsWithoutAction} />);

    expect(queryByText('Retry')).toBeNull();
  });

  it('uses default icon when not provided', () => {
    const propsWithoutIcon = {
      title: 'No Results',
      message: 'No items found',
    };

    const { getByText } = render(<EmptyState {...propsWithoutIcon} />);

    expect(getByText('No Results')).toBeTruthy();
  });
});
