const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Translation service (using LibreTranslate as free alternative)
const translateText = async (text, fromLang, toLang) => {
  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        source: fromLang,
        target: toLang,
        format: 'text'
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle speech recognition results
  socket.on('speech-result', async (data) => {
    try {
      const { text, fromLang, toLang, userId } = data;
      
      // Translate the text
      const translatedText = await translateText(text, fromLang, toLang);
      
      // Broadcast to all clients
      socket.broadcast.emit('translation-result', {
        originalText: text,
        translatedText: translatedText,
        fromLang: fromLang,
        toLang: toLang,
        userId: userId,
        timestamp: new Date().toISOString()
      });
      
      // Also send back to sender
      socket.emit('translation-result', {
        originalText: text,
        translatedText: translatedText,
        fromLang: fromLang,
        toLang: toLang,
        userId: userId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error processing speech:', error);
      socket.emit('error', { message: 'Failed to process translation' });
    }
  });

  // Handle user language preferences
  socket.on('set-language', (data) => {
    socket.language = data.language;
    socket.userId = data.userId;
    console.log(`User ${data.userId} set language to ${data.language}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LingoPods backend is running' });
});

// Serve React app for production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`LingoPods backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
