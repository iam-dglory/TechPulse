console.log('Starting TexhPulze Full Platform Server...');

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// In-memory data storage (in production, this would be a database)
let users = [
  {
    id: 1,
    username: 'tech_advocate',
    email: 'user@example.com',
    password: 'password123',
    profile: {
      displayName: 'Tech Advocate',
      bio: 'Passionate about technology ethics and digital rights',
      joinDate: new Date().toISOString(),
      karma: 1250,
      avatar: 'https://via.placeholder.com/64/667eea/ffffff?text=TA'
    },
    preferences: {
      notifications: true,
      theme: 'dark',
      subscriptions: ['AI Ethics', 'Privacy', 'Cybersecurity']
    }
  }
];

let sessions = {};

let posts = [
  {
    id: 1,
    title: 'AI Algorithm Discriminating Against Minorities in Job Applications',
    content: 'Multiple reports of AI-powered recruitment tools showing bias against certain demographic groups. This affects thousands of job seekers daily. The algorithm seems to favor certain demographics over others, creating an unfair hiring landscape.',
    author: 'tech_advocate',
    authorId: 1,
    type: 'grievance',
    category: 'AI Bias',
    criticality: 'HIGH',
    status: 'Under Investigation',
    location: 'United States',
    votes: 1247,
    comments: 89,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    aiRiskScore: 8.5,
    aiCategorization: 'Systemic Bias - Employment Discrimination',
    governmentAction: 'Sent to Equal Employment Opportunity Commission',
    tags: ['AI', 'Discrimination', 'Employment', 'Civil Rights'],
    upvotes: 1247,
    downvotes: 0,
    hotScore: 1250
  },
  {
    id: 2,
    title: 'Latest Breakthrough: GPT-5 Shows 95% Accuracy in Medical Diagnosis',
    content: 'OpenAI\'s latest model demonstrates unprecedented accuracy in medical diagnosis, potentially revolutionizing healthcare. The AI can analyze medical images, patient history, and symptoms to provide accurate diagnoses in seconds.',
    author: 'tech_advocate',
    authorId: 1,
    type: 'news',
    category: 'AI News',
    source: 'OpenAI Blog',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 892,
    comments: 45,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['AI', 'Healthcare', 'GPT-5', 'Medical'],
    upvotes: 892,
    downvotes: 12,
    hotScore: 900,
    url: 'https://openai.com/blog/gpt5-medical-diagnosis'
  }
];

let comments = [
  {
    id: 1,
    postId: 1,
    author: 'tech_advocate',
    authorId: 1,
    content: 'This is a serious issue that needs immediate attention. I\'ve personally experienced this bias.',
    votes: 45,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 45,
    downvotes: 2
  },
  {
    id: 2,
    postId: 1,
    author: 'privacy_expert',
    authorId: 2,
    content: 'The government needs to step in and regulate these AI systems immediately.',
    votes: 67,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    upvotes: 67,
    downvotes: 0
  }
];

