# LingoPods Embedded Usage Guide

This guide covers usage of the embedded versions of LingoPods for ESP32 and Raspberry Pi Zero.

## Quick Start

### ESP32 Version

1. **Hardware Setup**: Connect INMP441 mic and MAX98357A DAC
2. **Software**: Flash MicroPython and upload `lingopods_esp32.py`
3. **Configuration**: Set WiFi credentials in the script
4. **Usage**: Press button to start translation

### Raspberry Pi Zero Version

1. **Hardware Setup**: Connect INMP441 mic and I2S DAC
2. **Software**: Install dependencies and run `lingopods_rpi.py`
3. **Configuration**: Ensure WiFi is configured
4. **Usage**: Press button to start translation

## Detailed Usage

### ESP32 MicroPython Version

#### Initial Setup

```python
# 1. Flash MicroPython to ESP32
esptool.py --chip esp32 --port /dev/ttyUSB0 erase_flash
esptool.py --chip esp32 --port /dev/ttyUSB0 write_flash -z 0x1000 esp32-firmware.bin

# 2. Upload the script
ampy --port /dev/ttyUSB0 put lingopods_esp32.py main.py

# 3. Configure WiFi in the script
WIFI_SSID = "YourNetwork"
WIFI_PASSWORD = "YourPassword"
```

#### Operation

```python
# The device will:
# 1. Connect to WiFi on startup
# 2. Initialize I2S microphone and DAC
# 3. Wait for button press
# 4. Record 3 seconds of audio
# 5. Send to cloud for processing (simulated)
# 6. Translate and speak result
```

#### Features

- **I2S Audio**: High-quality digital audio
- **WiFi Translation**: Uses MyMemory API (no key required)
- **Button Control**: Simple push-to-talk
- **Status LEDs**: Visual feedback
- **Low Power**: Optimized for battery operation

### Raspberry Pi Zero Version

#### Initial Setup

```bash
# 1. Install system dependencies
sudo apt-get install python3-pip python3-dev portaudio19-dev
sudo apt-get install espeak festival

# 2. Install Python packages
pip3 install -r requirements_embedded.txt

# 3. Enable I2S interface
sudo raspi-config
# Advanced Options → Audio → I2S

# 4. Test audio
arecord -D hw:1,0 -f cd -t wav test.wav
aplay test.wav
```

#### Operation

```bash
# Run the online version
python3 lingopods_rpi.py

# Or run the offline version
python3 lingopods_offline.py
```

#### Features

- **Full Whisper**: Local speech recognition
- **Google Translate**: Online translation service
- **Local TTS**: pyttsx3 with multiple voices
- **GPIO Control**: Hardware button and LEDs
- **Threading**: Non-blocking operation

### Offline Version

#### Setup for Offline Operation

```bash
# 1. Install offline dependencies
pip3 install argostranslate

# 2. Download translation models (first run)
python3 -c "
import argostranslate.package
packages = argostranslate.package.get_available_packages()
package = [p for p in packages if p.from_code=='en' and p.to_code=='es'][0]
argostranslate.package.install_from_path(package.download())
"

# 3. Install local TTS
sudo apt-get install espeak

# 4. Run offline version
python3 lingopods_offline.py
```

#### Offline Features

- **Local Whisper**: No internet required for speech recognition
- **Argos Translate**: Offline translation between 50+ languages
- **eSpeak/Festival**: Local text-to-speech
- **Complete Independence**: Works without internet connection

## Configuration Options

### Language Settings

```python
# In the script, modify these variables:
TARGET_LANGUAGE = "es"    # Spanish
SOURCE_LANGUAGE = "auto"  # Auto-detect

# Supported language codes:
# en - English, es - Spanish, fr - French
# de - German, it - Italian, pt - Portuguese
# ru - Russian, zh - Chinese, ja - Japanese
# ko - Korean, ar - Arabic
```

### Audio Settings

```python
# Adjust these for your hardware:
SAMPLE_RATE = 16000      # Audio sample rate
RECORDING_DURATION = 3   # Recording length (seconds)
BITS_PER_SAMPLE = 16     # Audio bit depth
CHANNELS = 1             # Mono audio
```

### Performance Settings

```python
# ESP32 - use smaller models for better performance
WHISPER_MODEL = "tiny"   # Options: tiny, base, small

# Raspberry Pi - balance quality vs performance
WHISPER_MODEL = "base"   # Options: tiny, base, small, medium
```

## Hardware Integration

### Button Configuration

