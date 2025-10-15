#!/usr/bin/env python3
"""
LingoPods Core - Audio Translation Pipeline
==========================================

A Python script that provides real-time speech translation capabilities:
record → transcribe → translate → speak

Dependencies:
- pyaudio (for audio recording)
- whisper (for speech-to-text)
- googletrans (for translation)
- pyttsx3 (for text-to-speech)
- numpy (for audio processing)

Install dependencies:
pip install pyaudio whisper googletrans pyttsx3 numpy

Note: You may need to install additional system dependencies for pyaudio:
- Windows: pip install pipwin && pipwin install pyaudio
- macOS: brew install portaudio && pip install pyaudio
- Linux: sudo apt-get install python3-pyaudio
"""

import os
import sys
import time
import tempfile
import wave
import numpy as np
from typing import Optional, Tuple

# Audio recording
try:
    import pyaudio
    AUDIO_AVAILABLE = True
except ImportError:
    print("Warning: pyaudio not available. Audio recording will be disabled.")
    AUDIO_AVAILABLE = False

# Speech-to-text
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    print("Warning: whisper not available. Please install with: pip install openai-whisper")
    WHISPER_AVAILABLE = False

# Translation
try:
    from googletrans import Translator
    TRANSLATION_AVAILABLE = True
except ImportError:
    print("Warning: googletrans not available. Please install with: pip install googletrans==4.0.0rc1")
    TRANSLATION_AVAILABLE = False

# Text-to-speech
try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    print("Warning: pyttsx3 not available. Please install with: pip install pyttsx3")
    TTS_AVAILABLE = False


