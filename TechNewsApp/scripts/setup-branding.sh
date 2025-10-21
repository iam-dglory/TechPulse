#!/bin/bash

# TexhPulze Branding Setup Script
# This script helps set up branding assets for the TexhPulze app

echo "🎨 TexhPulze Branding Setup"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "app.config.js" ]; then
    echo "❌ Error: Please run this script from the TechNewsApp directory"
    exit 1
fi

echo "📋 Current branding status:"
echo ""

# Check for branding assets
if [ -f "assets/branding/icon.png" ]; then
    if grep -q "PLACEHOLDER" "assets/branding/icon.png"; then
        echo "⚠️  icon.png: Placeholder (needs to be replaced)"
    else
        echo "✅ icon.png: Ready"
    fi
else
    echo "❌ icon.png: Missing"
fi

if [ -f "assets/branding/splash.png" ]; then
    if grep -q "PLACEHOLDER" "assets/branding/splash.png"; then
        echo "⚠️  splash.png: Placeholder (needs to be replaced)"
    else
        echo "✅ splash.png: Ready"
    fi
else
    echo "❌ splash.png: Missing"
fi

if [ -f "assets/branding/adaptive-icon.png" ]; then
    if grep -q "PLACEHOLDER" "assets/branding/adaptive-icon.png"; then
        echo "⚠️  adaptive-icon.png: Placeholder (needs to be replaced)"
    else
        echo "✅ adaptive-icon.png: Ready"
    fi
else
    echo "❌ adaptive-icon.png: Missing"
fi

if [ -f "assets/branding/favicon.png" ]; then
    if grep -q "PLACEHOLDER" "assets/branding/favicon.png"; then
        echo "⚠️  favicon.png: Placeholder (needs to be replaced)"
    else
        echo "✅ favicon.png: Ready"
    fi
else
    echo "❌ favicon.png: Missing"
fi

echo ""
echo "📱 App configuration status:"
echo ""

# Check app.config.js for branding paths
if grep -q "./assets/branding/icon.png" "app.config.js"; then
    echo "✅ App icon path: Configured"
else
    echo "❌ App icon path: Not configured"
fi

if grep -q "./assets/branding/splash.png" "app.config.js"; then
    echo "✅ Splash screen path: Configured"
else
    echo "❌ Splash screen path: Not configured"
fi

if grep -q "backgroundColor.*#000000" "app.config.js"; then
    echo "✅ Splash background: Configured"
else
    echo "❌ Splash background: Not configured"
fi

echo ""
echo "🎯 Next steps:"
echo "=============="
echo "1. Convert SVG files to PNG:"
echo "   - icon.svg → icon.png (1024x1024)"
echo "   - splash.svg → splash.png (1242x2688)"
echo ""
echo "2. Create additional assets:"
echo "   - adaptive-icon.png (1024x1024)"
echo "   - favicon.png (32x32)"
echo ""
echo "3. Replace placeholder files with actual PNG assets"
echo ""
echo "4. Test the app:"
echo "   expo start"
echo ""
echo "5. Build for production:"
echo "   expo build:android"
echo "   expo build:ios"
echo ""
echo "📚 For detailed instructions, see:"
echo "   assets/branding/BRANDING-GUIDE.md"
echo ""
echo "🔧 Asset generation tools:"
echo "   - Online: https://cloudconvert.com/svg-to-png"
echo "   - Command line: inkscape (requires installation)"
echo "   - Design tools: Figma, Adobe Illustrator, Sketch"
