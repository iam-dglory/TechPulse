import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StoryView from '../StoryView';

// Mock data
const mockStory = {
  id: '1',
  title: 'Revolutionary AI Breakthrough in Healthcare',
  content: 'A new AI system has been developed that can diagnose diseases with unprecedented accuracy. This groundbreaking technology uses machine learning algorithms trained on millions of medical records and represents a significant advancement in healthcare technology.',
  sourceUrl: 'https://example.com/ai-healthcare',
  companyId: '1',
  company: {
    id: '1',
    name: 'HealthTech AI',
    slug: 'healthtech-ai'
  },
  sectorTag: 'Healthcare AI',
  impactTags: ['healthcare', 'AI', 'medical'],
  hypeScore: 8.5,
  ethicsScore: 7.2,
  realityCheck: 'While promising, the 99% accuracy claim needs validation through peer-reviewed studies and clinical trials.',
  simpleSummary: 'AI helps doctors diagnose diseases, but needs more testing.',
  technicalSummary: 'Deep learning model trained on medical datasets shows improved diagnostic accuracy in controlled studies.',
  eli5Summary: 'AI helps doctors diagnose diseases, but needs more testing.',
  createdBy: 'user1',
  publishedAt: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

const mockRoute = {
  params: {
    storyId: '1'
  }
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn()
};

// Mock API service
jest.mock('../../services/api', () => ({
  getStory: jest.fn(() => Promise.resolve(mockStory)),
  voteOnStory: jest.fn(() => Promise.resolve({ success: true })),
  getELI5: jest.fn(() => Promise.resolve({
    simpleSummary: mockStory.simpleSummary,
    technicalSummary: mockStory.technicalSummary
  }))
}));

describe('StoryView Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StoryView 
            route={mockRoute} 
            navigation={mockNavigation} 
          />
        </NavigationContainer>
      </QueryClientProvider>
    );
  };

  test('renders story content correctly', async () => {
    const { getByText, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByText('Revolutionary AI Breakthrough in Healthcare')).toBeTruthy();
      expect(getByText('A new AI system has been developed')).toBeTruthy();
      expect(getByText('Healthcare AI')).toBeTruthy();
    });
  });

  test('displays story scores with badges', async () => {
    const { getByText, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByText('8.5')).toBeTruthy(); // Hype Score
      expect(getByText('7.2')).toBeTruthy(); // Ethics Score
      expect(getByTestId('hype-badge')).toBeTruthy();
      expect(getByTestId('ethics-badge')).toBeTruthy();
    });
  });

  test('shows impact tags', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('impact-tag-healthcare')).toBeTruthy();
      expect(getByTestId('impact-tag-AI')).toBeTruthy();
      expect(getByTestId('impact-tag-medical')).toBeTruthy();
    });
  });

  test('displays reality check panel', async () => {
    const { getByText, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByText('Reality Check')).toBeTruthy();
      expect(getByText('While promising, the 99% accuracy claim needs validation')).toBeTruthy();
    });
  });

  test('toggles ELI5 explanation', async () => {
    const { getByText, getByTestId } = renderComponent();

    await waitFor(() => {
      const eli5Toggle = getByTestId('eli5-toggle');
      expect(getByText('Simple')).toBeTruthy();
      
      fireEvent.press(eli5Toggle);
      
      expect(getByText('Technical')).toBeTruthy();
    });
  });

  test('shows voting buttons', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('vote-helpful')).toBeTruthy();
      expect(getByTestId('vote-harmful')).toBeTruthy();
      expect(getByTestId('vote-neutral')).toBeTruthy();
    });
  });

  test('handles vote submission', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      const helpfulButton = getByTestId('vote-helpful');
      fireEvent.press(helpfulButton);
    });

    const mockApi = require('../../services/api');
    expect(mockApi.voteOnStory).toHaveBeenCalledWith('1', 'helpful');
  });

  test('shows company link when available', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      const companyLink = getByText('HealthTech AI');
      fireEvent.press(companyLink);
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('CompanyProfile', {
      companyId: '1'
    });
  });

  test('displays source URL link', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      const sourceLink = getByText('View Original Source');
      fireEvent.press(sourceLink);
    });

    // Should open external link
  });

  test('shows loading state initially', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  test('handles error state', async () => {
    const mockApi = require('../../services/api');
    mockApi.getStory.mockRejectedValueOnce(new Error('Network error'));

    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Error loading story')).toBeTruthy();
    });
  });

  test('collapses and expands reality check panel', async () => {
    const { getByTestId, queryByText } = renderComponent();

    await waitFor(() => {
      const collapseButton = getByTestId('collapse-reality-check');
      fireEvent.press(collapseButton);
      
      expect(queryByText('While promising, the 99% accuracy claim needs validation')).toBeNull();
      
      const expandButton = getByTestId('expand-reality-check');
      fireEvent.press(expandButton);
      
      expect(queryByText('While promising, the 99% accuracy claim needs validation')).toBeTruthy();
    });
  });

  test('displays "What You Can Do" section', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('What You Can Do')).toBeTruthy();
      expect(getByText('Learn more about AI in healthcare')).toBeTruthy();
      expect(getByText('Check your medical data privacy settings')).toBeTruthy();
    });
  });

  test('handles refresh pull action', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      const scrollView = getByTestId('story-scroll-view');
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: -100 }
        }
      });
    });

    const mockApi = require('../../services/api');
    expect(mockApi.getStory).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  test('shows suggest better explanation button', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      const suggestButton = getByText('Suggest a Better Explanation');
      fireEvent.press(suggestButton);
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ELI5Suggestion', {
      storyId: '1'
    });
  });

  test('displays publication date', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('January 15, 2024')).toBeTruthy();
    });
  });

  test('handles story without company', async () => {
    const storyWithoutCompany = { ...mockStory, companyId: null, company: null };
    const mockApi = require('../../services/api');
    mockApi.getStory.mockResolvedValueOnce(storyWithoutCompany);

    const { queryByText } = renderComponent();

    await waitFor(() => {
      expect(queryByText('HealthTech AI')).toBeNull();
    });
  });

  test('shows impact calculator integration', async () => {
    const { getByText, getByTestId } = renderComponent();

    await waitFor(() => {
      const impactButton = getByText('Calculate My Impact');
      fireEvent.press(impactButton);
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ImpactCalculator');
  });

  test('displays share functionality', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      const shareButton = getByTestId('share-button');
      fireEvent.press(shareButton);
    });

    // Should trigger share action
  });

  test('handles long content gracefully', async () => {
    const longContentStory = {
      ...mockStory,
      content: 'This is a very long story content that goes on and on and on. '.repeat(50)
    };
    
    const mockApi = require('../../services/api');
    mockApi.getStory.mockResolvedValueOnce(longContentStory);

    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('This is a very long story content')).toBeTruthy();
    });
  });

  test('shows community discussion section', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Community Discussion')).toBeTruthy();
      expect(getByText('View Comments')).toBeTruthy();
    });
  });
});
