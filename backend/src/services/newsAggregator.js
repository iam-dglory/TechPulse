const axios = require('axios');
const { pool } = require('../config/database');

class NewsAggregator {
  constructor() {
    this.apis = {
      newsapi: {
        baseUrl: 'https://newsapi.org/v2',
        apiKey: process.env.NEWS_API_KEY,
        endpoints: {
          tech: '/everything?q=technology&language=en&sortBy=publishedAt&pageSize=20',
          ai: '/everything?q=artificial intelligence OR AI OR machine learning&language=en&sortBy=publishedAt&pageSize=20',
          gadgets: '/everything?q=gadgets OR smartphone OR laptop OR hardware&language=en&sortBy=publishedAt&pageSize=20',
          software: '/everything?q=software OR programming OR development&language=en&sortBy=publishedAt&pageSize=20'
        }
      },
      guardian: {
        baseUrl: 'https://content.guardianapis.com',
        apiKey: process.env.GUARDIAN_API_KEY,
        endpoints: {
          tech: '/search?section=technology&show-fields=thumbnail,trailText&page-size=20',
          ai: '/search?q=artificial intelligence OR AI&section=technology&show-fields=thumbnail,trailText&page-size=20',
          gadgets: '/search?q=gadgets OR smartphone OR hardware&section=technology&show-fields=thumbnail,trailText&page-size=20',
          software: '/search?q=software OR programming&section=technology&show-fields=thumbnail,trailText&page-size=20'
        }
      },
      devto: {
        baseUrl: 'https://dev.to/api',
        endpoints: {
          tech: '/articles?tag=javascript,react,nodejs,python&per_page=20',
          ai: '/articles?tag=ai,machinelearning,artificialintelligence&per_page=20',
          gadgets: '/articles?tag=hardware,iot,gadgets&per_page=20',
          software: '/articles?tag=programming,software,development&per_page=20'
        }
      },
      hackernews: {
        baseUrl: 'https://hacker-news.firebaseio.com/v0',
        endpoints: {
          top: '/topstories.json',
          new: '/newstories.json'
        }
      }
    };
  }

