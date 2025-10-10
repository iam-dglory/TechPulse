#!/bin/bash

# TechPulse Mobile App Production Build Script
set -e

echo "📱 Starting TechPulse Mobile App Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="TechPulse"
VERSION=${1:-1.0.0}
BUILD_NUMBER=${2:-1}

echo -e "${BLUE}📋 Build Configuration:${NC}"
echo "  App: $APP_NAME"
echo "  Version: $VERSION"
echo "  Build Number: $BUILD_NUMBER"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI not found. Installing...${NC}"
    npm install -g @expo/eas-cli
fi

# Check if logged in to EAS
echo -e "${BLUE}🔐 Checking EAS authentication...${NC}"
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to EAS. Please log in:${NC}"
    eas login
fi

# Update app configuration with version
echo -e "${BLUE}📝 Updating app configuration...${NC}"
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" app.config.js
sed -i.bak "s/\"buildNumber\": \".*\"/\"buildNumber\": \"$BUILD_NUMBER\"/" app.config.js
sed -i.bak "s/\"versionCode\": .*/\"versionCode\": $BUILD_NUMBER/" app.config.js

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Build for Android
echo -e "${BLUE}🤖 Building Android app...${NC}"
eas build --platform android --profile production --non-interactive

# Build for iOS
echo -e "${BLUE}🍎 Building iOS app...${NC}"
eas build --platform ios --profile production --non-interactive

# Build for both platforms
echo -e "${BLUE}🌐 Building for both platforms...${NC}"
eas build --platform all --profile production --non-interactive

echo -e "${GREEN}✅ Mobile app builds completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Build Summary:${NC}"
echo "  ✅ Android AAB: Ready for Play Store"
echo "  ✅ iOS IPA: Ready for App Store"
echo "  📱 Version: $VERSION ($BUILD_NUMBER)"
echo ""
echo -e "${YELLOW}📱 Next Steps:${NC}"
echo "  1. Download builds from EAS dashboard"
echo "  2. Submit to Google Play Store"
echo "  3. Submit to Apple App Store"
echo "  4. Set up app store optimization"
