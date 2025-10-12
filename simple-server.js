const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files from src directory
app.use(express.static('src'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚀 TexhPulze API Server is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/articles', (req, res) => {
  const sampleArticles = [
    {
      id: 1,
      title: 'Latest AI Breakthrough in Natural Language Processing',
      description: 'Researchers have developed a new model that can understand context better than ever before.',
      source: 'TechNews',
      category: 'AI',
      published_at: new Date().toISOString(),
      url: 'https://example.com/ai-breakthrough',
      image_url: 'https://via.placeholder.com/300x200?text=AI+News'
    },
    {
      id: 2,
      title: 'New Smartphone Features Revolutionize Mobile Photography',
      description: 'Latest smartphone cameras use AI to enhance photos automatically.',
      source: 'GadgetReview',
      category: 'Gadgets',
      published_at: new Date().toISOString(),
      url: 'https://example.com/smartphone-camera',
      image_url: 'https://via.placeholder.com/300x200?text=Gadgets'
    },
    {
      id: 3,
      title: 'Open Source Software Trends for 2024',
      description: 'Community-driven development continues to shape the tech industry.',
      source: 'DevWeekly',
      category: 'Software',
      published_at: new Date().toISOString(),
      url: 'https://example.com/opensource-trends',
      image_url: 'https://via.placeholder.com/300x200?text=Software'
    }
  ];

  res.json({
    articles: sampleArticles,
    total: sampleArticles.length,
    message: 'Sample articles loaded successfully!'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: '🎉 TexhPulze API is working perfectly!',
    endpoints: {
      health: '/health',
      articles: '/api/articles',
      test: '/api/test'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 TexhPulze Server Started!');
  console.log('================================');
  console.log(`✅ Server running on port: ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📰 Articles API: http://localhost:${PORT}/api/articles`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log('================================');
  console.log('🎉 Ready to serve your TexhPulze app!');
});

module.exports = app;
