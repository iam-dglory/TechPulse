import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('checking...')
  const [articles, setArticles] = useState([])

  useEffect(() => {
    // Check API status
    fetch('/health')
      .then(response => response.json())
      .then(data => {
        setApiStatus('online')
        console.log('API Status:', data)
      })
      .catch(error => {
        setApiStatus('offline')
        console.error('API Error:', error)
      })

    // Fetch sample articles
    fetch('/api/articles?limit=5')
      .then(response => response.json())
      .then(data => {
        if (data.articles) {
          setArticles(data.articles)
        }
      })
      .catch(error => {
        console.error('Articles Error:', error)
      })
  }, [])

  return (
    <>
      <div className="header">
        <h1>🚀 TexhPulze</h1>
        <p className="subtitle">Your Gateway to Tech News</p>
      </div>

      <div className="status-card">
        <h2>📊 System Status</h2>
        <div className="status-indicator">
          <span className={`status-dot ${apiStatus === 'online' ? 'online' : 'offline'}`}></span>
          <span>Backend API: {apiStatus}</span>
        </div>
        <div className="status-info">
          <p><strong>Environment:</strong> Development</p>
          <p><strong>Database:</strong> SQLite</p>
          <p><strong>Platform:</strong> Replit</p>
        </div>
      </div>

      <div className="features">
        <h2>🎯 Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>📱 Mobile App</h3>
            <p>React Native app with beautiful UI and smooth animations</p>
          </div>
          <div className="feature-card">
            <h3>🔍 News Aggregation</h3>
            <p>Multi-source tech news from NewsAPI, Guardian, Dev.to, and Hacker News</p>
          </div>
          <div className="feature-card">
            <h3>🤖 AI Categorization</h3>
            <p>Smart categorization of tech news and AI-powered risk assessment</p>
          </div>
          <div className="feature-card">
            <h3>💬 Community</h3>
            <p>Public grievance platform and discussion forums for tech issues</p>
          </div>
        </div>
      </div>

      {articles.length > 0 && (
        <div className="articles">
          <h2>📰 Latest Articles</h2>
          <div className="article-list">
            {articles.map((article, index) => (
              <div key={index} className="article-card">
                <h3>{article.title}</h3>
                <p className="article-source">Source: {article.source}</p>
                <p className="article-category">Category: {article.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="api-info">
        <h2>🔗 API Endpoints</h2>
        <div className="endpoint-list">
          <div className="endpoint">
            <code>GET /health</code>
            <span>Health check and system status</span>
          </div>
          <div className="endpoint">
            <code>GET /api/articles</code>
            <span>Fetch tech news articles</span>
          </div>
          <div className="endpoint">
            <code>POST /api/auth/login</code>
            <span>User authentication</span>
          </div>
          <div className="endpoint">
            <code>GET /api/favorites</code>
            <span>User's favorite articles</span>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>Built with ❤️ using React, Node.js, and SQLite</p>
        <p>Deployed on Replit • Ready for mobile app integration</p>
      </div>
    </>
  )
}

export default App