```python
# ESP32 - built-in button on GPIO0
BUTTON_PIN = 0

# Raspberry Pi - custom button on GPIO3
BUTTON_PIN = 3

# Custom button wiring:
# Button Pin 1 → GPIO pin
# Button Pin 2 → GND
# Enable pull-up resistor in code
```

### LED Status Indicators

```python
# ESP32 - built-in LED on GPIO2
LED_PIN = 2

# Raspberry Pi - custom LED on GPIO25
LED_PIN = 25

# LED wiring:
# LED Anode → GPIO pin
# LED Cathode → GND (with 220Ω resistor)
```

### Audio Quality Optimization

```python
# For better audio quality:
SAMPLE_RATE = 22050      # Higher quality
CHUNK_SIZE = 2048        # Larger buffers

# For lower latency:
SAMPLE_RATE = 8000       # Lower quality, faster
CHUNK_SIZE = 512         # Smaller buffers
```

## Troubleshooting

### Common Issues

#### ESP32 - No Audio Output

```python
# Check connections:
# MAX98357A VCC → 5V (not 3.3V)
# MAX98357A GND → GND
# MAX98357A DIN → GPIO27
# MAX98357A BCLK → GPIO26
# MAX98357A LRC → GPIO25
```

#### Raspberry Pi - I2S Not Working

```bash
# Enable I2S interface:
sudo raspi-config
# Advanced Options → Audio → I2S

# Check configuration:
cat /boot/config.txt | grep audio
# Should show: dtparam=audio=on
```

#### WiFi Connection Issues

```python
# ESP32 - check credentials and signal
WIFI_SSID = "YourNetwork"        # Exact name
WIFI_PASSWORD = "YourPassword"   # Correct password

# Raspberry Pi - use raspi-config or nmcli
sudo raspi-config
# System Options → Wireless LAN
```

#### Translation API Errors

```python
# For ESP32 - use free API (MyMemory)
TRANSLATE_API_URL = "https://api.mymemory.translated.net/get"

# For Raspberry Pi - Google Translate or MyMemory
# Google Translate requires internet
# MyMemory is free but rate-limited
```

### Performance Optimization

#### ESP32 Optimization

```python
# Use smaller Whisper model
WHISPER_MODEL = "tiny"

# Reduce recording duration
RECORDING_DURATION = 2

# Optimize WiFi usage
# Only connect when needed
```

#### Raspberry Pi Optimization

```python
# Use appropriate Whisper model
WHISPER_MODEL = "base"  # Good balance

# Enable GPU memory split
# In /boot/config.txt:
gpu_mem=128

# Use faster SD card
# Class 10 or better recommended
```

### Power Management

#### ESP32 Power Saving

```python
# Enter deep sleep between translations
import machine
machine.deepsleep(10000)  # Sleep for 10 seconds

# Disable WiFi when not needed
import network
wlan = network.WLAN(network.STA_IF)
wlan.active(False)
```

#### Raspberry Pi Power Saving

```bash
# Disable unnecessary services
sudo systemctl disable bluetooth
sudo systemctl disable hciuart

# Use lightweight desktop or headless
# Install Raspberry Pi OS Lite
```

## Advanced Features

### Custom Wake Words

```python
# Add simple wake word detection
def detect_wake_word(audio_data):
    # Simple energy-based detection
    energy = sum(abs(x) for x in audio_data) / len(audio_data)
    return energy > THRESHOLD
```

### Multiple Language Support

```python
# Cycle through languages with button press
LANGUAGES = ["en", "es", "fr", "de"]
current_language_index = 0

def switch_language():
    global current_language_index
    current_language_index = (current_language_index + 1) % len(LANGUAGES)
    TARGET_LANGUAGE = LANGUAGES[current_language_index]
```

### Audio Recording Storage

```python
# Save recordings for debugging
import os
import time

def save_recording(audio_data):
    timestamp = time.time()
    filename = f"recording_{timestamp}.wav"
    with open(filename, 'wb') as f:
        f.write(audio_data)
```

## Deployment

### Production Setup

1. **Enclosure**: 3D print or purchase case
2. **Power**: Use external power supply or battery pack
3. **Mounting**: Secure to wall or desk
4. **Network**: Ensure stable WiFi connection
5. **Maintenance**: Regular software updates

### Monitoring

```python
# Add logging for production
import logging

logging.basicConfig(
    filename='lingopods.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
```

### Updates

```bash
# Raspberry Pi - update software
sudo apt update && sudo apt upgrade

# ESP32 - reflash firmware
esptool.py --chip esp32 --port /dev/ttyUSB0 write_flash -z 0x1000 new_firmware.bin
```

This guide provides comprehensive information for using the embedded versions of LingoPods on both ESP32 and Raspberry Pi Zero platforms.













