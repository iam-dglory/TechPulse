const newsAggregator = require('../../src/services/newsAggregator');
const { pool } = require('../../src/config/database');

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('News Aggregator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up test data
    await pool.execute('DELETE FROM articles WHERE id > 0');
  });

  describe('fetchFromNewsAPI', () => {
    it('should fetch articles from NewsAPI', async () => {
      const mockResponse = {
        data: {
          articles: [
            {
              title: 'Test NewsAPI Article',
              description: 'Test description',
              url: 'https://newsapi.com/article1',
              source: { name: 'NewsAPI' },
              publishedAt: '2024-01-01T00:00:00Z',
              urlToImage: 'https://newsapi.com/image1.jpg'
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const articles = await newsAggregator.fetchFromNewsAPI('tech');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('newsapi.org'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': expect.any(String)
          })
        })
      );

      expect(articles).toHaveLength(1);
      expect(articles[0]).toMatchObject({
        title: 'Test NewsAPI Article',
        description: 'Test description',
        url: 'https://newsapi.com/article1',
        source: 'NewsAPI',
        category: 'Tech News',
        image_url: 'https://newsapi.com/image1.jpg'
      });
    });

    it('should handle NewsAPI errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      const articles = await newsAggregator.fetchFromNewsAPI('tech');

      expect(articles).toEqual([]);
    });

    it('should skip if API key is not configured', async () => {
      process.env.NEWS_API_KEY = 'your_news_api_key_here';

      const articles = await newsAggregator.fetchFromNewsAPI('tech');

      expect(axios.get).not.toHaveBeenCalled();
      expect(articles).toEqual([]);
    });
  });

  describe('fetchFromDevTo', () => {
    it('should fetch articles from Dev.to', async () => {
      const mockResponse = {
        data: [
          {
            title: 'Test Dev.to Article',
            description: 'Test description',
            url: 'https://dev.to/article1',
            published_at: '2024-01-01T00:00:00Z',
            cover_image: 'https://dev.to/image1.jpg'
          }
        ]
      };

      axios.get.mockResolvedValue(mockResponse);

      const articles = await newsAggregator.fetchFromDevTo('tech');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('dev.to/api'),
        expect.any(Object)
      );

      expect(articles).toHaveLength(1);
      expect(articles[0]).toMatchObject({
        title: 'Test Dev.to Article',
        description: 'Test description',
        url: 'https://dev.to/article1',
        source: 'Dev.to',
        category: 'Tech News',
        image_url: 'https://dev.to/image1.jpg'
      });
    });
  });

  describe('fetchFromHackerNews', () => {
    it('should fetch articles from Hacker News', async () => {
      const mockTopStoriesResponse = {
        data: [1, 2, 3]
      };

      const mockStoryResponse = {
        data: {
          id: 1,
          title: 'Test Hacker News Story',
          url: 'https://hackernews.com/story1',
          time: 1640995200,
          type: 'story'
        }
      };

      axios.get
        .mockResolvedValueOnce(mockTopStoriesResponse)
        .mockResolvedValue(mockStoryResponse);

      const articles = await newsAggregator.fetchFromHackerNews();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('hacker-news.firebaseio.com/v0/topstories.json'),
        expect.any(Object)
      );

      expect(articles.length).toBeGreaterThan(0);
      expect(articles[0]).toMatchObject({
        title: 'Test Hacker News Story',
        url: 'https://hackernews.com/story1',
        source: 'Hacker News',
        category: 'Tech News'
      });
    });
  });

  describe('saveArticles', () => {
    it('should save articles to database', async () => {
      const articles = [
        {
          title: 'Test Article 1',
          description: 'Description 1',
          url: 'https://example.com/article1',
          source: 'Test Source',
          category: 'AI',
          published_at: new Date('2024-01-01'),
          image_url: 'https://example.com/image1.jpg'
        },
        {
          title: 'Test Article 2',
          description: 'Description 2',
          url: 'https://example.com/article2',
          source: 'Test Source',
          category: 'Gadgets',
          published_at: new Date('2024-01-02'),
          image_url: 'https://example.com/image2.jpg'
        }
      ];

      const result = await newsAggregator.saveArticles(articles);

      expect(result).toMatchObject({
        saved: 2,
        skipped: 0
      });

      // Verify articles were saved
      const [savedArticles] = await pool.execute('SELECT * FROM articles WHERE url LIKE ?', ['https://example.com/article%']);
      expect(savedArticles).toHaveLength(2);
    });

    it('should skip duplicate articles', async () => {
      const articles = [
        {
          title: 'Duplicate Article',
          description: 'Description',
          url: 'https://example.com/duplicate',
          source: 'Test Source',
          category: 'AI',
          published_at: new Date('2024-01-01'),
          image_url: 'https://example.com/image.jpg'
        }
      ];

      // Save once
      await newsAggregator.saveArticles(articles);

      // Try to save again
      const result = await newsAggregator.saveArticles(articles);

      expect(result).toMatchObject({
        saved: 0,
        skipped: 1
      });

      // Verify only one article exists
      const [savedArticles] = await pool.execute('SELECT * FROM articles WHERE url = ?', ['https://example.com/duplicate']);
      expect(savedArticles).toHaveLength(1);
    });
  });

  describe('mapToCategory', () => {
    it('should map categories correctly', () => {
      expect(newsAggregator.mapToCategory('tech')).toBe('Tech News');
      expect(newsAggregator.mapToCategory('ai')).toBe('AI');
      expect(newsAggregator.mapToCategory('gadgets')).toBe('Gadgets');
      expect(newsAggregator.mapToCategory('software')).toBe('Software');
      expect(newsAggregator.mapToCategory('unknown')).toBe('Tech News');
    });
  });
});
