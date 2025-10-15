# TexhPulze Testing Guide

This document provides comprehensive information about the testing setup for TexhPulze backend and mobile applications.

## Backend Testing

### Setup

The backend uses Jest with TypeScript support for comprehensive testing of:

- Scoring algorithms (HypeScorer, EthicsScorer)
- CRUD operations (Company, Story, User management)
- Worker job processing
- API endpoints and controllers

### Test Structure

```
backend/
├── tests/
│   ├── setup.ts                    # Global test setup
│   ├── seed-test-data.ts           # Test data seeding
│   ├── run-tests.ts                # Test runner script
│   ├── services/
│   │   └── scoring.test.ts         # Scoring algorithm tests
│   ├── controllers/
│   │   ├── company.test.ts         # Company CRUD tests
│   │   └── story.test.ts           # Story creation tests
│   └── worker/
│       └── index.test.ts           # Worker job tests
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:scoring          # Scoring logic tests
npm run test:integration      # Controller tests
npm run test:backend         # All backend tests

# Run with coverage
npm run test:coverage

# Run with watch mode
npm run test:watch

# Run comprehensive test suite
npm run test:all
```

### Test Categories

#### 1. Scoring Logic Tests (`tests/services/scoring.test.ts`)

Tests the core scoring algorithms with seeded examples:

**HypeScorer Tests:**

- Marketing-heavy content (high scores)
- Technical, factual content (low scores)
- Balanced content (medium scores)
- Excessive exclamation marks (penalty)
- Empty content handling

**EthicsScorer Tests:**

- Privacy-conscious content (high scores)
- Privacy-violating content (low scores)
- Labor impact identification
- Environmental impact detection
- Safety concern recognition
- Neutral business content

**Integration Tests:**

- Consistent scoring across multiple runs
- Edge case handling (long content, special characters)
- Performance with large datasets

#### 2. Company CRUD Tests (`tests/controllers/company.test.ts`)

Tests company management operations:

- Company creation and validation
- Retrieval with filtering (sector, funding stage, ethics score)
- Search functionality
- Company updates and permissions
- Data validation and constraints
- Score calculation integration

#### 3. Story Creation Tests (`tests/controllers/story.test.ts`)

Tests story management operations:

- Story creation with required/optional fields
- Content validation and length checks
- URL format validation
- Story retrieval with pagination
- Filtering by company, sector, content
- Story updates and scoring
- Engagement score calculation

#### 4. Worker Job Tests (`tests/worker/index.test.ts`)

Tests background job processing:

- Story enhancement job processing
- Scoring job execution
- Company score update jobs
- Queue management and error handling
- Job retry logic and failure handling
- Job ordering and priority

### Test Data

The test suite uses seeded data including:

- Sample users (regular, admin, verified)
- Test companies with various sectors and funding stages
- Stories with different hype/ethics scores
- Impact tags and content types

## Mobile Testing

### Setup

The mobile app uses Jest with React Native Testing Library for:

- Component rendering and interaction tests
- Snapshot testing for UI consistency
- Navigation and API integration tests

### Test Structure

```
TexhPulzeMobile/
├── jest.setup.js                   # Jest configuration
├── src/
│   └── components/
│       └── __tests__/
│           ├── CompanyProfile.test.tsx
│           ├── StoryView.test.tsx
│           └── EthicsBadge.test.tsx
```

### Running Mobile Tests

```bash
# Run all mobile tests
npm run test

# Run component tests
npm run test:components

# Run mobile-specific tests
npm run test:mobile

# Update snapshots
npm run test:snapshots

# Run with watch mode
npm run test:watch
```

### Test Categories

#### 1. CompanyProfile Component Tests

Tests the company profile screen:

- Company information display
- Score badges and metrics
- Products list rendering
- Investor information
- Contact/claim functionality
- Error states and loading
- Refresh functionality
- Navigation interactions

#### 2. StoryView Component Tests

Tests the story detail screen:

- Story content rendering
- Score badges and impact tags
- ELI5 toggle functionality
- Voting system interaction
- Reality check panel
- Company link navigation
- Source URL handling
- Error states and loading
- Share functionality

#### 3. EthicsBadge Snapshot Tests

Tests UI consistency:

- High/medium/low score rendering
- Different badge sizes
- Custom labels and tooltips
- Color variations
- Accessibility features

### Mocking Strategy

The mobile tests use comprehensive mocking:

- **API Services**: Mocked API calls with predictable responses
- **Navigation**: Mocked navigation functions and route parameters
- **External Dependencies**: Mocked Expo modules, AsyncStorage, etc.
- **User Interactions**: Simulated touch events and form inputs

## Test Execution Examples

### Backend Scoring Tests

```bash
# Run scoring tests with detailed output
npm run test:scoring

# Expected output:
# 🧮 Running Scoring Logic Tests...
# ✅ HypeScorer: Marketing language detection
# ✅ EthicsScorer: Privacy analysis
# ✅ Integration: Consistent scoring
# ✅ Edge Cases: Empty content handling
```

### Mobile Component Tests

```bash
# Run component tests
npm run test:components

# Expected output:
# ✅ CompanyProfile Component Tests
# ✅ StoryView Component Tests
# ✅ EthicsBadge Snapshot Tests
```

## Continuous Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: cd backend && npm install
      - run: cd backend && npm run test:scoring
      - run: cd backend && npm run test:integration

  mobile-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: cd TexhPulzeMobile && npm install
      - run: cd TexhPulzeMobile && npm run test:components
```

## Test Coverage Goals

### Backend Coverage Targets

- **Scoring Services**: 95%+ coverage
- **Controllers**: 90%+ coverage
- **Models**: 85%+ coverage
- **Workers**: 80%+ coverage

### Mobile Coverage Targets

- **Components**: 85%+ coverage
- **Services**: 90%+ coverage
- **Utils**: 95%+ coverage

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

   - Ensure test database is properly configured
   - Check TypeORM test configuration

2. **Mock Failures**

   - Verify mock implementations match actual API
   - Check import paths in test files

3. **Snapshot Mismatches**

   - Review UI changes before updating snapshots
   - Use `npm run test:snapshots` to update

4. **Timeout Issues**
   - Increase Jest timeout for integration tests
   - Check for async operations not being awaited

### Debug Mode

Run tests with debug output:

```bash
# Backend debugging
DEBUG=* npm run test:scoring

# Mobile debugging
DEBUG=* npm run test:components
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Dependencies**: Don't rely on external services
3. **Descriptive Test Names**: Use clear, descriptive test descriptions
4. **Arrange-Act-Assert**: Follow the AAA pattern
5. **Edge Case Coverage**: Test boundary conditions and error states
6. **Performance Testing**: Include tests for scoring algorithm performance
7. **Snapshot Updates**: Review snapshot changes carefully

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add appropriate mocks for external dependencies
3. Include both positive and negative test cases
4. Update this documentation if adding new test categories
5. Ensure tests pass in CI/CD pipeline

For questions about testing, refer to the Jest documentation or create an issue in the repository.
