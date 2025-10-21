import { useState, useEffect } from 'react';
import api from '../services/api';

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

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
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
      <section className="category-filter">
        <div className="container">
          <h2>Browse by Category</h2>
          <div className="category-buttons">
            <button
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? 'active' : ''}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="articles-section">
        <div className="container">
          <h2>Latest Tech News</h2>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading articles...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchArticles}>Try Again</button>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="no-articles">
              <p>No articles found.</p>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="articles-grid">
              {articles.map((article) => (
                <div key={article.id} className="article-card">
                  {article.image_url && (
                    <div className="article-image">
                      <img src={article.image_url} alt={article.title} />
                    </div>
                  )}
                  <div className="article-content">
                    <div className="article-meta">
                      <span className="category">{article.category}</span>
                      <span className="source">{article.source}</span>
                    </div>
                    <h3>{article.title}</h3>
                    <p className="article-description">{article.description}</p>
                    <div className="article-footer">
                      <span className="date">
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="read-more"
                      >
                        Read More →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
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