// Helper functions
function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function authenticateUser(token) {
  return sessions[token] || null;
}

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function handleOptions(req, res) {
  setCORSHeaders(res);
  res.writeHead(200);
  res.end();
}

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  
  setCORSHeaders(res);
  
  if (method === 'OPTIONS') {
    return handleOptions(req, res);
  }
  
  if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: '🚀 TexhPulze Full Platform Server is running!',
      timestamp: new Date().toISOString(),
      port: 3000,
      environment: 'development'
    }));
  } else if (parsedUrl.pathname === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
          const token = generateToken();
          sessions[token] = user;
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            token,
            user: {
              id: user.id,
              username: user.username,
              profile: user.profile,
              preferences: user.preferences
            }
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid credentials' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
      }
    });
  } else if (parsedUrl.pathname === '/api/auth/register' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { username, email, password, displayName } = JSON.parse(body);
        
        if (users.find(u => u.username === username || u.email === email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Username or email already exists' }));
          return;
        }
        
        const newUser = {
          id: users.length + 1,
          username,
          email,
          password,
          profile: {
            displayName: displayName || username,
            bio: '',
            joinDate: new Date().toISOString(),
            karma: 0,
            avatar: `https://via.placeholder.com/64/667eea/ffffff?text=${username.charAt(0).toUpperCase()}`
          },
          preferences: {
            notifications: true,
            theme: 'light',
            subscriptions: []
          }
        };
        
        users.push(newUser);
        const token = generateToken();
        sessions[token] = newUser;
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token,
          user: {
            id: newUser.id,
            username: newUser.username,
            profile: newUser.profile,
            preferences: newUser.preferences
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
      }
    });
  } else if (parsedUrl.pathname === '/api/auth/me' && method === 'GET') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = authenticateUser(token);
    
    if (user) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          profile: user.profile,
          preferences: user.preferences
        }
      }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
    }
  } else if (parsedUrl.pathname === '/api/posts' && method === 'GET') {
    const { type, sort = 'hot' } = parsedUrl.query;
    let filteredPosts = posts;
    
    if (type) {
      filteredPosts = posts.filter(post => post.type === type);
    }
    
    // Sort posts
    filteredPosts.sort((a, b) => {
      if (sort === 'hot') return b.hotScore - a.hotScore;
      if (sort === 'new') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'top') return b.votes - a.votes;
      return 0;
    });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      posts: filteredPosts,
      total: filteredPosts.length
    }));
  } else if (parsedUrl.pathname === '/api/posts' && method === 'POST') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = authenticateUser(token);
    
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { title, content, type, category, tags, criticality, location } = JSON.parse(body);
        
        const newPost = {
          id: posts.length + 1,
          title,
          content,
          author: user.username,
          authorId: user.id,
          type: type || 'grievance',
          category: category || 'General',
          criticality: criticality || 'MEDIUM',
          status: type === 'grievance' ? 'Under Review' : 'Published',
          location: location || 'Global',
          votes: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
          tags: tags || [],
          upvotes: 0,
          downvotes: 0,
          hotScore: 0,
          ...(type === 'grievance' && {
            aiRiskScore: Math.random() * 5 + 5, // Random score between 5-10
            aiCategorization: 'Under AI Analysis',
            governmentAction: 'Pending Review'
          }),
          ...(type === 'news' && {
            source: 'User Submitted',
            publishedAt: new Date().toISOString()
          })
        };
        
        posts.push(newPost);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          post: newPost
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
      }
    });
  } else if (parsedUrl.pathname.startsWith('/api/posts/') && parsedUrl.pathname.endsWith('/vote') && method === 'POST') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = authenticateUser(token);
    
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }
    
    const postId = parseInt(parsedUrl.pathname.split('/')[3]);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Post not found' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { vote } = JSON.parse(body); // 1 for upvote, -1 for downvote, 0 for remove vote
        
        // Simple voting logic (in production, you'd track user votes)
        if (vote === 1) {
          post.upvotes += 1;
          post.votes += 1;
        } else if (vote === -1) {
          post.downvotes += 1;
          post.votes -= 1;
        }
        
        // Update hot score (simple algorithm)
        post.hotScore = post.upvotes - post.downvotes;
        
        // Update criticality based on votes for grievances
        if (post.type === 'grievance') {
          if (post.votes > 1000) post.criticality = 'CRITICAL';
          else if (post.votes > 500) post.criticality = 'HIGH';
          else if (post.votes > 100) post.criticality = 'MEDIUM';
          else post.criticality = 'LOW';
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          post: post
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
      }
    });
  } else if (parsedUrl.pathname.startsWith('/api/posts/') && parsedUrl.pathname.endsWith('/comments') && method === 'GET') {
    const postId = parseInt(parsedUrl.pathname.split('/')[3]);
    const postComments = comments.filter(c => c.postId === postId);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      comments: postComments
    }));
  } else if (parsedUrl.pathname.startsWith('/api/posts/') && parsedUrl.pathname.endsWith('/comments') && method === 'POST') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = authenticateUser(token);
    
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }
    
    const postId = parseInt(parsedUrl.pathname.split('/')[3]);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Post not found' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { content } = JSON.parse(body);
        
        const newComment = {
          id: comments.length + 1,
          postId,
          author: user.username,
          authorId: user.id,
          content,
          votes: 0,
          createdAt: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0
        };
        
        comments.push(newComment);
        post.comments += 1;
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          comment: newComment
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
      }
    });
  } else if (parsedUrl.pathname === '/api/grievances') {
    const sampleGrievances = [
      {
        id: 1,
        title: 'AI Algorithm Discriminating Against Minorities in Job Applications',
        description: 'Multiple reports of AI-powered recruitment tools showing bias against certain demographic groups. This affects thousands of job seekers daily.',
        category: 'AI Bias',
        criticality: 'HIGH',
        status: 'Under Investigation',
        location: 'United States',
        votes: 1247,
        comments: 89,
        reported_by: 'anonymous_user',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        ai_risk_score: 8.5,
        ai_categorization: 'Systemic Bias - Employment Discrimination',
        government_action: 'Sent to Equal Employment Opportunity Commission',
        tags: ['AI', 'Discrimination', 'Employment', 'Civil Rights']
      },
      {
        id: 2,
        title: 'Social Media Platform Collecting Data from Children Under 13',
        description: 'Evidence shows a major social media platform is knowingly collecting personal data from users under 13 without proper parental consent.',
        category: 'Privacy Violation',
        criticality: 'CRITICAL',
        status: 'Legal Action Pending',
        location: 'Global',
        votes: 2156,
        comments: 156,
        reported_by: 'privacy_advocate_2024',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        ai_risk_score: 9.2,
        ai_categorization: 'Child Privacy Violation - COPPA Compliance',
        government_action: 'Referred to FTC and State Attorneys General',
        tags: ['Privacy', 'Children', 'COPPA', 'Data Collection']
      },
      {
        id: 3,
        title: 'Autonomous Vehicle System Failing in Rainy Conditions',
        description: 'Multiple incidents of self-driving cars malfunctioning during heavy rain, posing safety risks to passengers and pedestrians.',
        category: 'Safety Risk',
        criticality: 'HIGH',
        status: 'Company Responding',
        location: 'California, USA',
        votes: 892,
        comments: 67,
        reported_by: 'safety_engineer_CA',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        ai_risk_score: 7.8,
        ai_categorization: 'Autonomous Vehicle Safety - Weather Conditions',
        government_action: 'NHTSA Investigation Initiated',
        tags: ['Autonomous Vehicles', 'Safety', 'Weather', 'Transportation']
      },
      {
        id: 4,
        title: 'Healthcare AI Misdiagnosing Rare Diseases',
        description: 'AI diagnostic tools in hospitals are consistently misdiagnosing rare diseases, leading to delayed treatment and patient harm.',
        category: 'Medical AI Error',
        criticality: 'CRITICAL',
        status: 'FDA Review',
        location: 'Multiple Hospitals',
        votes: 1834,
        comments: 234,
        reported_by: 'medical_professional',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        ai_risk_score: 9.7,
        ai_categorization: 'Healthcare AI - Diagnostic Accuracy',
        government_action: 'FDA Medical Device Investigation',
        tags: ['Healthcare', 'AI Diagnosis', 'Medical Errors', 'Patient Safety']
      },
      {
        id: 5,
        title: 'Smart Home Devices Vulnerable to Cyber Attacks',
        description: 'Popular smart home devices have critical security vulnerabilities that allow hackers to access private homes and personal data.',
        category: 'Cybersecurity',
        criticality: 'HIGH',
        status: 'Patch Released',
        location: 'Global',
        votes: 1456,
        comments: 123,
        reported_by: 'cybersecurity_researcher',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        ai_risk_score: 8.1,
        ai_categorization: 'IoT Security - Home Invasion Risk',
        government_action: 'CISA Advisory Issued',
        tags: ['IoT', 'Cybersecurity', 'Smart Homes', 'Privacy']
      }
    ];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      grievances: sampleGrievances,
      total: sampleGrievances.length,
      message: 'Sample grievances loaded successfully!'
    }));
  } else if (req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: '🎉 TexhPulze API is working perfectly!',
      endpoints: {
        health: '/health',
        grievances: '/api/grievances',
        discussions: '/api/discussions',
        reports: '/api/reports',
        test: '/api/test'
      },
      timestamp: new Date().toISOString()
    }));
  } else {
    // Serve the full TexhPulze application with Reddit-like UI
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TexhPulze - Reddit for Tech Grievances & News</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #1a1a1b;
            background-color: #dae0e6;
            min-height: 100vh;
        }

        /* Header */
        .header {
            background: #fff;
            border-bottom: 1px solid #ccc;
            padding: 0 20px;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 60px;
        }

        .logo {
            display: flex;
            align-items: center;
            font-size: 24px;
            font-weight: bold;
            color: #ff4500;
            text-decoration: none;
        }

        .logo-icon {
            width: 32px;
            height: 32px;
            margin-right: 8px;
            background: radial-gradient(circle at 30% 30%, #00BFFF, #4169E1, #6A5ACD, #8A2BE2);
            border-radius: 50%;
            position: relative;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .logo-icon::before {
            content: '';
            position: absolute;
            top: 20%;
            left: 25%;
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
        }

        .logo-icon::after {
            content: '';
            position: absolute;
            top: 30%;
            left: 60%;
            width: 4px;
            height: 4px;
            background: rgba(135, 206, 235, 0.8);
            border-radius: 50%;
        }

        .logo:hover {
            text-decoration: none;
        }

        .nav {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .nav-button {
            background: #0079d3;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background-color 0.2s;
        }

        .nav-button:hover {
            background: #005ea2;
        }

        .nav-button.secondary {
            background: transparent;
            color: #0079d3;
            border: 1px solid #0079d3;
        }

        .nav-button.secondary:hover {
            background: #0079d3;
            color: white;
        }

        /* Main Layout */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
            padding: 20px;
        }

        .main-content {
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }

        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .sidebar-card {
            background: white;
            border-radius: 8px;
            padding: 16px;
            border: 1px solid #ccc;
        }

        .sidebar-card h3 {
            margin-bottom: 12px;
            font-size: 16px;
            color: #1a1a1b;
        }

        /* Sort Tabs */
        .sort-tabs {
            display: flex;
            background: white;
            border-bottom: 1px solid #ccc;
        }

        .sort-tab {
            padding: 12px 20px;
            border: none;
            background: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            color: #878a8c;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
        }

        .sort-tab.active {
            color: #1a1a1b;
            border-bottom-color: #0079d3;
        }

        .sort-tab:hover {
            color: #1a1a1b;
        }

        /* Post Card */
        .post-card {
            display: flex;
            padding: 16px;
            border-bottom: 1px solid #f6f7f8;
            transition: background-color 0.2s;
        }

        .post-card:hover {
            background-color: #f6f7f8;
        }

        .vote-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 16px;
            min-width: 40px;
        }

        .vote-button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            color: #878a8c;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .vote-button:hover {
            background-color: #f6f7f8;
        }

        .vote-button.upvoted {
            color: #ff4500;
        }

        .vote-button.downvoted {
            color: #7193ff;
        }

        .vote-score {
            font-size: 12px;
            font-weight: 700;
            color: #1a1a1b;
            margin: 4px 0;
        }

        .post-content {
            flex: 1;
        }

        .post-meta {
            font-size: 12px;
            color: #878a8c;
            margin-bottom: 8px;
        }

        .post-meta a {
            color: #0079d3;
            text-decoration: none;
        }

        .post-meta a:hover {
            text-decoration: underline;
        }

        .post-title {
            font-size: 18px;
            font-weight: 500;
            color: #1a1a1b;
            margin-bottom: 8px;
            line-height: 1.4;
        }

        .post-title a {
            color: inherit;
            text-decoration: none;
        }

        .post-title a:hover {
            text-decoration: underline;
        }

        .post-text {
            color: #1a1a1b;
            margin-bottom: 12px;
            line-height: 1.5;
        }

        .post-actions {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: #878a8c;
        }

        .post-action {
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .post-action:hover {
            background-color: #f6f7f8;
        }

        /* Criticality Badge */
        .criticality-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            margin-left: 8px;
        }

        .criticality-badge.critical {
            background: #ff4500;
            color: white;
        }

        .criticality-badge.high {
            background: #ff8b00;
            color: white;
        }

        .criticality-badge.medium {
            background: #ffd635;
            color: #1a1a1b;
        }

        .criticality-badge.low {
            background: #46d160;
            color: white;
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        }

        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 8px;
            padding: 24px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .modal-title {
            font-size: 20px;
            font-weight: 600;
        }

        .close-button {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #878a8c;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #1a1a1b;
        }

        .form-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
        }

        .form-textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            resize: vertical;
            min-height: 100px;
        }

        .form-select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            background: white;
        }

        .submit-button {
            background: #0079d3;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            width: 100%;
        }

        .submit-button:hover {
            background: #005ea2;
        }

        /* User Profile */
        .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #f6f7f8;
            border-radius: 8px;
            margin-bottom: 16px;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #0079d3;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
        }

        .user-info h4 {
            margin-bottom: 4px;
            color: #1a1a1b;
        }

        .user-info p {
            font-size: 12px;
            color: #878a8c;
        }

        /* Loading States */
        .loading {
            text-align: center;
            padding: 40px;
            color: #878a8c;
        }

        .error {
            background: #ffebee;
            color: #c62828;
            padding: 12px;
            border-radius: 4px;
            margin: 12px 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
                padding: 10px;
            }
            
            .header-content {
                flex-wrap: wrap;
                height: auto;
                padding: 10px 0;
            }
            
            .nav {
                width: 100%;
                justify-content: center;
                margin-top: 10px;
            }
        }
    </style>

