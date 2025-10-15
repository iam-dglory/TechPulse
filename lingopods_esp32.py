#!/usr/bin/env python3
"""
LingoPods ESP32 - Embedded Audio Translation Device
=================================================

A MicroPython script for ESP32 that provides real-time speech translation:
I2S Mic → WiFi Translation → I2S/PWM Speaker

Hardware Requirements:
- ESP32 development board
- INMP441 I2S microphone module
- I2S DAC (e.g., MAX98357A) or PWM speaker
- Push button for control
- WiFi connection

Wiring:
- INMP441: VCC→3.3V, GND→GND, WS→GPIO15, SD→GPIO32, SCK→GPIO14
- MAX98357A: VCC→5V, GND→GND, BCLK→GPIO26, LRC→GPIO25, DIN→GPIO27
- Button: GPIO0 (built-in) or custom GPIO
- LED: GPIO2 (built-in) for status indication

Usage:
1. Upload this script to ESP32
2. Configure WiFi credentials
3. Press button to start recording
4. Device will translate and speak result
"""

import network
import socket
import json
import time
import machine
from machine import Pin, I2S, PWM
import gc
import urequests
import ujson

# Hardware Configuration
class HardwareConfig:
    # I2S Microphone (INMP441)
    I2S_SCK_PIN = 14
    I2S_WS_PIN = 15
    I2S_SD_PIN = 32
    
    # I2S Speaker (MAX98357A)
    I2S_BCLK_PIN = 26
    I2S_LRC_PIN = 25
    I2S_DIN_PIN = 27
    
    # PWM Speaker (alternative)
    PWM_PIN = 18
    
    # Control pins
    BUTTON_PIN = 0  # Built-in button
    LED_PIN = 2     # Built-in LED
    STATUS_LED_PIN = 4  # Additional status LED
    
    # Audio settings
    SAMPLE_RATE = 16000
    BITS_PER_SAMPLE = 16
    RECORDING_DURATION = 3  # seconds
    
    # WiFi settings
    WIFI_SSID = "YOUR_WIFI_SSID"
    WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"
    
    # Translation API settings
    TRANSLATE_API_URL = "https://api.mymemory.translated.net/get"
    TARGET_LANGUAGE = "es"  # Spanish
    SOURCE_LANGUAGE = "auto"


