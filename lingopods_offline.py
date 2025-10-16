#!/usr/bin/env python3
"""
LingoPods Offline - Embedded Audio Translation Device (Offline Mode)
=================================================================

An offline-capable version that works without internet connectivity:
I2S Mic → Local Whisper → Local Translation → TTS Speaker

Features:
- Works completely offline
- Uses local Whisper model for speech-to-text
- Uses Argos Translate for offline translation
- Uses local TTS (eSpeak or Festival)
- Button-controlled operation

Hardware Requirements:
- ESP32 or Raspberry Pi Zero
- INMP441 I2S microphone module
- I2S DAC or PWM speaker
- Push button for control
- SD card for model storage (optional)

Dependencies for Raspberry Pi:
sudo apt-get install espeak festival espeak-data
pip3 install argostranslate whisper

Usage:
1. Install offline dependencies
2. Download translation models (first run)
3. Run: python3 lingopods_offline.py
"""

import os
import sys
import time
import threading
import tempfile
import wave
import subprocess
import json
from typing import Optional, Dict, Any, List

# Hardware control (for Raspberry Pi)
try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    GPIO_AVAILABLE = False

# Audio recording
try:
    import pyaudio
    AUDIO_AVAILABLE = True
except ImportError:
    AUDIO_AVAILABLE = False

# Speech-to-text
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

# Offline translation
try:
    import argostranslate.package
    import argostranslate.translate
    ARGOS_AVAILABLE = True
except ImportError:
    ARGOS_AVAILABLE = False

# Text-to-speech (local)
TTS_AVAILABLE = False
try:
    # Try espeak first
    subprocess.run(['espeak', '--version'], capture_output=True, check=True)
    TTS_AVAILABLE = True
    TTS_ENGINE = 'espeak'
except (subprocess.CalledProcessError, FileNotFoundError):
    try:
        # Try festival
        subprocess.run(['festival', '--version'], capture_output=True, check=True)
        TTS_AVAILABLE = True
        TTS_ENGINE = 'festival'
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Warning: No local TTS engine found. Install espeak or festival")


class OfflineConfig:
    """Configuration for offline operation."""
    
    # Hardware pins (Raspberry Pi)
    BUTTON_PIN = 3
    LED_PIN = 25
    STATUS_LED_PIN = 24
    
    # Audio settings
    SAMPLE_RATE = 16000
    CHUNK_SIZE = 1024
    CHANNELS = 1
    RECORDING_DURATION = 3
    
    # Whisper model (use tiny for offline)
    WHISPER_MODEL = "tiny"
    
    # Translation settings
    SOURCE_LANGUAGE = "en"
    TARGET_LANGUAGE = "es"
    
    # Available language pairs for Argos Translate
    SUPPORTED_LANGUAGES = {
        "en": "English",
        "es": "Spanish", 
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "pt": "Portuguese",
        "ru": "Russian",
        "zh": "Chinese",
        "ja": "Japanese",
        "ko": "Korean",
        "ar": "Arabic"
    }


