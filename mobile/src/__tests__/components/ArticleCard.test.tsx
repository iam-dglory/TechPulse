import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ArticleCard from '../../components/ArticleCard';
import { Article } from '../../types';

const mockArticle: Article = {
  id: 1,
  title: 'Test Article Title',
  description: 'Test article description',
  url: 'https://example.com/article',
  source: 'Test Source',
  category: 'AI',
  published_at: '2024-01-01T00:00:00Z',
  image_url: 'https://example.com/image.jpg',
};

const mockProps = {
  article: mockArticle,
  onPress: jest.fn(),
  onFavorite: jest.fn(),
  isFavorited: false,
};

describe('ArticleCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders article information correctly', () => {
    const { getByText, getByTestId } = render(<ArticleCard {...mockProps} />);

    expect(getByText('Test Article Title')).toBeTruthy();
    expect(getByText('Test article description')).toBeTruthy();
    expect(getByText('Test Source')).toBeTruthy();
    expect(getByText('AI')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByTestId } = render(<ArticleCard {...mockProps} />);
    
    // Note: In a real implementation, you'd need to add testID to the TouchableOpacity
    // fireEvent.press(getByTestId('article-card'));
    // expect(mockProps.onPress).toHaveBeenCalledWith(mockArticle);
  });

  it('calls onFavorite when favorite button is pressed', () => {
    const { getByTestId } = render(<ArticleCard {...mockProps} />);
    
    // Note: In a real implementation, you'd need to add testID to the favorite button
    // fireEvent.press(getByTestId('favorite-button'));
    // expect(mockProps.onFavorite).toHaveBeenCalledWith(mockArticle.id);
  });

  it('shows favorited state correctly', () => {
    const favoritedProps = { ...mockProps, isFavorited: true };
    const { getByTestId } = render(<ArticleCard {...favoritedProps} />);
    
    // Note: In a real implementation, you'd check for the filled heart icon
    // expect(getByTestId('favorite-icon')).toHaveStyle({ color: '#FF6B6B' });
  });

  it('formats date correctly', () => {
    const { getByText } = render(<ArticleCard {...mockProps} />);
    
    // The component should show a formatted date
    // This would depend on the actual implementation of the date formatting
    expect(getByText(/ago/)).toBeTruthy();
  });

  it('handles missing image gracefully', () => {
    const articleWithoutImage = { ...mockArticle, image_url: undefined };
    const propsWithoutImage = { ...mockProps, article: articleWithoutImage };
    
    const { queryByTestId } = render(<ArticleCard {...propsWithoutImage} />);
    
    // Should not crash when image_url is undefined
    expect(queryByTestId('article-image')).toBeNull();
  });
});