class LingoPodsCore:
    """Main class for the LingoPods audio translation pipeline."""
    
    def __init__(self, 
                 model_size: str = "base",
                 sample_rate: int = 16000,
                 chunk_size: int = 1024,
                 channels: int = 1,
                 target_language: str = "en"):
        """
        Initialize the LingoPods core system.
        
        Args:
            model_size: Whisper model size (tiny, base, small, medium, large)
            sample_rate: Audio sample rate in Hz
            chunk_size: Audio chunk size for recording
            channels: Number of audio channels
            target_language: Target language for translation (ISO 639-1 code)
        """
        self.model_size = model_size
        self.sample_rate = sample_rate
        self.chunk_size = chunk_size
        self.channels = channels
        self.target_language = target_language
        
        # Initialize components
        self.whisper_model = None
        self.translator = None
        self.tts_engine = None
        
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize all required components."""
        print("Initializing LingoPods components...")
        
        # Initialize Whisper model
        if WHISPER_AVAILABLE:
            try:
                print(f"Loading Whisper model ({self.model_size})...")
                self.whisper_model = whisper.load_model(self.model_size)
                print("✓ Whisper model loaded successfully")
            except Exception as e:
                print(f"✗ Failed to load Whisper model: {e}")
                self.whisper_model = None
        else:
            print("✗ Whisper not available")
        
        # Initialize translator
        if TRANSLATION_AVAILABLE:
            try:
                print("Initializing Google Translator...")
                self.translator = Translator()
                print("✓ Translator initialized successfully")
            except Exception as e:
                print(f"✗ Failed to initialize translator: {e}")
                self.translator = None
        else:
            print("✗ Translation not available")
        
        # Initialize TTS engine
        if TTS_AVAILABLE:
            try:
                print("Initializing TTS engine...")
                self.tts_engine = pyttsx3.init()
                
                # Configure TTS properties
                voices = self.tts_engine.getProperty('voices')
                if voices:
                    self.tts_engine.setProperty('voice', voices[0].id)
                
                self.tts_engine.setProperty('rate', 150)  # Speed of speech
                self.tts_engine.setProperty('volume', 0.8)  # Volume level
                
                print("✓ TTS engine initialized successfully")
            except Exception as e:
                print(f"✗ Failed to initialize TTS engine: {e}")
                self.tts_engine = None
        else:
            print("✗ TTS not available")
        
        print("Component initialization complete.\n")
    
    def record_audio(self, duration: float = 5.0) -> Optional[str]:
        """
        Record audio from the microphone.
        
        Args:
            duration: Recording duration in seconds
            
        Returns:
            Path to the recorded audio file, or None if recording failed
        """
        if not AUDIO_AVAILABLE:
            print("✗ Audio recording not available (pyaudio not installed)")
            return None
        
        print(f"Recording audio for {duration} seconds...")
        print("Speak now...")
        
        try:
            # Initialize PyAudio
            audio = pyaudio.PyAudio()
            
            # Open audio stream
            stream = audio.open(
                format=pyaudio.paInt16,
                channels=self.channels,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=self.chunk_size
            )
            
            # Record audio
            frames = []
            for i in range(0, int(self.sample_rate / self.chunk_size * duration)):
                data = stream.read(self.chunk_size)
                frames.append(data)
            
            # Stop and close the stream
            stream.stop_stream()
            stream.close()
            audio.terminate()
            
            # Save to temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            
            with wave.open(temp_file.name, 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
                wf.setframerate(self.sample_rate)
                wf.writeframes(b''.join(frames))
            
            print(f"✓ Audio recorded successfully: {temp_file.name}")
            return temp_file.name
            
        except Exception as e:
            print(f"✗ Audio recording failed: {e}")
            return None
    
    def transcribe_audio(self, audio_file: str) -> Optional[str]:
        """
        Transcribe audio to text using Whisper.
        
        Args:
            audio_file: Path to the audio file
            
        Returns:
            Transcribed text, or None if transcription failed
        """
        if not self.whisper_model:
            print("✗ Whisper model not available")
            return None
        
        if not os.path.exists(audio_file):
            print(f"✗ Audio file not found: {audio_file}")
            return None
        
        print("Transcribing audio...")
        
        try:
            # Transcribe using Whisper
            result = self.whisper_model.transcribe(audio_file)
            transcribed_text = result["text"].strip()
            
            if transcribed_text:
                print(f"✓ Transcription successful: '{transcribed_text}'")
                return transcribed_text
            else:
                print("✗ No speech detected in audio")
                return None
                
        except Exception as e:
            print(f"✗ Transcription failed: {e}")
            return None
        finally:
            # Clean up temporary file
            try:
                os.unlink(audio_file)
            except:
                pass
    
    def translate_text(self, text: str, source_language: str = "auto") -> Optional[str]:
        """
        Translate text using Google Translate.
        
        Args:
            text: Text to translate
            source_language: Source language (auto-detect if "auto")
            target_language: Target language (ISO 639-1 code)
            
        Returns:
            Translated text, or None if translation failed
        """
        if not self.translator:
            print("✗ Translator not available")
            return None
        
        if not text or not text.strip():
            print("✗ No text to translate")
            return None
        
        print(f"Translating text to {self.target_language}...")
        
        try:
            # Translate the text
            result = self.translator.translate(text, dest=self.target_language, src=source_language)
            
            if result.text:
                print(f"✓ Translation successful: '{result.text}'")
                print(f"  Detected source language: {result.src}")
                return result.text
            else:
                print("✗ Translation failed - no result")
                return None
                
        except Exception as e:
            print(f"✗ Translation failed: {e}")
            return None
    
    def speak_text(self, text: str) -> bool:
        """
        Convert text to speech using pyttsx3.
        
        Args:
            text: Text to speak
            
        Returns:
            True if speech was successful, False otherwise
        """
        if not self.tts_engine:
            print("✗ TTS engine not available")
            return False
        
        if not text or not text.strip():
            print("✗ No text to speak")
            return False
        
        print(f"Speaking text: '{text}'")
        
        try:
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()
            print("✓ Speech completed successfully")
            return True
            
        except Exception as e:
            print(f"✗ Speech failed: {e}")
            return False
    
    def run_full_pipeline(self, duration: float = 5.0, source_language: str = "auto") -> bool:
        """
        Run the complete audio translation pipeline.
        
        Args:
            duration: Recording duration in seconds
            source_language: Source language for translation
            
        Returns:
            True if pipeline completed successfully, False otherwise
        """
        print("=" * 50)
        print("Starting LingoPods Audio Translation Pipeline")
        print("=" * 50)
        
        # Step 1: Record audio
        print("\n1. RECORDING AUDIO")
        audio_file = self.record_audio(duration)
        if not audio_file:
            print("Pipeline failed at recording stage")
            return False
        
        # Step 2: Transcribe audio
        print("\n2. TRANSCRIBING AUDIO")
        transcribed_text = self.transcribe_audio(audio_file)
        if not transcribed_text:
            print("Pipeline failed at transcription stage")
            return False
        
        # Step 3: Translate text
        print("\n3. TRANSLATING TEXT")
        translated_text = self.translate_text(transcribed_text, source_language)
        if not translated_text:
            print("Pipeline failed at translation stage")
            return False
        
        # Step 4: Speak translated text
        print("\n4. SPEAKING TRANSLATED TEXT")
        speech_success = self.speak_text(translated_text)
        if not speech_success:
            print("Pipeline failed at speech stage")
            return False
        
        print("\n" + "=" * 50)
        print("✓ PIPELINE COMPLETED SUCCESSFULLY!")
        print("=" * 50)
        
        # Summary
        print(f"\nSUMMARY:")
        print(f"Original: {transcribed_text}")
        print(f"Translated: {translated_text}")
        
        return True


def main():
    """Main function for testing the LingoPods core functionality."""
    print("LingoPods Core - Audio Translation Pipeline")
    print("==========================================\n")
    
    # Check system requirements
    print("Checking system requirements...")
    requirements_met = True
    
    if not AUDIO_AVAILABLE:
        print("✗ pyaudio not available - audio recording disabled")
        requirements_met = False
    
    if not WHISPER_AVAILABLE:
        print("✗ whisper not available - transcription disabled")
        requirements_met = False
    
    if not TRANSLATION_AVAILABLE:
        print("✗ googletrans not available - translation disabled")
        requirements_met = False
    
    if not TTS_AVAILABLE:
        print("✗ pyttsx3 not available - speech synthesis disabled")
        requirements_met = False
    
    if not requirements_met:
        print("\nSome requirements are not met. Please install missing dependencies:")
        print("pip install pyaudio whisper googletrans pyttsx3 numpy")
        print("\nContinuing with available components...\n")
    
    # Initialize LingoPods core
    try:
        lingopods = LingoPodsCore(
            model_size="base",  # Use smaller model for faster loading
            target_language="es"  # Translate to Spanish for testing
        )
        
        # Run the pipeline
        print("Press Enter to start recording (or Ctrl+C to exit)...")
        input()
        
        success = lingopods.run_full_pipeline(duration=3.0, source_language="auto")
        
        if success:
            print("\n✓ Test completed successfully!")
        else:
            print("\n✗ Test failed. Check the error messages above.")
            
    except KeyboardInterrupt:
        print("\n\nExiting...")
        sys.exit(0)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
