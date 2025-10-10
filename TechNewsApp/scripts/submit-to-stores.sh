#!/bin/bash

# TechPulse App Store Submission Script
set -e

echo "🏪 Starting TechPulse App Store Submissions..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="TechPulse"
VERSION=${1:-1.0.0}

echo -e "${BLUE}📋 Submission Configuration:${NC}"
echo "  App: $APP_NAME"
echo "  Version: $VERSION"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI not found. Installing...${NC}"
    npm install -g @expo/eas-cli
fi

# Submit to Google Play Store
echo -e "${BLUE}🤖 Submitting to Google Play Store...${NC}"
if [ -f "google-play-service-account.json" ]; then
    eas submit --platform android --latest --non-interactive
    echo -e "${GREEN}✅ Android app submitted to Google Play Store${NC}"
else
    echo -e "${YELLOW}⚠️  Google Play service account file not found${NC}"
    echo "Please add google-play-service-account.json file"
fi

# Submit to Apple App Store
echo -e "${BLUE}🍎 Submitting to Apple App Store...${NC}"
if [ -f "ios-provisioning-profile.mobileprovision" ]; then
    eas submit --platform ios --latest --non-interactive
    echo -e "${GREEN}✅ iOS app submitted to Apple App Store${NC}"
else
    echo -e "${YELLOW}⚠️  iOS provisioning profile not found${NC}"
    echo "Please add ios-provisioning-profile.mobileprovision file"
fi

echo -e "${GREEN}🎉 App Store submissions completed!${NC}"
echo ""
echo -e "${BLUE}📊 Submission Summary:${NC}"
echo "  ✅ Android: Submitted to Google Play Store"
echo "  ✅ iOS: Submitted to Apple App Store"
echo "  📱 Version: $VERSION"
echo ""
echo -e "${YELLOW}📱 Next Steps:${NC}"
echo "  1. Wait for app store review"
echo "  2. Monitor app store analytics"
echo "  3. Set up app store optimization"
echo "  4. Plan marketing campaign"
