import { useState, useEffect } from 'react';
import api from '../services/api';
import SEO from '../components/SEO';

function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await api.getArticles(params);
      setArticles(response.articles || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles. Please try again later.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TexhPulze",
    "alternateName": "TechPulze",
    "url": "https://www.texhpulze.com",
    "description": "World's First Public Grievance & Discussion Platform for Technology",
    "publisher": {
      "@type": "Organization",
      "name": "TexhPulze",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.texhpulze.com/favicon.svg"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.texhpulze.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="home-page">
      <SEO
        title="TexhPulze - World's First Technology Grievance & Discussion Platform"
        description="Empowering citizens, researchers, policymakers, and governments to report, discuss, and categorize technology risks using AI-powered tools. Get real-time tech news, report grievances, and join community discussions."
        keywords="technology news, tech grievances, AI news aggregation, technology platform, tech discussion, government tech, technology risks, tech policy, community forum, tech democracy, AI-powered news"
        image="https://www.texhpulze.com/og-image.jpg"
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <section className="hero" aria-label="Hero section">
        <div className="hero-content">
          <h1>Welcome to TexhPulze</h1>
          <p className="hero-subtitle">
            World's First Public Grievance & Discussion Platform for Technology
          </p>
          <p className="hero-description">
            Empowering citizens, researchers, policymakers, and governments to report,
            discuss, and categorize technology risks using AI-powered tools.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="category-filter" aria-label="Category filter">
        <div className="container">
          <h2>Browse by Category</h2>
          <div className="category-buttons" role="group" aria-label="Category selection">
            <button
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              aria-label="Show all categories"
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? 'active' : ''}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                aria-label={`Filter by ${cat} category`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="articles-section" id="main-content" aria-label="Latest tech news">
        <div className="container">
          <h2>Latest Tech News</h2>

          {loading && (
            <div className="loading" role="status" aria-live="polite">
              <div className="spinner" aria-hidden="true"></div>
              <p>Loading articles...</p>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert" aria-live="assertive">
              <p>{error}</p>
              <button onClick={fetchArticles} aria-label="Retry loading articles">Try Again</button>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="no-articles">
              <p>No articles found.</p>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="articles-grid">
              {articles.map((article, index) => (
                <article key={article.id} className="article-card">
                  {article.image_url && (
                    <div className="article-image">
                      <img
                        src={article.image_url}
                        alt={`Featured image for ${article.title}`}
                        loading={index < 6 ? "eager" : "lazy"}
                        decoding="async"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="article-content">
                    <div className="article-meta">
                      <span className="category" aria-label={`Category: ${article.category}`}>{article.category}</span>
                      <span className="source" aria-label={`Source: ${article.source}`}>{article.source}</span>
                    </div>
                    <h3>{article.title}</h3>
                    <p className="article-description">{article.description}</p>
                    <div className="article-footer">
                      <time className="date" dateTime={article.published_at} aria-label={`Published on ${new Date(article.published_at).toLocaleDateString()}`}>
                        {new Date(article.published_at).toLocaleDateString()}
                      </time>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="read-more"
                        aria-label={`Read more about ${article.title} (opens in new tab)`}
                      >
                        Read More →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" aria-label="Core features">
        <div className="container">
          <h2>Core Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📰</div>
              <h3>AI News Aggregation</h3>
              <p>Multi-source tech news from NewsAPI, Guardian, Dev.to, and Hacker News with real-time updates.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚨</div>
              <h3>Technology Grievances</h3>
              <p>Report tech issues with AI risk categorization and direct government integration.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Community Discussions</h3>
              <p>Reddit-like forums for technology discussions with expert panels and citizen voices.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Multi-User Ecosystem</h3>
              <p>For citizens, researchers, policymakers, and governments to collaborate.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