  // Fetch articles from NewsAPI
  async fetchFromNewsAPI(category = 'tech') {
    try {
      if (!this.apis.newsapi.apiKey || this.apis.newsapi.apiKey === 'your_news_api_key_here') {
        console.log('NewsAPI key not configured, skipping...');
        return [];
      }

      const endpoint = this.apis.newsapi.endpoints[category] || this.apis.newsapi.endpoints.tech;
      const response = await axios.get(`${this.apis.newsapi.baseUrl}${endpoint}`, {
        headers: { 'X-API-Key': this.apis.newsapi.apiKey },
        timeout: 10000
      });

      return response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        category: this.mapToCategory(category),
        published_at: new Date(article.publishedAt),
        image_url: article.urlToImage
      }));
    } catch (error) {
      console.error('NewsAPI fetch error:', error.message);
      return [];
    }
  }

  // Fetch articles from Guardian API
  async fetchFromGuardian(category = 'tech') {
    try {
      if (!this.apis.guardian.apiKey || this.apis.guardian.apiKey === 'your_guardian_api_key_here') {
        console.log('Guardian API key not configured, skipping...');
        return [];
      }

      const endpoint = this.apis.guardian.endpoints[category] || this.apis.guardian.endpoints.tech;
      const response = await axios.get(`${this.apis.guardian.baseUrl}${endpoint}&api-key=${this.apis.guardian.apiKey}`, {
        timeout: 10000
      });

      return response.data.response.results.map(article => ({
        title: article.webTitle,
        description: article.fields?.trailText || '',
        url: article.webUrl,
        source: 'The Guardian',
        category: this.mapToCategory(category),
        published_at: new Date(article.webPublicationDate),
        image_url: article.fields?.thumbnail || ''
      }));
    } catch (error) {
      console.error('Guardian API fetch error:', error.message);
      return [];
    }
  }

  // Fetch articles from Dev.to
  async fetchFromDevTo(category = 'tech') {
    try {
      const endpoint = this.apis.devto.endpoints[category] || this.apis.devto.endpoints.tech;
      const response = await axios.get(`${this.apis.devto.baseUrl}${endpoint}`, {
        timeout: 10000
      });

      return response.data.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: 'Dev.to',
        category: this.mapToCategory(category),
        published_at: new Date(article.published_at),
        image_url: article.cover_image || article.social_image || ''
      }));
    } catch (error) {
      console.error('Dev.to fetch error:', error.message);
      return [];
    }
  }

  // Fetch articles from Hacker News
  async fetchFromHackerNews() {
    try {
      const response = await axios.get(`${this.apis.hackernews.baseUrl}/topstories.json`, {
        timeout: 10000
      });

      const storyIds = response.data.slice(0, 20);
      const stories = await Promise.all(
        storyIds.map(id => 
          axios.get(`${this.apis.hackernews.baseUrl}/item/${id}.json`, { timeout: 5000 })
            .then(res => res.data)
            .catch(() => null)
        )
      );

      return stories
        .filter(story => story && story.type === 'story' && story.title)
        .map(story => ({
          title: story.title,
          description: '',
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          source: 'Hacker News',
          category: 'Tech News',
          published_at: new Date(story.time * 1000),
          image_url: ''
        }));
    } catch (error) {
      console.error('Hacker News fetch error:', error.message);
      return [];
    }
  }

  // Map category to standardized categories
  mapToCategory(category) {
    const categoryMap = {
      tech: 'Tech News',
      ai: 'AI',
      gadgets: 'Gadgets',
      software: 'Software'
    };
    return categoryMap[category] || 'Tech News';
  }

  // Fetch all articles from all sources
  async fetchAllArticles() {
    console.log('🔄 Fetching articles from all sources...');
    
    const categories = ['tech', 'ai', 'gadgets', 'software'];
    const allArticles = [];

    // Fetch from each source
    for (const category of categories) {
      try {
        const [newsapiArticles, guardianArticles, devtoArticles] = await Promise.all([
          this.fetchFromNewsAPI(category),
          this.fetchFromGuardian(category),
          this.fetchFromDevTo(category)
        ]);

        allArticles.push(...newsapiArticles, ...guardianArticles, ...devtoArticles);
      } catch (error) {
        console.error(`Error fetching ${category} articles:`, error.message);
      }
    }

    // Fetch from Hacker News (general tech news)
    try {
      const hackerNewsArticles = await this.fetchFromHackerNews();
      allArticles.push(...hackerNewsArticles);
    } catch (error) {
      console.error('Error fetching Hacker News articles:', error.message);
    }

    // Remove duplicates based on URL
    const uniqueArticles = allArticles.filter((article, index, self) =>
      index === self.findIndex(a => a.url === article.url)
    );

    console.log(`✅ Fetched ${uniqueArticles.length} unique articles`);
    return uniqueArticles;
  }

  // Save articles to database
  async saveArticles(articles) {
    try {
      let savedCount = 0;
      let skippedCount = 0;

      for (const article of articles) {
        try {
          await pool.execute(
            `INSERT INTO articles (title, description, url, source, category, published_at, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             description = VALUES(description),
             updated_at = CURRENT_TIMESTAMP`,
            [
              article.title,
              article.description,
              article.url,
              article.source,
              article.category,
              article.published_at,
              article.image_url
            ]
          );
          savedCount++;
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            skippedCount++;
          } else {
            console.error('Error saving article:', error.message);
          }
        }
      }

      console.log(`💾 Saved ${savedCount} new articles, skipped ${skippedCount} duplicates`);
      return { saved: savedCount, skipped: skippedCount };
    } catch (error) {
      console.error('Error saving articles to database:', error.message);
      throw error;
    }
  }

  // Full aggregation process
  async aggregateNews() {
    try {
      console.log('🚀 Starting news aggregation...');
      const articles = await this.fetchAllArticles();
      const result = await this.saveArticles(articles);
      console.log('✅ News aggregation completed');
      return result;
    } catch (error) {
      console.error('❌ News aggregation failed:', error.message);
      throw error;
    }
  }
}

module.exports = new NewsAggregator();