class LingoPodsOffline:
    """Offline LingoPods device."""
    
    def __init__(self):
        """Initialize the offline LingoPods device."""
        self.config = OfflineConfig()
        self.recording = False
        self.processing = False
        
        # Initialize components
        self._init_gpio()
        self._init_audio()
        self._init_whisper()
        self._init_translation()
        self._check_tts()
        
        print("LingoPods Offline initialized")
    
    def _init_gpio(self):
        """Initialize GPIO pins."""
        if not GPIO_AVAILABLE:
            print("GPIO not available (not on Raspberry Pi)")
            return
        
        try:
            GPIO.setmode(GPIO.BCM)
            GPIO.setwarnings(False)
            
            # Button and LEDs
            GPIO.setup(self.config.BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            GPIO.setup(self.config.LED_PIN, GPIO.OUT)
            GPIO.setup(self.config.STATUS_LED_PIN, GPIO.OUT)
            
            # Button interrupt
            GPIO.add_event_detect(
                self.config.BUTTON_PIN, 
                GPIO.FALLING, 
                callback=self._button_pressed,
                bouncetime=300
            )
            
            print("✓ GPIO initialized")
        except Exception as e:
            print(f"✗ GPIO failed: {e}")
    
    def _init_audio(self):
        """Initialize audio system."""
        if not AUDIO_AVAILABLE:
            print("✗ Audio not available")
            return
        
        try:
            self.audio = pyaudio.PyAudio()
            print("✓ Audio system initialized")
        except Exception as e:
            print(f"✗ Audio failed: {e}")
    
    def _init_whisper(self):
        """Initialize Whisper model."""
        if not WHISPER_AVAILABLE:
            print("✗ Whisper not available")
            self.whisper_model = None
            return
        
        try:
            print(f"Loading Whisper model ({self.config.WHISPER_MODEL})...")
            self.whisper_model = whisper.load_model(self.config.WHISPER_MODEL)
            print("✓ Whisper model loaded")
        except Exception as e:
            print(f"✗ Whisper model failed: {e}")
            self.whisper_model = None
    
    def _init_translation(self):
        """Initialize offline translation."""
        if not ARGOS_AVAILABLE:
            print("✗ Argos Translate not available")
            self.translation_available = False
            return
        
        try:
            print("Initializing offline translation...")
            
            # Check if translation packages are installed
            installed_packages = argostranslate.package.get_installed_packages()
            print(f"Installed translation packages: {len(installed_packages)}")
            
            # Check if our language pair is available
            source_code = self.config.SOURCE_LANGUAGE
            target_code = self.config.TARGET_LANGUAGE
            
            available_pairs = []
            for package in installed_packages:
                if package.from_code == source_code and package.to_code == target_code:
                    available_pairs.append(package)
            
            if available_pairs:
                print(f"✓ Translation available: {source_code} → {target_code}")
                self.translation_available = True
            else:
                print(f"✗ Translation package not found: {source_code} → {target_code}")
                print("Available packages:")
                for package in installed_packages:
                    print(f"  {package.from_code} → {package.to_code}")
                
                # Try to install the package
                self._install_translation_package(source_code, target_code)
                
        except Exception as e:
            print(f"✗ Translation initialization failed: {e}")
            self.translation_available = False
    
    def _install_translation_package(self, from_code: str, to_code: str):
        """Install translation package for language pair."""
        try:
            print(f"Installing translation package: {from_code} → {to_code}")
            
            # Get available packages
            available_packages = argostranslate.package.get_available_packages()
            
            # Find the package we need
            package_to_install = None
            for package in available_packages:
                if package.from_code == from_code and package.to_code == to_code:
                    package_to_install = package
                    break
            
            if package_to_install:
                print(f"Downloading package: {package_to_install}")
                argostranslate.package.install_from_path(package_to_install.download())
                print(f"✓ Package installed: {from_code} → {to_code}")
                self.translation_available = True
            else:
                print(f"✗ Package not available: {from_code} → {to_code}")
                self.translation_available = False
                
        except Exception as e:
            print(f"✗ Package installation failed: {e}")
            self.translation_available = False
    
    def _check_tts(self):
        """Check TTS availability."""
        if TTS_AVAILABLE:
            print(f"✓ TTS available: {TTS_ENGINE}")
        else:
            print("✗ No TTS engine available")
            print("Install with: sudo apt-get install espeak")
    
    def _button_pressed(self, channel):
        """Button press handler."""
        if self.processing:
            return
        
        threading.Thread(target=self._start_translation_process, daemon=True).start()
    
    def _led_status(self, status: bool, blink: bool = False):
        """Update status LEDs."""
        if not GPIO_AVAILABLE:
            return
        
        try:
            if blink:
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
        if not AUDIO_AVAILABLE or not hasattr(self, 'audio'):
            print("✗ Audio recording not available")
            return None
        
        print("Recording audio...")
        self.recording = True
        self._led_status(True, blink=True)
        
        try:
            stream = self.audio.open(
                format=pyaudio.paInt16,
                channels=self.config.CHANNELS,
                rate=self.config.SAMPLE_RATE,
                input=True,
                frames_per_buffer=self.config.CHUNK_SIZE
            )
            
            frames = []
            for i in range(0, int(self.config.SAMPLE_RATE / self.config.CHUNK_SIZE * self.config.RECORDING_DURATION)):
                data = stream.read(self.config.CHUNK_SIZE)
                frames.append(data)
            
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
        """Transcribe audio using local Whisper."""
        if not self.whisper_model:
            print("✗ Whisper model not available")
            return None
        
        if not os.path.exists(audio_file):
            print(f"✗ Audio file not found: {audio_file}")
            return None
        
        print("Transcribing audio (offline)...")
        
        try:
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
            try:
                os.unlink(audio_file)
            except:
                pass
    
    def _translate_text(self, text: str) -> Optional[str]:
        """Translate text using offline Argos Translate."""
        if not self.translation_available:
            print("✗ Offline translation not available")
            return None
        
        if not text or not text.strip():
            print("✗ No text to translate")
            return None
        
        print(f"Translating (offline): '{text}'")
        
        try:
            # Translate using Argos Translate
            translated_text = argostranslate.translate.translate(
                text, 
                self.config.SOURCE_LANGUAGE, 
                self.config.TARGET_LANGUAGE
            )
            
            if translated_text and translated_text.strip():
                print(f"✓ Translation: '{translated_text}'")
                return translated_text
            else:
                print("✗ Translation failed")
                return None
                
        except Exception as e:
            print(f"✗ Translation failed: {e}")
            return None
    
    def _speak_text(self, text: str) -> bool:
        """Speak text using local TTS."""
        if not TTS_AVAILABLE:
            print("✗ TTS not available")
            return False
        
        if not text or not text.strip():
            print("✗ No text to speak")
            return False
        
        print(f"Speaking: '{text}'")
        
        try:
            if TTS_ENGINE == 'espeak':
                # Use espeak
                cmd = [
                    'espeak',
                    '-s', '150',  # Speed
                    '-v', 'en+f3',  # Voice (female English)
                    text
                ]
                result = subprocess.run(cmd, capture_output=True, text=True)
                
            elif TTS_ENGINE == 'festival':
                # Use festival
                cmd = ['festival', '--tts']
                result = subprocess.run(cmd, input=text, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✓ Speech completed")
                return True
            else:
                print(f"✗ Speech failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"✗ Speech failed: {e}")
            return False
    
    def _start_translation_process(self):
        """Start the complete offline translation process."""
        if self.processing:
            return
        
        self.processing = True
        self._led_status(True)
        
        try:
            print("\n" + "="*50)
            print("Starting OFFLINE translation process...")
            print("="*50)
            
            # Step 1: Record audio
            audio_file = self._record_audio()
            if not audio_file:
                print("Process failed at recording stage")
                return
            
            # Step 2: Transcribe audio (offline)
            transcribed_text = self._transcribe_audio(audio_file)
            if not transcribed_text:
                print("Process failed at transcription stage")
                return
            
            # Step 3: Translate text (offline)
            translated_text = self._translate_text(transcribed_text)
            if not translated_text:
                print("Process failed at translation stage")
                return
            
            # Step 4: Speak translated text
            self._speak_text(translated_text)
            
            print("\n" + "="*50)
            print("✓ OFFLINE translation process completed!")
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
        print("LingoPods Offline Ready!")
        print("Press button to start translation...")
        print("Press Ctrl+C to exit")
        
        try:
            while True:
                time.sleep(1)
                
                # Blink status LED
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
        # Initialize and run offline LingoPods
        lingopods = LingoPodsOffline()
        lingopods.run()
        
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()













