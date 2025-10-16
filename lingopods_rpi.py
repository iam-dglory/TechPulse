#!/usr/bin/env python3
"""
LingoPods Raspberry Pi - Embedded Audio Translation Device
========================================================

A Python script for Raspberry Pi Zero that provides real-time speech translation:
I2S Mic → WiFi Translation → I2S/PWM Speaker

Hardware Requirements:
- Raspberry Pi Zero W (WiFi enabled)
- INMP441 I2S microphone module
- I2S DAC (e.g., MAX98357A) or PWM speaker
- Push button for control
- Optional: Status LED

Wiring:
- INMP441: VCC→3.3V, GND→GND, WS→GPIO18, SD→GPIO19, SCK→GPIO18
- MAX98357A: VCC→5V, GND→GND, BCLK→GPIO18, LRC→GPIO19, DIN→GPIO21
- Button: GPIO3 (I2C SDA) or GPIO2 (I2C SCL) or custom GPIO
- LED: GPIO25 or custom GPIO

Dependencies:
sudo apt-get install python3-pip python3-dev portaudio19-dev
pip3 install pyaudio whisper googletrans pyttsx3 RPi.GPIO

Usage:
1. Configure WiFi and install dependencies
2. Run: python3 lingopods_rpi.py
3. Press button to start recording
"""

import os
import sys
import time
import threading
import tempfile
import wave
import subprocess
import json
import requests
from typing import Optional, Dict, Any

# Hardware control
try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    print("Warning: RPi.GPIO not available. Install with: pip3 install RPi.GPIO")
    GPIO_AVAILABLE = False

# Audio recording
try:
    import pyaudio
    AUDIO_AVAILABLE = True
except ImportError:
    print("Warning: pyaudio not available. Install with: sudo apt-get install python3-pyaudio")
    AUDIO_AVAILABLE = False

# Speech-to-text (use lighter model for Pi Zero)
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    print("Warning: whisper not available. Install with: pip3 install openai-whisper")
    WHISPER_AVAILABLE = False

# Translation
try:
    from googletrans import Translator
    TRANSLATION_AVAILABLE = True
except ImportError:
    print("Warning: googletrans not available. Install with: pip3 install googletrans==4.0.0rc1")
    TRANSLATION_AVAILABLE = False

# Text-to-speech
try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    print("Warning: pyttsx3 not available. Install with: pip3 install pyttsx3")
    TTS_AVAILABLE = False


class HardwareConfig:
    """Hardware configuration for Raspberry Pi."""
    
    # GPIO pins
    BUTTON_PIN = 3    # GPIO3 (SDA) - can use any GPIO
    LED_PIN = 25      # GPIO25 - can use any GPIO
    STATUS_LED_PIN = 24  # GPIO24 - additional status LED
    
    # Audio settings
    SAMPLE_RATE = 16000
    CHUNK_SIZE = 1024
    CHANNELS = 1
    BITS_PER_SAMPLE = 16
    RECORDING_DURATION = 3  # seconds
    
    # WiFi settings (configure in /etc/wpa_supplicant/wpa_supplicant.conf)
    # Or use raspi-config to set up WiFi
    
    # Translation settings
    TARGET_LANGUAGE = "es"  # Spanish
    SOURCE_LANGUAGE = "auto"
    
    # Whisper model (use smaller model for Pi Zero)
    WHISPER_MODEL = "tiny"  # Options: tiny, base, small, medium, large


