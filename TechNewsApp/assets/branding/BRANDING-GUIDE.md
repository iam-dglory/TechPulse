# 🎨 TexhPulze Branding Guide

## Overview

This guide provides comprehensive branding assets and guidelines for the TexhPulze mobile application. All assets are designed to create a cohesive, professional brand identity across all platforms.

## 🎯 Brand Identity

### Color Palette

- **Primary**: `#4ECDC4` (Teal) - Main brand color
- **Secondary**: `#45B7D1` (Blue) - Accent color
- **Tertiary**: `#96CEB4` (Mint) - Support color
- **Background**: `#000000` (Black) - Splash screen background
- **Text**: `#FFFFFF` (White) - Primary text color

### Typography

- **Font Family**: Arial, sans-serif (system fallback)
- **Weight**: Bold for headings, Regular for body text
- **Style**: Clean, modern, tech-focused

## 📱 App Icon Specifications

### Main Icon (`icon.png`)

- **Size**: 1024x1024 pixels
- **Format**: PNG with transparent background
- **Design**: Circular design with pulse waves and tech elements
- **Usage**: Primary app icon for all platforms

### Android Adaptive Icon (`adaptive-icon.png`)

- **Size**: 1024x1024 pixels
- **Format**: PNG with transparent background
- **Design**: Same as main icon, optimized for Android's masking system
- **Safe Zone**: Keep important elements within the center 66% of the icon

### Web Favicon (`favicon.png`)

- **Size**: 32x32 pixels (can also provide 16x16, 48x48)
- **Format**: PNG or ICO
- **Design**: Simplified version of the main icon

## 🖼️ Splash Screen Specifications

### Main Splash (`splash.png`)

- **Size**: 1242x2688 pixels (iPhone 14 Pro Max)
- **Format**: PNG
- **Background**: Gradient from `#4ECDC4` to `#96CEB4`
- **Design**: Centered logo with pulse waves and "TexhPulze" text

### Additional Sizes

- **iPad**: 1242x2208 pixels
- **iPhone SE**: 750x1334 pixels
- **Android**: 1080x1920 pixels

## 🛠️ Asset Generation Instructions

### From SVG to PNG

1. **Using Online Converters**:

   - Upload `icon.svg` or `splash.svg`
   - Set desired dimensions
   - Download PNG file
   - Replace placeholder files

2. **Using Design Tools**:

   - **Figma**: Import SVG, export as PNG
   - **Adobe Illustrator**: Open SVG, export as PNG
   - **Sketch**: Import SVG, export as PNG
   - **GIMP**: Open SVG, export as PNG

3. **Using Command Line**:
   ```bash
   # Install Inkscape (if not already installed)
   # Then convert SVG to PNG:
   inkscape icon.svg --export-png=icon.png --export-width=1024 --export-height=1024
   ```

### Required File Replacements

Replace these placeholder files with actual PNG assets:

1. `icon.png` (1024x1024) - Main app icon
2. `splash.png` (1242x2688) - Splash screen
3. `adaptive-icon.png` (1024x1024) - Android adaptive icon
4. `favicon.png` (32x32) - Web favicon

## 📐 Design Guidelines

### Icon Design Principles

- **Simplicity**: Clean, recognizable at small sizes
- **Consistency**: Same design language across all assets
- **Scalability**: Works well at different sizes
- **Brand Recognition**: Clearly represents TexhPulze

### Splash Screen Principles

- **Loading Experience**: Engaging while app loads
- **Brand Reinforcement**: Strong brand presence
- **Performance**: Optimized file size for fast loading
- **Responsiveness**: Works across different screen sizes

## 🚀 Integration with Expo

### Configuration (`app.config.js`)

The app configuration has been updated to use the new branding assets:

```javascript
{
  icon: "./assets/branding/icon.png",
  splash: {
    image: "./assets/branding/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/branding/icon.png",
      backgroundColor: "#4ECDC4"
    }
  }
}
```

### Build Process

1. Replace placeholder PNG files with actual assets
2. Run `expo build:android` or `expo build:ios`
3. Expo will automatically generate all required sizes
4. Assets will be included in the final app bundle

## 📋 Asset Checklist

### Required Assets

- [ ] `icon.png` (1024x1024) - Main app icon
- [ ] `splash.png` (1242x2688) - Splash screen
- [ ] `adaptive-icon.png` (1024x1024) - Android adaptive icon
- [ ] `favicon.png` (32x32) - Web favicon

### Optional Assets

- [ ] `icon-512.png` (512x512) - Medium size icon
- [ ] `icon-256.png` (256x256) - Small size icon
- [ ] `splash-ipad.png` (1242x2208) - iPad splash
- [ ] `splash-android.png` (1080x1920) - Android splash

## 🔧 Testing

### Before Building

1. Verify all PNG files are properly sized
2. Check that icons look good at small sizes
3. Test splash screen on different devices
4. Ensure assets load quickly

### After Building

1. Test app icon appears correctly on device
2. Verify splash screen displays properly
3. Check adaptive icon on Android devices
4. Test favicon in web version

## 📚 Resources

### Design Tools

- [Figma](https://figma.com) - Free online design tool
- [Adobe Illustrator](https://adobe.com/products/illustrator.html) - Professional vector graphics
- [Sketch](https://sketch.com) - Mac design tool
- [GIMP](https://gimp.org) - Free image editor

### Online Converters

- [CloudConvert](https://cloudconvert.com/svg-to-png) - SVG to PNG converter
- [Convertio](https://convertio.co/svg-png/) - File format converter
- [SVG to PNG](https://svgtopng.com) - Simple SVG converter

### Expo Documentation

- [App Icons](https://docs.expo.dev/guides/app-icons/)
- [Splash Screens](https://docs.expo.dev/guides/splash-screens/)
- [Adaptive Icons](https://docs.expo.dev/guides/app-icons/#adaptive-icons)

## 🎯 Next Steps

1. **Generate Assets**: Convert SVG files to PNG using preferred method
2. **Replace Placeholders**: Update all placeholder files with actual assets
3. **Test Locally**: Run `expo start` to test assets
4. **Build App**: Create production build with `expo build`
5. **Deploy**: Submit to app stores with new branding

## 📞 Support

For issues with branding or asset generation:

- Check Expo documentation for asset requirements
- Verify file sizes and formats are correct
- Test assets on actual devices before building
- Use Expo CLI to validate configuration

---

**Created for TexhPulze v1.0.0**  
_Your Gateway to Tech News_
