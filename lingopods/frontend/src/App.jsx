import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

function App() {
  const [socket, setSocket] = useState(null);
  const [userALanguage, setUserALanguage] = useState('en');
  const [userBLanguage, setUserBLanguage] = useState('es');
  const [userAText, setUserAText] = useState('');
  const [userBText, setUserBText] = useState('');
  const [userATranslation, setUserATranslation] = useState('');
  const [userBTranslation, setUserBTranslation] = useState('');
  const [isUserARecording, setIsUserARecording] = useState(false);
  const [isUserBRecording, setIsUserBRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('connected');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
    });

    newSocket.on('translation-result', (data) => {
      console.log('Translation received:', data);
      
      if (data.userId === 'userA') {
        setUserATranslation(data.translatedText);
        setUserAText(data.originalText);
      } else if (data.userId === 'userB') {
        setUserBTranslation(data.translatedText);
        setUserBText(data.originalText);
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = userALanguage; // Default to user A language

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          // Send to server for translation
          if (socket && socket.connected) {
            socket.emit('speech-result', {
              text: finalTranscript,
              fromLang: userALanguage,
              toLang: userBLanguage,
              userId: 'userA'
            });
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsUserARecording(false);
        setIsUserBRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsUserARecording(false);
        setIsUserBRecording(false);
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, [socket, userALanguage, userBLanguage]);

  const startRecording = (user) => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (user === 'A') {
      recognitionRef.current.lang = userALanguage;
      setIsUserARecording(true);
      setUserAText('');
      setUserATranslation('');
    } else {
      recognitionRef.current.lang = userBLanguage;
      setIsUserBRecording(true);
      setUserBText('');
      setUserBTranslation('');
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsUserARecording(false);
      setIsUserBRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsUserARecording(false);
    setIsUserBRecording(false);
  };

  const playTranslation = (text, language) => {
    if (synthRef.current && text) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      synthRef.current.speak(utterance);
    }
  };

  const clearTexts = () => {
    setUserAText('');
    setUserBText('');
    setUserATranslation('');
    setUserBTranslation('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">LingoPods</h1>
                <p className="text-gray-600">Breaking language barriers, one conversation at a time.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User A Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User A</h2>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Language:</label>
                <select
                  value={userALanguage}
                  onChange={(e) => setUserALanguage(e.target.value)}
                  className="language-select"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Microphone Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => isUserARecording ? stopRecording() : startRecording('A')}
                className={`mic-button ${isUserARecording ? 'recording' : 'idle'}`}
                disabled={isUserBRecording}
              >
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Text Display */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recognized Speech:
                </label>
                <textarea
                  value={userAText}
                  onChange={(e) => setUserAText(e.target.value)}
                  placeholder="Your speech will appear here..."
                  className="text-box"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Translation:
                </label>
                <div className="relative">
                  <textarea
                    value={userATranslation}
                    onChange={(e) => setUserATranslation(e.target.value)}
                    placeholder="Translation will appear here..."
                    className="text-box"
                    rows="3"
                  />
                  {userATranslation && (
                    <button
                      onClick={() => playTranslation(userATranslation, userBLanguage)}
                      className="absolute top-2 right-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      title="Play translation"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User B Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User B</h2>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Language:</label>
                <select
                  value={userBLanguage}
                  onChange={(e) => setUserBLanguage(e.target.value)}
                  className="language-select"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Microphone Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => isUserBRecording ? stopRecording() : startRecording('B')}
                className={`mic-button ${isUserBRecording ? 'recording' : 'idle'}`}
                disabled={isUserARecording}
              >
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Text Display */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recognized Speech:
                </label>
                <textarea
                  value={userBText}
                  onChange={(e) => setUserBText(e.target.value)}
                  placeholder="Your speech will appear here..."
                  className="text-box"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Translation:
                </label>
                <div className="relative">
                  <textarea
                    value={userBTranslation}
                    onChange={(e) => setUserBTranslation(e.target.value)}
                    placeholder="Translation will appear here..."
                    className="text-box"
                    rows="3"
                  />
                  {userBTranslation && (
                    <button
                      onClick={() => playTranslation(userBTranslation, userALanguage)}
                      className="absolute top-2 right-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      title="Play translation"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={clearTexts}
            className="btn-secondary"
          >
            Clear All
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use LingoPods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-medium">Select Languages</p>
                <p>Choose the languages for User A and User B from the dropdown menus.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-medium">Start Speaking</p>
                <p>Click the microphone button and speak clearly. The app will recognize your speech.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-medium">Hear Translation</p>
                <p>Click the play button next to translations to hear them spoken aloud.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