class LingoPodsRPi:
    """Main class for Raspberry Pi LingoPods device."""
    
    def __init__(self):
        """Initialize the Raspberry Pi LingoPods device."""
        self.config = HardwareConfig()
        self.recording = False
        self.processing = False
        
        # Initialize hardware components
        self._init_gpio()
        self._init_audio()
        self._init_components()
        
        print("LingoPods Raspberry Pi initialized")
    
    def _init_gpio(self):
        """Initialize GPIO pins."""
        if not GPIO_AVAILABLE:
            print("✗ GPIO not available")
            return
        
        try:
            # Set GPIO mode
            GPIO.setmode(GPIO.BCM)
            GPIO.setwarnings(False)
            
            # Button with pull-up
            GPIO.setup(self.config.BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            
            # Status LEDs
            GPIO.setup(self.config.LED_PIN, GPIO.OUT)
            GPIO.setup(self.config.STATUS_LED_PIN, GPIO.OUT)
            
            # Configure button interrupt
            GPIO.add_event_detect(
                self.config.BUTTON_PIN, 
                GPIO.FALLING, 
                callback=self._button_pressed,
                bouncetime=300  # 300ms debounce
            )
            
            print("✓ GPIO initialized")
            
        except Exception as e:
            print(f"✗ GPIO initialization failed: {e}")
    
    def _init_audio(self):
        """Initialize audio system."""
        if not AUDIO_AVAILABLE:
            print("✗ Audio recording not available")
            return
        
        try:
            # Initialize PyAudio
            self.audio = pyaudio.PyAudio()
            
            # Find available audio devices
            print("Available audio devices:")
            for i in range(self.audio.get_device_count()):
                info = self.audio.get_device_info_by_index(i)
                if info['maxInputChannels'] > 0:
                    print(f"  Input {i}: {info['name']}")
                if info['maxOutputChannels'] > 0:
                    print(f"  Output {i}: {info['name']}")
            
            print("✓ Audio system initialized")
            
        except Exception as e:
            print(f"✗ Audio initialization failed: {e}")
    
    def _init_components(self):
        """Initialize speech processing components."""
        # Initialize Whisper model
        if WHISPER_AVAILABLE:
            try:
                print(f"Loading Whisper model ({self.config.WHISPER_MODEL})...")
                self.whisper_model = whisper.load_model(self.config.WHISPER_MODEL)
                print("✓ Whisper model loaded")
            except Exception as e:
                print(f"✗ Whisper model failed: {e}")
                self.whisper_model = None
        else:
            self.whisper_model = None
        
        # Initialize translator
        if TRANSLATION_AVAILABLE:
            try:
                self.translator = Translator()
                print("✓ Translator initialized")
            except Exception as e:
                print(f"✗ Translator failed: {e}")
                self.translator = None
        else:
            self.translator = None
        
        # Initialize TTS
        if TTS_AVAILABLE:
            try:
                self.tts_engine = pyttsx3.init()
                
                # Configure TTS for Raspberry Pi
                voices = self.tts_engine.getProperty('voices')
                if voices:
                    # Try to use a female voice if available
                    for voice in voices:
                        if 'female' in voice.name.lower() or 'woman' in voice.name.lower():
                            self.tts_engine.setProperty('voice', voice.id)
                            break
                    else:
                        self.tts_engine.setProperty('voice', voices[0].id)
                
                # Adjust for Pi Zero performance
                self.tts_engine.setProperty('rate', 120)  # Slower speech
                self.tts_engine.setProperty('volume', 0.8)
                
                print("✓ TTS engine initialized")
            except Exception as e:
                print(f"✗ TTS engine failed: {e}")
                self.tts_engine = None
        else:
            self.tts_engine = None
    
    def _button_pressed(self, channel):
        """Button press interrupt handler."""
        if self.processing:
            return  # Already processing
        
        # Start translation in a separate thread
        threading.Thread(target=self._start_translation_process, daemon=True).start()
    
    def _led_status(self, status: bool, blink: bool = False):
        """Update status LEDs."""
        if not GPIO_AVAILABLE:
            return
        
        try:
            if blink:
                # Blink the LED
                GPIO.output(self.config.LED_PIN, GPIO.HIGH)
                time.sleep(0.1)
                GPIO.output(self.config.LED_PIN, GPIO.LOW)
            else:
                GPIO.output(self.config.LED_PIN, GPIO.HIGH if status else GPIO.LOW)
                GPIO.output(self.config.STATUS_LED_PIN, GPIO.HIGH if status else GPIO.LOW)
        except Exception as e:
            print(f"LED control failed: {e}")
    
    def _record_audio(self) -> Optional[str]:
        """Record audio from microphone."""
        if not AUDIO_AVAILABLE or not self.audio:
            print("✗ Audio recording not available")
            return None
        
        print("Recording audio...")
        self.recording = True
        self._led_status(True, blink=True)
        
        try:
            # Open audio stream
            stream = self.audio.open(
                format=pyaudio.paInt16,
                channels=self.config.CHANNELS,
                rate=self.config.SAMPLE_RATE,
                input=True,
                frames_per_buffer=self.config.CHUNK_SIZE,
                input_device_index=None  # Use default input device
            )
            
            # Record audio
            frames = []
            for i in range(0, int(self.config.SAMPLE_RATE / self.config.CHUNK_SIZE * self.config.RECORDING_DURATION)):
                data = stream.read(self.config.CHUNK_SIZE)
                frames.append(data)
            
            # Stop and close the stream
            stream.stop_stream()
            stream.close()
            
            # Save to temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            
            with wave.open(temp_file.name, 'wb') as wf:
                wf.setnchannels(self.config.CHANNELS)
                wf.setsampwidth(self.audio.get_sample_size(pyaudio.paInt16))
                wf.setframerate(self.config.SAMPLE_RATE)
                wf.writeframes(b''.join(frames))
            
            print(f"✓ Audio recorded: {temp_file.name}")
            return temp_file.name
            
        except Exception as e:
            print(f"✗ Recording failed: {e}")
            return None
        finally:
            self.recording = False
    
    def _transcribe_audio(self, audio_file: str) -> Optional[str]:
        """Transcribe audio to text using Whisper."""
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
                print(f"✓ Transcription: '{transcribed_text}'")
                return transcribed_text
            else:
                print("✗ No speech detected")
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
    
    def _translate_text(self, text: str) -> Optional[str]:
        """Translate text using Google Translate."""
        if not self.translator:
            print("✗ Translator not available")
            return None
        
        if not text or not text.strip():
            print("✗ No text to translate")
            return None
        
        print(f"Translating: '{text}'")
        
        try:
            # Translate the text
            result = self.translator.translate(
                text, 
                dest=self.config.TARGET_LANGUAGE, 
                src=self.config.SOURCE_LANGUAGE
            )
            
            if result.text:
                print(f"✓ Translation: '{result.text}'")
                print(f"  Source language: {result.src}")
                return result.text
            else:
                print("✗ Translation failed")
                return None
                
        except Exception as e:
            print(f"✗ Translation failed: {e}")
            return None
    
    def _speak_text(self, text: str) -> bool:
        """Convert text to speech using pyttsx3."""
        if not self.tts_engine:
            print("✗ TTS engine not available")
            return False
        
        if not text or not text.strip():
            print("✗ No text to speak")
            return False
        
        print(f"Speaking: '{text}'")
        
        try:
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()
            print("✓ Speech completed")
            return True
            
        except Exception as e:
            print(f"✗ Speech failed: {e}")
            return False
    
    def _start_translation_process(self):
        """Start the complete translation process."""
        if self.processing:
            return
        
        self.processing = True
        self._led_status(True)
        
        try:
            print("\n" + "="*50)
            print("Starting translation process...")
            print("="*50)
            
            # Step 1: Record audio
            audio_file = self._record_audio()
            if not audio_file:
                print("Process failed at recording stage")
                return
            
            # Step 2: Transcribe audio
            transcribed_text = self._transcribe_audio(audio_file)
            if not transcribed_text:
                print("Process failed at transcription stage")
                return
            
            # Step 3: Translate text
            translated_text = self._translate_text(transcribed_text)
            if not translated_text:
                print("Process failed at translation stage")
                return
            
            # Step 4: Speak translated text
            self._speak_text(translated_text)
            
            print("\n" + "="*50)
            print("✓ Translation process completed!")
            print(f"Original: {transcribed_text}")
            print(f"Translated: {translated_text}")
            print("="*50)
            
        except Exception as e:
            print(f"✗ Process failed: {e}")
        finally:
            self.processing = False
            self._led_status(False)
    
    def run(self):
        """Main control loop."""
        print("LingoPods Raspberry Pi Ready!")
        print("Press button to start translation...")
        print("Press Ctrl+C to exit")
        
        try:
            while True:
                # Main loop - button interrupts handle the work
                time.sleep(1)
                
                # Blink status LED to show device is alive
                if not self.processing:
                    self._led_status(False, blink=True)
                
        except KeyboardInterrupt:
            print("\nShutting down...")
        finally:
            self._cleanup()
    
    def _cleanup(self):
        """Clean up resources."""
        if GPIO_AVAILABLE:
            GPIO.cleanup()
        
        if AUDIO_AVAILABLE and hasattr(self, 'audio'):
            self.audio.terminate()
        
        print("✓ Cleanup completed")


def main():
    """Main function."""
    try:
        # Check if running on Raspberry Pi
        if not os.path.exists('/proc/cpuinfo'):
            print("Warning: This script is designed for Raspberry Pi")
        
        # Initialize and run LingoPods Raspberry Pi
        lingopods = LingoPodsRPi()
        lingopods.run()
        
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()













