# LingoPods Hardware Setup Guide

This guide covers the hardware setup for both ESP32 and Raspberry Pi Zero versions of LingoPods.

## Table of Contents

1. [ESP32 Setup](#esp32-setup)
2. [Raspberry Pi Zero Setup](#raspberry-pi-zero-setup)
3. [Common Hardware Components](#common-hardware-components)
4. [Wiring Diagrams](#wiring-diagrams)
5. [Troubleshooting](#troubleshooting)

## ESP32 Setup

### Hardware Requirements

- **ESP32 Development Board** (e.g., ESP32-WROOM-32, ESP32-S2, ESP32-C3)
- **INMP441 I2S Microphone Module**
- **I2S DAC** (e.g., MAX98357A) OR **PWM Speaker**
- **Push Button** (built-in or external)
- **LEDs** (built-in or external)
- **Breadboard and Jumper Wires**
- **Power Supply** (USB or external)

### ESP32 Wiring

#### INMP441 I2S Microphone

```
INMP441    →  ESP32
VCC        →  3.3V
GND        →  GND
WS (L/R)   →  GPIO15
SD (Data)  →  GPIO32
SCK (BCLK) →  GPIO14
```

#### MAX98357A I2S DAC

```
MAX98357A  →  ESP32
VCC        →  5V
GND        →  GND
BCLK       →  GPIO26
LRC        →  GPIO25
DIN        →  GPIO27
```

#### PWM Speaker (Alternative)

```
Speaker    →  ESP32
Positive   →  GPIO18
Negative   →  GND
```

#### Control Elements

```
Button     →  ESP32
Pin 1      →  GPIO0 (built-in button)
Pin 2      →  GND

LED        →  ESP32
Anode      →  GPIO2 (built-in LED)
Cathode    →  GND (with 220Ω resistor)
```

### ESP32 Software Setup

1. **Install MicroPython**

   ```bash
   # Download MicroPython firmware for ESP32
   wget https://micropython.org/resources/firmware/esp32-20240105-v1.23.0.bin

   # Flash MicroPython (replace with your port)
   esptool.py --chip esp32 --port /dev/ttyUSB0 erase_flash
   esptool.py --chip esp32 --port /dev/ttyUSB0 write_flash -z 0x1000 esp32-20240105-v1.23.0.bin
   ```

2. **Install Required Libraries**

   ```python
   # Connect to ESP32 via serial
   import upip
   upip.install('urequests')
   upip.install('ujson')
   ```

3. **Upload Script**

   ```bash
   # Use ampy or similar tool to upload lingopods_esp32.py
   ampy --port /dev/ttyUSB0 put lingopods_esp32.py main.py
   ```

4. **Configure WiFi**
   Edit the script to set your WiFi credentials:
   ```python
   WIFI_SSID = "YourWiFiName"
   WIFI_PASSWORD = "YourWiFiPassword"
   ```

## Raspberry Pi Zero Setup

### Hardware Requirements

- **Raspberry Pi Zero W** (WiFi enabled)
- **INMP441 I2S Microphone Module**
- **I2S DAC** (e.g., MAX98357A) OR **USB Audio Adapter**
- **Push Button**
- **LEDs** (optional)
- **MicroSD Card** (32GB+ recommended)
- **Power Supply** (5V, 2.5A)

### Raspberry Pi Wiring

#### INMP441 I2S Microphone

```
INMP441    →  Raspberry Pi Zero
VCC        →  3.3V (Pin 1)
GND        →  GND (Pin 6)
WS (L/R)   →  GPIO18 (Pin 12)
SD (Data)  →  GPIO19 (Pin 35)
SCK (BCLK) →  GPIO18 (Pin 12)
```

#### MAX98357A I2S DAC

```
MAX98357A  →  Raspberry Pi Zero
VCC        →  5V (Pin 2)
GND        →  GND (Pin 14)
BCLK       →  GPIO18 (Pin 12)
LRC        →  GPIO19 (Pin 35)
DIN        →  GPIO21 (Pin 40)
```

#### Control Elements

```
Button     →  Raspberry Pi Zero
Pin 1      →  GPIO3 (Pin 5)
Pin 2      →  GND (Pin 6)

LED        →  Raspberry Pi Zero
Anode      →  GPIO25 (Pin 22)
Cathode    →  GND (Pin 20) with 220Ω resistor
```

### Raspberry Pi Software Setup

1. **Install Raspberry Pi OS**

   ```bash
   # Download Raspberry Pi Imager
   # Flash Raspberry Pi OS Lite to SD card
   # Enable SSH and WiFi during imaging
   ```

2. **Enable I2S Interface**

   ```bash
   sudo raspi-config
   # Navigate to: Advanced Options → Audio → I2S
   # Reboot after enabling
   ```

3. **Install Dependencies**

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install audio dependencies
   sudo apt install -y python3-pip python3-dev portaudio19-dev
   sudo apt install -y espeak festival espeak-data

   # Install Python packages
   pip3 install pyaudio whisper googletrans pyttsx3 RPi.GPIO
   pip3 install argostranslate  # For offline version
   ```

4. **Configure Audio**

   ```bash
   # Test audio recording
   arecord -D hw:1,0 -f cd -t wav test.wav

   # Test audio playback
   aplay test.wav
   ```

5. **Run the Script**

   ```bash
   # For online version
   python3 lingopods_rpi.py

   # For offline version
   python3 lingopods_offline.py
   ```

## Common Hardware Components

### INMP441 I2S Microphone Module

- **Features**: Digital I2S output, omnidirectional, low power
- **Voltage**: 3.3V
- **Interface**: I2S (3-wire)
- **Frequency Response**: 50Hz - 15kHz
- **Price**: ~$2-5

### MAX98357A I2S Audio Amplifier

- **Features**: I2S input, 3.2W output, built-in DAC
- **Voltage**: 2.7V - 5.5V
- **Interface**: I2S (3-wire)
- **Output**: Mono speaker
- **Price**: ~$5-10

### Alternative Components

#### USB Audio Adapter (Raspberry Pi)

- **Features**: Plug-and-play, stereo output
- **Interface**: USB
- **Price**: ~$3-8

#### PWM Speaker

- **Features**: Simple analog output
- **Interface**: Single GPIO pin
- **Quality**: Basic (square wave)
- **Price**: ~$1-3

## Wiring Diagrams

### ESP32 Complete Setup

```
                    ESP32
                   ┌─────┐
              3.3V │ 1   │ GND
                   │     │
               GPIO14│ 3   │ GPIO32 ←─── INMP441 SD
                   │     │
               GPIO15│ 4   │ 3.3V  ←─── INMP441 VCC
                   │     │
               GPIO0 │ 5   │ GND   ←─── INMP441 GND
                   │     │
               GPIO26│ 6   │ GPIO27 ←─── MAX98357A DIN
                   │     │
               GPIO25│ 7   │ GPIO18 ←─── MAX98357A BCLK
                   │     │
               GPIO2 │ 8   │ 5V    ←─── MAX98357A VCC
                   │     │
                   └─────┘
                        │
                        └─── MAX98357A GND → GND
```

### Raspberry Pi Zero Complete Setup

```
                    Raspberry Pi Zero
                   ┌─────────────────┐
              3.3V │ 1  2           │ 5V
                   │               │
               GPIO2│ 3  4           │ 5V
                   │               │
               GPIO3│ 5  6           │ GND ←─── INMP441 GND
                   │               │
               GPIO4│ 7  8           │ GPIO14
                   │               │
               GND │ 9  10          │ GPIO15
                   │               │
               GPIO17│11 12          │ GPIO18 ←─── INMP441 WS, MAX98357A BCLK
                   │               │
               GPIO27│13 14          │ GND
                   │               │
               GPIO22│15 16          │ GPIO23
                   │               │
               3.3V │17 18          │ GPIO24
                   │               │
               GPIO10│19 20          │ GND ←─── MAX98357A GND
                   │               │
               GPIO9 │21 22          │ GPIO25 ←─── LED
                   │               │
               GPIO11│23 24          │ GPIO8
                   │               │
               GND │25 26          │ GPIO7
                   │               │
               GPIO0 │27 28          │ GPIO1
                   │               │
               GPIO5 │29 30          │ GND
                   │               │
               GPIO6 │31 32          │ GPIO12
                   │               │
               GPIO13│33 34          │ GND
                   │               │
               GPIO19│35 36          │ GPIO16 ←─── INMP441 SD, MAX98357A LRC
                   │               │
               GPIO26│37 38          │ GPIO20
                   │               │
               GND │39 40          │ GPIO21 ←─── MAX98357A DIN
                   └─────────────────┘
```

## Troubleshooting

### ESP32 Issues

#### Microphone Not Working

```bash
# Check I2S connections
# Verify 3.3V power to INMP441
# Check GPIO pin assignments in code
```

#### WiFi Connection Failed

```python
# Verify credentials
# Check signal strength
# Try different WiFi network
```

#### Audio Output Issues

```bash
# Check I2S DAC connections
# Verify 5V power to MAX98357A
# Try PWM speaker as alternative
```

### Raspberry Pi Issues

#### I2S Not Working

```bash
# Enable I2S in raspi-config
# Check /boot/config.txt for audio settings
# Verify wiring connections
```

#### Audio Permission Issues

```bash
# Add user to audio group
sudo usermod -a -G audio $USER
# Logout and login again
```

#### Microphone Not Detected

```bash
# Check if I2S is enabled
# Test with: arecord -l
# Verify INMP441 wiring
```

#### Translation API Errors

```bash
# Check internet connection
# Verify API credentials
# Try offline mode as fallback
```

### Performance Optimization

#### ESP32

- Use smaller Whisper model (tiny/base)
- Reduce recording duration
- Optimize WiFi usage
- Use external power supply

#### Raspberry Pi Zero

- Use Raspberry Pi OS Lite
- Enable GPU memory split
- Use faster SD card (Class 10+)
- Add heat sink for sustained operation

### Power Consumption

#### ESP32

- **Idle**: ~80mA
- **Recording**: ~120mA
- **WiFi Active**: ~170mA
- **Total**: ~200mA average

#### Raspberry Pi Zero

- **Idle**: ~100mA
- **Active**: ~200mA
- **WiFi Active**: ~250mA
- **Total**: ~300mA average

## Safety Notes

1. **Power Supply**: Use appropriate voltage (3.3V for sensors, 5V for amplifiers)
2. **Current Limits**: Don't exceed GPIO current limits (40mA per pin)
3. **Grounding**: Ensure proper ground connections
4. **Heat**: Monitor temperature during extended use
5. **Electrostatic**: Use anti-static precautions when handling components

## Cost Estimation

### ESP32 Version

- ESP32 Board: $8-15
- INMP441 Microphone: $3-5
- MAX98357A Amplifier: $5-10
- Speaker: $3-8
- Miscellaneous: $5-10
- **Total**: ~$25-50

### Raspberry Pi Zero Version

- Raspberry Pi Zero W: $10-15
- INMP441 Microphone: $3-5
- MAX98357A Amplifier: $5-10
- Speaker: $3-8
- SD Card: $5-10
- Miscellaneous: $5-10
- **Total**: ~$30-60

## Next Steps

1. **Prototype**: Build on breadboard first
2. **Test**: Verify each component individually
3. **Optimize**: Fine-tune audio settings
4. **Encase**: Design 3D printed enclosure
5. **Deploy**: Install in final location