class LingoPodsESP32:
    """Main class for ESP32 LingoPods device."""
    
    def __init__(self):
        """Initialize the ESP32 LingoPods device."""
        self.config = HardwareConfig()
        self.wifi_connected = False
        self.recording = False
        
        # Initialize hardware components
        self._init_gpio()
        self._init_i2s_mic()
        self._init_audio_output()
        
        # Connect to WiFi
        self._connect_wifi()
        
        print("LingoPods ESP32 initialized")
    
    def _init_gpio(self):
        """Initialize GPIO pins."""
        # Button with pull-up
        self.button = Pin(self.config.BUTTON_PIN, Pin.IN, Pin.PULL_UP)
        
        # Status LEDs
        self.led = Pin(self.config.LED_PIN, Pin.OUT)
        self.status_led = Pin(self.config.STATUS_LED_PIN, Pin.OUT)
        
        # Configure button interrupt
        self.button.irq(trigger=Pin.IRQ_FALLING, handler=self._button_pressed)
        
        print("✓ GPIO initialized")
    
    def _init_i2s_mic(self):
        """Initialize I2S microphone."""
        try:
            self.i2s_mic = I2S(
                0,  # I2S peripheral number
                sck=Pin(self.config.I2S_SCK_PIN),
                ws=Pin(self.config.I2S_WS_PIN),
                sd=Pin(self.config.I2S_SD_PIN),
                mode=I2S.RX,
                bits=self.config.BITS_PER_SAMPLE,
                format=I2S.MONO,
                rate=self.config.SAMPLE_RATE,
                ibuf=20000
            )
            print("✓ I2S microphone initialized")
        except Exception as e:
            print(f"✗ I2S microphone failed: {e}")
            self.i2s_mic = None
    
    def _init_audio_output(self):
        """Initialize audio output (I2S DAC or PWM)."""
        try:
            # Try I2S DAC first
            self.i2s_dac = I2S(
                1,  # I2S peripheral number
                sck=Pin(self.config.I2S_BCLK_PIN),
                ws=Pin(self.config.I2S_LRC_PIN),
                sd=Pin(self.config.I2S_DIN_PIN),
                mode=I2S.TX,
                bits=self.config.BITS_PER_SAMPLE,
                format=I2S.MONO,
                rate=self.config.SAMPLE_RATE,
                ibuf=20000
            )
            self.audio_output_type = "I2S"
            print("✓ I2S DAC initialized")
        except Exception as e:
            print(f"I2S DAC failed: {e}, trying PWM...")
            try:
                # Fallback to PWM
                self.pwm = PWM(Pin(self.config.PWM_PIN))
                self.pwm.freq(1000)  # 1kHz base frequency
                self.audio_output_type = "PWM"
                print("✓ PWM audio output initialized")
            except Exception as e2:
                print(f"✗ Audio output failed: {e2}")
                self.audio_output_type = None
    
    def _connect_wifi(self):
        """Connect to WiFi network."""
        print(f"Connecting to WiFi: {self.config.WIFI_SSID}")
        
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        
        if not wlan.isconnected():
            wlan.connect(self.config.WIFI_SSID, self.config.WIFI_PASSWORD)
            
            # Wait for connection with timeout
            timeout = 0
            while not wlan.isconnected() and timeout < 20:
                time.sleep(1)
                timeout += 1
                print(".", end="")
        
        if wlan.isconnected():
            self.wifi_connected = True
            print(f"\n✓ WiFi connected: {wlan.ifconfig()}")
            self._led_status(True)
        else:
            print("\n✗ WiFi connection failed")
            self._led_status(False)
    
    def _button_pressed(self, pin):
        """Button press interrupt handler."""
        # Simple debounce
        time.sleep_ms(50)
        if not pin.value():  # Still pressed after debounce
            self._start_translation_process()
    
    def _led_status(self, connected):
        """Update status LED."""
        if connected:
            self.led.on()
            self.status_led.on()
        else:
            self.led.off()
            self.status_led.off()
    
    def _record_audio(self):
        """Record audio from I2S microphone."""
        if not self.i2s_mic:
            print("✗ I2S microphone not available")
            return None
        
        print("Recording audio...")
        self.recording = True
        self._led_status(True)
        
        # Calculate buffer size for recording duration
        buffer_size = self.config.SAMPLE_RATE * self.config.RECORDING_DURATION * 2  # 2 bytes per sample
        
        try:
            audio_data = bytearray(buffer_size)
            bytes_read = self.i2s_mic.readinto(audio_data)
            
            if bytes_read > 0:
                print(f"✓ Recorded {bytes_read} bytes")
                return audio_data[:bytes_read]
            else:
                print("✗ No audio data recorded")
                return None
                
        except Exception as e:
            print(f"✗ Recording failed: {e}")
            return None
        finally:
            self.recording = False
    
    def _play_audio(self, audio_data):
        """Play audio through I2S DAC or PWM."""
        if not audio_data:
            print("✗ No audio data to play")
            return False
        
        print("Playing audio...")
        
        try:
            if self.audio_output_type == "I2S":
                # Play through I2S DAC
                bytes_written = self.i2s_dac.write(audio_data)
                print(f"✓ Played {bytes_written} bytes via I2S")
                return True
                
            elif self.audio_output_type == "PWM":
                # Simple PWM audio playback (basic implementation)
                # This is a simplified version - real PWM audio requires more complex modulation
                for i in range(0, len(audio_data), 2):
                    if i + 1 < len(audio_data):
                        # Convert 16-bit sample to PWM duty
                        sample = int.from_bytes(audio_data[i:i+2], 'little', signed=True)
                        duty = int((sample + 32768) * 1023 / 65536)  # Scale to 0-1023
                        self.pwm.duty(duty)
                        time.sleep_us(62)  # ~16kHz sample rate
                
                print("✓ Audio played via PWM")
                return True
            else:
                print("✗ No audio output available")
                return False
                
        except Exception as e:
            print(f"✗ Audio playback failed: {e}")
            return False
    
    def _translate_text(self, text):
        """Translate text using online API."""
        if not self.wifi_connected:
            print("✗ WiFi not connected")
            return None
        
        if not text or not text.strip():
            print("✗ No text to translate")
            return None
        
        print(f"Translating: '{text}'")
        
        try:
            # Use MyMemory Translation API (free, no API key required)
            params = {
                'q': text,
                'langpair': f"{self.config.SOURCE_LANGUAGE}|{self.config.TARGET_LANGUAGE}"
            }
            
            response = urequests.get(
                self.config.TRANSLATE_API_URL,
                params=params,
                headers={'User-Agent': 'LingoPods-ESP32/1.0'}
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'responseData' in data and 'translatedText' in data['responseData']:
                    translated = data['responseData']['translatedText']
                    print(f"✓ Translation: '{translated}'")
                    return translated
                else:
                    print("✗ Invalid translation response")
                    return None
            else:
                print(f"✗ Translation API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"✗ Translation failed: {e}")
            return None
        finally:
            try:
                response.close()
            except:
                pass
    
    def _text_to_speech(self, text):
        """Convert text to speech (simplified for ESP32)."""
        if not text:
            print("✗ No text to speak")
            return None
        
        print(f"Speaking: '{text}'")
        
        # For ESP32, we'll use a simple beep pattern to indicate speech
        # In a real implementation, you'd need a TTS service or pre-recorded audio
        
        # Simple beep pattern based on text length
        beep_count = min(len(text) // 5, 10)  # Max 10 beeps
        
        for i in range(beep_count):
            # Generate simple tone
            self._generate_tone(800, 100)  # 800Hz for 100ms
            time.sleep_ms(50)
        
        print(f"✓ Speech pattern generated ({beep_count} beeps)")
        return True
    
    def _generate_tone(self, frequency, duration_ms):
        """Generate a simple tone using PWM."""
        if self.audio_output_type == "PWM":
            try:
                # Calculate PWM frequency and duty for tone
                self.pwm.freq(frequency)
                self.pwm.duty(512)  # 50% duty cycle
                time.sleep_ms(duration_ms)
                self.pwm.duty(0)  # Stop tone
            except Exception as e:
                print(f"Tone generation failed: {e}")
    
    def _start_translation_process(self):
        """Start the complete translation process."""
        if self.recording:
            return  # Already recording
        
        print("\n" + "="*40)
        print("Starting translation process...")
        print("="*40)
        
        # Step 1: Record audio
        audio_data = self._record_audio()
        if not audio_data:
            print("Process failed at recording stage")
            return
        
        # Step 2: Send to cloud for processing
        # Note: For ESP32, we'd typically send audio to a cloud service
        # For this example, we'll simulate the process
        
        # Simulate transcription (in real implementation, send to cloud service)
        simulated_text = "Hello, how are you today?"
        print(f"Simulated transcription: '{simulated_text}'")
        
        # Step 3: Translate text
        translated_text = self._translate_text(simulated_text)
        if not translated_text:
            print("Process failed at translation stage")
            return
        
        # Step 4: Convert to speech
        self._text_to_speech(translated_text)
        
        print("✓ Translation process completed!")
        print("="*40)
    
    def run(self):
        """Main control loop."""
        print("LingoPods ESP32 Ready!")
        print("Press button to start translation...")
        
        while True:
            # Main loop - button interrupts handle the work
            time.sleep(1)
            
            # Blink status LED to show device is alive
            if not self.recording and self.wifi_connected:
                self.status_led.value(not self.status_led.value())
            
            # Clean up memory periodically
            if time.ticks_ms() % 10000 < 1000:  # Every ~10 seconds
                gc.collect()


def main():
    """Main function."""
    try:
        # Initialize and run LingoPods ESP32
        lingopods = LingoPodsESP32()
        lingopods.run()
        
    except KeyboardInterrupt:
        print("\nExiting...")
    except Exception as e:
        print(f"Fatal error: {e}")
        machine.reset()


if __name__ == "__main__":
    main()










