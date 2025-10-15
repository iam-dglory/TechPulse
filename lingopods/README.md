# LingoPods - Real-time Language Translation App

LingoPods is a full-stack web application that enables real-time language translation between two users. Speak in your native language and see/hear instant translations to break down language barriers.

## Features

- 🎤 **Real-time Speech Recognition** - Speak naturally and see your words transcribed
- 🌍 **Multi-language Support** - Support for 12+ languages including English, Spanish, French, German, and more
- 🔄 **Live Translation** - Instant translation between any two supported languages
- 🔊 **Text-to-Speech** - Hear translations spoken aloud in the target language
- ⚡ **Real-time Communication** - WebSocket-based communication for instant updates
- 🎨 **Modern UI** - Beautiful, responsive interface built with React and TailwindCSS

## Tech Stack

### Frontend

- **React 18** - Modern React with hooks
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **Socket.IO Client** - Real-time communication

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - WebSocket communication
- **LibreTranslate** - Free translation service

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser with speech recognition support

## Installation & Setup

### 1. Clone and Setup Backend

```bash
cd lingopods/backend
npm install
```

### 2. Setup Frontend

```bash
cd lingopods/frontend
npm install
```

### 3. Environment Configuration (Optional)

Create a `.env` file in the backend directory:

```bash
cd lingopods/backend
cp env.example .env
```

Edit `.env` to add your Google Translate API key (optional - app works with free LibreTranslate):

```env
PORT=5000
NODE_ENV=development
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
CORS_ORIGIN=http://localhost:3000
```

## Running the Application

### Development Mode

1. **Start the Backend Server:**

```bash
cd lingopods/backend
npm run dev
```

2. **Start the Frontend Development Server:**

```bash
cd lingopods/frontend
npm run dev
```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Production Build

1. **Build the Frontend:**

```bash
cd lingopods/frontend
npm run build
```

2. **Start the Production Server:**

```bash
cd lingopods/backend
npm start
```

## How to Use

1. **Select Languages**: Choose the languages for User A and User B from the dropdown menus
2. **Start Speaking**: Click the microphone button and speak clearly in your selected language
3. **View Translation**: Your speech will be transcribed and translated in real-time
4. **Hear Translation**: Click the play button to hear the translation spoken aloud
5. **Switch Users**: Only one user can speak at a time - the other user's microphone will be disabled

## Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)
- Hindi (hi)

## Browser Compatibility

- **Speech Recognition**: Chrome, Edge, Safari (desktop), Chrome Mobile
- **Text-to-Speech**: All modern browsers
- **WebSockets**: All modern browsers

## API Services

The app uses LibreTranslate (free) for translation services. For better accuracy and more languages, you can configure Google Translate API:

1. Get a Google Cloud API key
2. Enable the Cloud Translation API
3. Add your key to the `.env` file

## Troubleshooting

### Speech Recognition Not Working

- Ensure you're using a supported browser
- Check that microphone permissions are granted
- Try refreshing the page

### Translation Issues

- Check your internet connection
- LibreTranslate service might be temporarily unavailable
- Consider using Google Translate API for better reliability

### Connection Problems

- Ensure the backend server is running on port 5000
- Check that CORS settings allow your frontend origin
- Verify WebSocket connections in browser dev tools

## Development

### Project Structure

```
lingopods/
├── backend/
│   ├── server.js          # Express server with Socket.IO
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Custom styles
│   │   ├── index.css      # TailwindCSS imports
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   └── tailwind.config.js # TailwindCSS configuration
└── README.md              # This file
```

### Adding New Features

- **New Languages**: Add language codes to the `LANGUAGES` array in `App.jsx`
- **Translation Service**: Modify the `translateText` function in `server.js`
- **UI Components**: Add new components in the `frontend/src/` directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Ensure all dependencies are properly installed
4. Verify that both frontend and backend servers are running

---

**LingoPods** - Breaking language barriers, one conversation at a time. 🗣️🌍
