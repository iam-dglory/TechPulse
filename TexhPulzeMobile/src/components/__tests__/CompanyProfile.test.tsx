import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CompanyProfile from '../CompanyProfile';

// Mock data
const mockCompany = {
  id: '1',
  name: 'Test Tech Corp',
  slug: 'test-tech-corp',
  logoUrl: 'https://example.com/logo.png',
  website: 'https://testtech.com',
  sectorTags: ['AI', 'Software'],
  products: [
    {
      id: '1',
      name: 'AI Assistant',
      description: 'Intelligent assistant for businesses',
      priceTiers: { basic: '$99/month', premium: '$299/month' },
      features: ['Natural Language Processing', 'Task Automation'],
      targetUsers: ['Small Business', 'Enterprise'],
      demoUrl: 'https://demo.testtech.com'
    }
  ],
  fundingStage: 'Series A',
  investors: ['Tech Ventures', 'Angel Investor'],
  hqLocation: 'San Francisco, CA',
  ethicsStatementUrl: 'https://testtech.com/ethics',
  privacyPolicyUrl: 'https://testtech.com/privacy',
  credibilityScore: 8.5,
  ethicsScore: 7.8,
  hypeScore: 6.2,
  verified: true,
  verifiedAt: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

const mockRoute = {
  params: {
    companyId: '1'
  }
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn()
};

// Mock API service
jest.mock('../../services/api', () => ({
  getCompany: jest.fn(() => Promise.resolve(mockCompany)),
  getCompanyProducts: jest.fn(() => Promise.resolve(mockCompany.products))
}));

describe('CompanyProfile Component', () => {
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
          <CompanyProfile 
            route={mockRoute} 
            navigation={mockNavigation} 
          />
        </NavigationContainer>
      </QueryClientProvider>
    );
  };

  test('renders company information correctly', async () => {
    const { getByText, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByText('Test Tech Corp')).toBeTruthy();
      expect(getByText('Series A')).toBeTruthy();
      expect(getByText('San Francisco, CA')).toBeTruthy();
      expect(getByText('AI')).toBeTruthy();
      expect(getByText('Software')).toBeTruthy();
    });

    // Check if verified badge is shown
    expect(getByTestId('verified-badge')).toBeTruthy();
  });

  test('displays company scores', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('8.5')).toBeTruthy(); // Credibility Score
      expect(getByText('7.8')).toBeTruthy(); // Ethics Score
      expect(getByText('6.2')).toBeTruthy(); // Hype Score
    });
  });

  test('shows products list', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('AI Assistant')).toBeTruthy();
      expect(getByText('Intelligent assistant for businesses')).toBeTruthy();
      expect(getByText('$99/month')).toBeTruthy();
      expect(getByText('$299/month')).toBeTruthy();
    });
  });

  test('displays investors information', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Tech Ventures')).toBeTruthy();
      expect(getByText('Angel Investor')).toBeTruthy();
    });
  });

  test('shows ethics and privacy policy links', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('View Ethics Statement')).toBeTruthy();
      expect(getByText('View Privacy Policy')).toBeTruthy();
    });
  });

  test('handles contact/claim button press', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      const contactButton = getByText('Contact / Claim Ownership');
      fireEvent.press(contactButton);
    });

    // Should navigate to contact/claim screen
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CompanyClaim');
  });

  test('handles product card press', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      const productCard = getByText('AI Assistant');
      fireEvent.press(productCard);
    });

    // Should navigate to product details or external demo
    // This depends on the implementation
  });

  test('displays loading state initially', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  test('handles error state', async () => {
    // Mock API error
    const mockApi = require('../../services/api');
    mockApi.getCompany.mockRejectedValueOnce(new Error('Network error'));

    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Error loading company information')).toBeTruthy();
    });
  });

  test('shows unverified company without verified badge', async () => {
    const unverifiedCompany = { ...mockCompany, verified: false, verifiedAt: null };
    const mockApi = require('../../services/api');
    mockApi.getCompany.mockResolvedValueOnce(unverifiedCompany);

    const { queryByTestId } = renderComponent();

    await waitFor(() => {
      expect(queryByTestId('verified-badge')).toBeNull();
    });
  });

  test('displays empty state when no products', async () => {
    const companyWithoutProducts = { ...mockCompany, products: [] };
    const mockApi = require('../../services/api');
    mockApi.getCompany.mockResolvedValueOnce(companyWithoutProducts);
    mockApi.getCompanyProducts.mockResolvedValueOnce([]);

    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('No products available')).toBeTruthy();
    });
  });

  test('handles refresh pull action', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      const scrollView = getByTestId('company-scroll-view');
      // Simulate pull to refresh
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: -100 }
        }
      });
    });

    // Should trigger refresh
    const mockApi = require('../../services/api');
    expect(mockApi.getCompany).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  test('displays website link correctly', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      const websiteLink = getByText('https://testtech.com');
      fireEvent.press(websiteLink);
    });

    // Should open external link
  });

  test('shows sector tags as chips', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('sector-tag-AI')).toBeTruthy();
      expect(getByTestId('sector-tag-Software')).toBeTruthy();
    });
  });

  test('handles long company names gracefully', async () => {
    const longNameCompany = {
      ...mockCompany,
      name: 'Very Long Company Name That Might Overflow The Screen Layout And Cause Issues'
    };
    
    const mockApi = require('../../services/api');
    mockApi.getCompany.mockResolvedValueOnce(longNameCompany);

    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(longNameCompany.name)).toBeTruthy();
    });
  });
});