</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <a href="/" class="logo">
                <div class="logo-icon"></div>
                TexhPulze
            </a>
            <nav class="nav">
                <button class="nav-button" onclick="openModal('loginModal')" id="loginBtn">Log In</button>
                <button class="nav-button secondary" onclick="openModal('registerModal')" id="registerBtn">Sign Up</button>
                <button class="nav-button" onclick="openModal('postModal')" id="postBtn" style="display: none;">Create Post</button>
                <button class="nav-button secondary" onclick="logout()" id="logoutBtn" style="display: none;">Logout</button>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <div class="container">
        <div class="main-content">
            <!-- Sort Tabs -->
            <div class="sort-tabs">
                <button class="sort-tab active" onclick="sortPosts('hot')">🔥 Hot</button>
                <button class="sort-tab" onclick="sortPosts('new')">🆕 New</button>
                <button class="sort-tab" onclick="sortPosts('top')">⬆️ Top</button>
            </div>

            <!-- Posts Container -->
            <div id="postsContainer">
                <div class="loading">Loading posts...</div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
            <!-- User Profile (when logged in) -->
            <div class="sidebar-card" id="userProfile" style="display: none;">
                <div class="user-profile">
                    <div class="user-avatar" id="userAvatar">U</div>
                    <div class="user-info">
                        <h4 id="userDisplayName">Username</h4>
                        <p id="userKarma">0 karma</p>
                    </div>
                </div>
            </div>

            <!-- Create Post Button -->
            <div class="sidebar-card">
                <h3>Create Content</h3>
                <button class="nav-button" onclick="openModal('postModal')" style="width: 100%; margin-bottom: 8px;">Report Grievance</button>
                <button class="nav-button secondary" onclick="openModal('postModal', 'news')" style="width: 100%;">Share AI News</button>
            </div>

            <!-- Platform Info -->
            <div class="sidebar-card">
                <h3>About TexhPulze</h3>
                <p style="font-size: 14px; color: #878a8c; line-height: 1.4;">
                    The world's first public grievance and discussion platform for technology. 
                    Report issues, discuss AI news, and help shape tech policy.
                </p>
            </div>
        </div>
    </div>

    <!-- Login Modal -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Log In</h3>
                <button class="close-button" onclick="closeModal('loginModal')">&times;</button>
            </div>
            <form onsubmit="login(event)">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-input" name="username" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" name="password" required>
                </div>
                <button type="submit" class="submit-button">Log In</button>
            </form>
            <p style="text-align: center; margin-top: 16px; font-size: 14px;">
                Don't have an account? <a href="#" onclick="closeModal('loginModal'); openModal('registerModal');">Sign up</a>
            </p>
        </div>
    </div>

    <!-- Register Modal -->
    <div id="registerModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Sign Up</h3>
                <button class="close-button" onclick="closeModal('registerModal')">&times;</button>
            </div>
            <form onsubmit="register(event)">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-input" name="username" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" name="email" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Display Name</label>
                    <input type="text" class="form-input" name="displayName" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" name="password" required>
                </div>
                <button type="submit" class="submit-button">Sign Up</button>
            </form>
            <p style="text-align: center; margin-top: 16px; font-size: 14px;">
                Already have an account? <a href="#" onclick="closeModal('registerModal'); openModal('loginModal');">Log in</a>
            </p>
        </div>
    </div>

    <!-- Create Post Modal -->
    <div id="postModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Create Post</h3>
                <button class="close-button" onclick="closeModal('postModal')">&times;</button>
            </div>
            <form onsubmit="createPost(event)">
                <div class="form-group">
                    <label class="form-label">Post Type</label>
                    <select class="form-select" name="type" onchange="togglePostFields(this.value)">
                        <option value="grievance">Report Grievance</option>
                        <option value="news">Share AI News</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-input" name="title" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Content</label>
                    <textarea class="form-textarea" name="content" required></textarea>
                </div>
                <div class="form-group" id="grievanceFields">
                    <label class="form-label">Category</label>
                    <select class="form-select" name="category">
                        <option value="AI Bias">AI Bias</option>
                        <option value="Privacy Violation">Privacy Violation</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Safety Risk">Safety Risk</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group" id="grievanceFields2">
                    <label class="form-label">Criticality</label>
                    <select class="form-select" name="criticality">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-input" name="location" placeholder="e.g., United States, Global">
                </div>
                <button type="submit" class="submit-button">Create Post</button>
            </form>
        </div>
    </div>

    <script>
        // Global state
        let currentUser = null;
        let currentSort = 'hot';
        let authToken = localStorage.getItem('authToken');

        // Initialize app
        document.addEventListener('DOMContentLoaded', () => {
            if (authToken) {
                checkAuth();
            }
            loadPosts();
        });

        // Authentication functions
        async function checkAuth() {
            try {
                const response = await fetch('/api/auth/me', {
                    headers: { 'Authorization': \`Bearer \${authToken}\` }
                });
                const data = await response.json();
                
                if (data.success) {
                    currentUser = data.user;
                    updateUI();
                } else {
                    localStorage.removeItem('authToken');
                    authToken = null;
                }
            } catch (error) {
                localStorage.removeItem('authToken');
                authToken = null;
            }
        }

        async function login(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (result.success) {
                    authToken = result.token;
                    localStorage.setItem('authToken', authToken);
                    currentUser = result.user;
                    updateUI();
                    closeModal('loginModal');
                    showMessage('Successfully logged in!', 'success');
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                showMessage('Login failed. Please try again.', 'error');
            }
        }

        async function register(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (result.success) {
                    authToken = result.token;
                    localStorage.setItem('authToken', authToken);
                    currentUser = result.user;
                    updateUI();
                    closeModal('registerModal');
                    showMessage('Account created successfully!', 'success');
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                showMessage('Registration failed. Please try again.', 'error');
            }
        }

        function logout() {
            currentUser = null;
            authToken = null;
            localStorage.removeItem('authToken');
            updateUI();
            showMessage('Logged out successfully', 'success');
        }

        // UI functions
        function updateUI() {
            const loginBtn = document.getElementById('loginBtn');
            const registerBtn = document.getElementById('registerBtn');
            const postBtn = document.getElementById('postBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            const userProfile = document.getElementById('userProfile');

            if (currentUser) {
                loginBtn.style.display = 'none';
                registerBtn.style.display = 'none';
                postBtn.style.display = 'block';
                logoutBtn.style.display = 'block';
                userProfile.style.display = 'block';
                
                document.getElementById('userAvatar').textContent = currentUser.profile.displayName.charAt(0).toUpperCase();
                document.getElementById('userDisplayName').textContent = currentUser.profile.displayName;
                document.getElementById('userKarma').textContent = \`\${currentUser.profile.karma} karma\`;
            } else {
                loginBtn.style.display = 'block';
                registerBtn.style.display = 'block';
                postBtn.style.display = 'none';
                logoutBtn.style.display = 'none';
                userProfile.style.display = 'none';
            }
        }

        // Modal functions
        function openModal(modalId, type = null) {
            if (!currentUser && modalId === 'postModal') {
                showMessage('Please log in to create posts', 'error');
                return;
            }

            const modal = document.getElementById(modalId);
            modal.style.display = 'block';
            
            if (type && modalId === 'postModal') {
                document.querySelector('select[name="type"]').value = type;
                togglePostFields(type);
            }
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function togglePostFields(type) {
            const grievanceFields = document.getElementById('grievanceFields');
            const grievanceFields2 = document.getElementById('grievanceFields2');
            
            if (type === 'grievance') {
                grievanceFields.style.display = 'block';
                grievanceFields2.style.display = 'block';
            } else {
                grievanceFields.style.display = 'none';
                grievanceFields2.style.display = 'none';
            }
        }

        // Post functions
        async function loadPosts() {
            const container = document.getElementById('postsContainer');
            
            try {
                const response = await fetch(\`/api/posts?sort=\${currentSort}\`);
                const data = await response.json();
                
                if (data.success && data.posts.length > 0) {
                    container.innerHTML = data.posts.map(post => createPostHTML(post)).join('');
                } else {
                    container.innerHTML = '<div class="loading">No posts available</div>';
                }
            } catch (error) {
                container.innerHTML = \`<div class="error">Error loading posts: \${error.message}</div>\`;
            }
        }

        function createPostHTML(post) {
            const criticalityClass = post.criticality ? post.criticality.toLowerCase() : '';
            const timeAgo = getTimeAgo(post.createdAt);
            const isGrievance = post.type === 'grievance';
            
            return \`
                <div class="post-card" data-post-id="\${post.id}">
                    <div class="vote-section">
                        <button class="vote-button" onclick="vote(\${post.id}, 1)">⬆️</button>
                        <div class="vote-score">\${post.votes || 0}</div>
                        <button class="vote-button" onclick="vote(\${post.id}, -1)">⬇️</button>
                    </div>
                    <div class="post-content">
                        <div class="post-meta">
                            <span>r/\${post.category || 'technology'}</span>
                            <span>•</span>
                            <span>Posted by <a href="#">u/\${post.author}</a> \${timeAgo}</span>
                            \${isGrievance && post.criticality ? \`<span class="criticality-badge \${criticalityClass}">\${post.criticality}</span>\` : ''}
                        </div>
                        <h3 class="post-title">
                            <a href="#" onclick="viewPost(\${post.id})">\${post.title}</a>
                        </h3>
                        <div class="post-text">\${post.content}</div>
                        \${isGrievance && post.aiRiskScore ? \`
                            <div style="background: #f6f7f8; padding: 8px; border-radius: 4px; margin: 8px 0; font-size: 12px;">
                                <strong>AI Risk Score:</strong> \${Math.round(post.aiRiskScore * 10) / 10}/10 | 
                                <strong>Government Action:</strong> \${post.governmentAction || 'Under Review'}
                            </div>
                        \` : ''}
                        <div class="post-actions">
                            <div class="post-action" onclick="viewPost(\${post.id})">
                                💬 \${post.comments || 0} comments
                            </div>
                            <div class="post-action" onclick="sharePost(\${post.id})">
                                📤 Share
                            </div>
                            <div class="post-action" onclick="savePost(\${post.id})">
                                💾 Save
                            </div>
                        </div>
                    </div>
                </div>
            \`;
        }

        async function createPost(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${authToken}\`
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (result.success) {
                    closeModal('postModal');
                    event.target.reset();
                    loadPosts();
                    showMessage('Post created successfully!', 'success');
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                showMessage('Failed to create post. Please try again.', 'error');
            }
        }

        async function vote(postId, voteValue) {
            if (!currentUser) {
                showMessage('Please log in to vote', 'error');
                return;
            }

            try {
                const response = await fetch(\`/api/posts/\${postId}/vote\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${authToken}\`
                    },
                    body: JSON.stringify({ vote: voteValue })
                });
                const result = await response.json();

                if (result.success) {
                    loadPosts(); // Refresh posts to show updated votes
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                showMessage('Failed to vote. Please try again.', 'error');
            }
        }

        function sortPosts(sort) {
            currentSort = sort;
            
            // Update active tab
            document.querySelectorAll('.sort-tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
            
            loadPosts();
        }

        function viewPost(postId) {
            showMessage(\`Viewing post \${postId} (feature coming soon)\`, 'info');
        }

        function sharePost(postId) {
            showMessage(\`Sharing post \${postId} (feature coming soon)\`, 'info');
        }

        function savePost(postId) {
            showMessage(\`Saving post \${postId} (feature coming soon)\`, 'info');
        }

        // Utility functions
        function getTimeAgo(dateString) {
            const now = new Date();
            const postDate = new Date(dateString);
            const diffMs = now - postDate;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'just now';
            if (diffMins < 60) return \`\${diffMins}m ago\`;
            if (diffHours < 24) return \`\${diffHours}h ago\`;
            return \`\${diffDays}d ago\`;
        }

        function showMessage(message, type = 'info') {
            // Create a simple toast notification
            const toast = document.createElement('div');
            toast.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                transition: opacity 0.3s;
                \${type === 'success' ? 'background: #46d160;' : ''}
                \${type === 'error' ? 'background: #ff4500;' : ''}
                \${type === 'info' ? 'background: #0079d3;' : ''}
            \`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
        }

        // Close modals when clicking outside
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        }
    </script>
</body>
</html>
    `);
  }
});

const PORT = 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TexhPulze Test Server Started!`);
  console.log(`✅ Server running on port: ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('================================');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
