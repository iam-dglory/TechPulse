# LingoPods Core - Usage Guide

## Overview

LingoPods Core is a Python script that provides real-time speech translation capabilities through a simple pipeline: **record → transcribe → translate → speak**.

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. System Dependencies

#### Windows

```bash
pip install pipwin
pipwin install pyaudio
```

#### macOS

```bash
brew install portaudio
pip install pyaudio
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install python3-pyaudio portaudio19-dev
pip install pyaudio
```

## Quick Start

### Basic Usage

```python
from lingopods_core import LingoPodsCore

# Initialize the system
lingopods = LingoPodsCore(
    model_size="base",           # Whisper model: tiny, base, small, medium, large
    target_language="es"         # Target language (ISO 639-1 code)
)

# Run the complete pipeline
lingopods.run_full_pipeline(duration=5.0, source_language="auto")
```

### Individual Functions

```python
# Record audio for 3 seconds
audio_file = lingopods.record_audio(duration=3.0)

# Transcribe the recorded audio
transcribed_text = lingopods.transcribe_audio(audio_file)

# Translate the text to Spanish
translated_text = lingopods.translate_text(transcribed_text, source_language="auto")

# Speak the translated text
lingopods.speak_text(translated_text)
```

## Running the Script

### Command Line

```bash
python lingopods_core.py
```

The script will:

1. Check system requirements
2. Initialize all components
3. Wait for you to press Enter
4. Record audio for 3 seconds
5. Process through the complete pipeline
6. Display results

## Configuration Options

### LingoPodsCore Parameters

- `model_size`: Whisper model size ("tiny", "base", "small", "medium", "large")
- `sample_rate`: Audio sample rate (default: 16000 Hz)
- `chunk_size`: Audio chunk size (default: 1024)
- `channels`: Number of audio channels (default: 1)
- `target_language`: Target language for translation (ISO 639-1 code)

### Supported Languages

The Google Translate API supports 100+ languages. Common language codes:

- English: "en"
- Spanish: "es"
- French: "fr"
- German: "de"
- Italian: "it"
- Portuguese: "pt"
- Chinese: "zh"
- Japanese: "ja"
- Korean: "ko"
- Arabic: "ar"
- Russian: "ru"

## Example Output

```
LingoPods Core - Audio Translation Pipeline
==========================================

Checking system requirements...
✓ pyaudio available
✓ whisper available
✓ googletrans available
✓ pyttsx3 available

Initializing LingoPods components...
Loading Whisper model (base)...
✓ Whisper model loaded successfully
Initializing Google Translator...
✓ Translator initialized successfully
Initializing TTS engine...
✓ TTS engine initialized successfully

==================================================
Starting LingoPods Audio Translation Pipeline
==================================================

1. RECORDING AUDIO
Recording audio for 3 seconds...
Speak now...
✓ Audio recorded successfully: /tmp/tmp123456.wav

2. TRANSCRIBING AUDIO
Transcribing audio...
✓ Transcription successful: 'Hello, how are you today?'

3. TRANSLATING TEXT
Translating text to es...
✓ Translation successful: 'Hola, ¿cómo estás hoy?'
  Detected source language: en

4. SPEAKING TRANSLATED TEXT
Speaking text: 'Hola, ¿cómo estás hoy?'
✓ Speech completed successfully

==================================================
✓ PIPELINE COMPLETED SUCCESSFULLY!
==================================================

SUMMARY:
Original: Hello, how are you today?
Translated: Hola, ¿cómo estás hoy?
```

## Troubleshooting

### Common Issues

1. **"pyaudio not available"**

   - Install system dependencies first
   - Use `pipwin` on Windows or `brew` on macOS

2. **"whisper not available"**

   - Install with: `pip install openai-whisper`

3. **"googletrans not available"**

   - Install with: `pip install googletrans==4.0.0rc1`

4. **"pyttsx3 not available"**

   - Install with: `pip install pyttsx3`

5. **Audio recording fails**

   - Check microphone permissions
   - Ensure no other applications are using the microphone
   - Try a different audio device

6. **Translation fails**
   - Check internet connection (Google Translate requires internet)
   - Verify language codes are correct

### Performance Tips

1. **Use smaller Whisper models** for faster processing:

   - "tiny": Fastest, least accurate
   - "base": Good balance (recommended)
   - "large": Most accurate, slowest

2. **Adjust recording duration** based on your needs:

   - Shorter duration = faster processing
   - Longer duration = more complete sentences

3. **Pre-load the model** if using multiple times:
   ```python
   lingopods = LingoPodsCore(model_size="base")
   # Model is loaded once during initialization
   ```

## Advanced Usage

### Custom Audio Settings

```python
lingopods = LingoPodsCore(
    sample_rate=22050,    # Higher quality audio
    chunk_size=2048,      # Larger chunks for stability
    channels=2            # Stereo recording
)
```

### Batch Processing

```python
# Process multiple audio files
audio_files = ["audio1.wav", "audio2.wav", "audio3.wav"]

for audio_file in audio_files:
    transcribed = lingopods.transcribe_audio(audio_file)
    if transcribed:
        translated = lingopods.translate_text(transcribed)
        print(f"Original: {transcribed}")
        print(f"Translated: {translated}")
```

## License

This script is provided as-is for educational and development purposes.
