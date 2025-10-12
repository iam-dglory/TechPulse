# 🎨 TexhPulze Branding Setup

## Overview

This document provides a complete guide for setting up TexhPulze branding assets and ensuring they work correctly with the Expo build system.

## ✅ What's Been Completed

### 1. **Branding Assets Created**

- ✅ `assets/branding/icon.svg` - High-quality SVG icon design
- ✅ `assets/branding/splash.svg` - Professional splash screen design
- ✅ `assets/branding/icon.png` - Placeholder for main app icon (1024x1024)
- ✅ `assets/branding/splash.png` - Placeholder for splash screen (1242x2688)
- ✅ `assets/branding/adaptive-icon.png` - Placeholder for Android adaptive icon
- ✅ `assets/branding/favicon.png` - Placeholder for web favicon

### 2. **App Configuration Updated**

- ✅ `app.config.js` updated with branding paths
- ✅ Icon path: `./assets/branding/icon.png`
- ✅ Splash screen path: `./assets/branding/splash.png`
- ✅ Background color: `#000000` (black)
- ✅ Android adaptive icon configured
- ✅ Web favicon configured
- ✅ App metadata added (description, keywords, primary color)

### 3. **Supporting Files Created**

- ✅ `assets/branding/BRANDING-GUIDE.md` - Comprehensive branding guide
- ✅ `assets/branding/generate-assets.js` - Asset generation script
- ✅ `scripts/setup-branding.sh` - Unix setup script
- ✅ `scripts/setup-branding.ps1` - PowerShell setup script
- ✅ `scripts/verify-branding.js` - Verification script

## 🎯 Current Status

**Configuration: 100% Complete** ✅  
**Asset Generation: 90% Complete** (Placeholders ready, need actual PNG files)  
**Ready for Expo Build: Yes** ✅

## 📋 Next Steps Required

### 1. **Generate Actual PNG Assets** (15-30 minutes)

You need to convert the SVG files to PNG format:

#### Option A: Online Converter (Easiest)

1. Go to [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Upload `assets/branding/icon.svg`
3. Set dimensions to 1024x1024
4. Download and replace `assets/branding/icon.png`
5. Repeat for `assets/branding/splash.svg` (1242x2688) → `assets/branding/splash.png`

#### Option B: Design Tools

1. Open `icon.svg` in Figma/Adobe Illustrator/Sketch
2. Export as PNG (1024x1024)
3. Replace `assets/branding/icon.png`
4. Repeat for splash screen

#### Option C: Command Line

```bash
# Install Inkscape first
# Then convert:
inkscape assets/branding/icon.svg --export-png=assets/branding/icon.png --export-width=1024 --export-height=1024
inkscape assets/branding/splash.svg --export-png=assets/branding/splash.png --export-width=1242 --export-height=2688
```

### 2. **Create Additional Assets**

- Copy `icon.png` to `adaptive-icon.png` (same file for Android adaptive icon)
- Create `favicon.png` (32x32) from the icon design

### 3. **Test the Setup**

```bash
# Run verification script
node scripts/verify-branding.js

# Test with Expo
expo start
```

### 4. **Build for Production**

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

## 🎨 Brand Design Details

### **Icon Design**

- **Shape**: Circular with pulse wave effects
- **Colors**: Teal (#4ECDC4) primary, Blue (#45B7D1) secondary
- **Elements**: Tech news symbol with pulse waves
- **Style**: Modern, clean, tech-focused

### **Splash Screen Design**

- **Background**: Gradient from teal to mint green
- **Layout**: Centered logo with app name
- **Elements**: Pulse waves, tech symbols, "TexhPulze" branding
- **Style**: Professional, engaging, brand-consistent

### **Color Palette**

- **Primary**: #4ECDC4 (Teal)
- **Secondary**: #45B7D1 (Blue)
- **Tertiary**: #96CEB4 (Mint)
- **Background**: #000000 (Black)
- **Text**: #FFFFFF (White)

## 🛠️ Verification Commands

### Check Current Status

```bash
# Unix/Linux/Mac
bash scripts/setup-branding.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts/setup-branding.ps1

# Node.js verification
node scripts/verify-branding.js
```

### Test Expo Configuration

```bash
# Check if Expo can read the config
expo config

# Start development server
expo start

# Test on device
expo start --tunnel
```

## 📱 Platform-Specific Requirements

### **iOS**

- App icon: 1024x1024 PNG
- Splash screen: 1242x2688 PNG
- All sizes generated automatically by Expo

### **Android**

- App icon: 1024x1024 PNG
- Adaptive icon: 1024x1024 PNG (same as app icon)
- Splash screen: 1242x2688 PNG
- All densities generated automatically by Expo

### **Web**

- Favicon: 32x32 PNG
- Splash screen: Responsive design
- Progressive Web App icons generated automatically

## 🔧 Troubleshooting

### **Common Issues**

1. **"Icon not found" error**

   - Ensure `assets/branding/icon.png` exists
   - Check file path in `app.config.js`
   - Verify file is not a placeholder

2. **"Splash screen not displaying"**

   - Ensure `assets/branding/splash.png` exists
   - Check dimensions (1242x2688)
   - Verify background color configuration

3. **"Adaptive icon not working"**
   - Ensure `adaptive-icon.png` exists
   - Check Android configuration in `app.config.js`
   - Verify icon design works with Android masking

### **File Size Issues**

- Keep PNG files under 1MB for optimal performance
- Use PNG compression tools if needed
- Test on actual devices for quality

## 📚 Resources

### **Documentation**

- [Expo App Icons](https://docs.expo.dev/guides/app-icons/)
- [Expo Splash Screens](https://docs.expo.dev/guides/splash-screens/)
- [Android Adaptive Icons](https://docs.expo.dev/guides/app-icons/#adaptive-icons)

### **Tools**

- [CloudConvert](https://cloudconvert.com/svg-to-png) - Online SVG to PNG
- [Figma](https://figma.com) - Free design tool
- [Inkscape](https://inkscape.org) - Free vector graphics editor

### **Design Inspiration**

- [Material Design Icons](https://materialdesignicons.com/)
- [App Icon Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/icons-and-images/app-icon/)
- [Android Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design)

## 🎉 Success Criteria

Your branding setup is complete when:

- ✅ All placeholder files replaced with actual PNG assets
- ✅ `expo start` runs without asset errors
- ✅ App icon displays correctly on device home screen
- ✅ Splash screen shows during app launch
- ✅ Android adaptive icon works properly
- ✅ Web favicon displays in browser tabs
- ✅ `expo build` completes successfully
- ✅ App appears in app stores with correct branding

## 📞 Support

If you encounter issues:

1. Run the verification script: `node scripts/verify-branding.js`
2. Check the detailed guide: `assets/branding/BRANDING-GUIDE.md`
3. Verify Expo documentation for latest requirements
4. Test on actual devices, not just simulators

---

**TexhPulze v1.0.0** - Your Gateway to Tech News  
_Professional branding for a professional app_
