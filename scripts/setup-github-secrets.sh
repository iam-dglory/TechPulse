#!/bin/bash

# TexhPulze GitHub Secrets Setup Script
# This script helps you gather the required secrets for CI/CD

echo "🔐 TexhPulze GitHub Secrets Setup"
echo "=================================="
echo ""

echo "This script will help you gather the required secrets for CI/CD workflows."
echo "You'll need to add these secrets to your GitHub repository:"
echo "Settings → Secrets and variables → Actions → New repository secret"
echo ""

# Function to prompt for secret value
prompt_secret() {
    local var_name=$1
    local description=$2
    local example=$3
    
    echo "📋 $description"
    if [ -n "$example" ]; then
        echo "   Example: $example"
    fi
    echo -n "   Enter value (or press Enter to skip): "
    read -s value
    echo ""
    
    if [ -n "$value" ]; then
        echo "✅ $var_name: [HIDDEN]"
        echo "$var_name=$value" >> .github-secrets.txt
    else
        echo "⏭️  $var_name: Skipped"
    fi
    echo ""
}

# Clear any existing secrets file
rm -f .github-secrets.txt

echo "🔑 Required Secrets:"
echo ""

# Required secrets
prompt_secret "DATABASE_URL" "PostgreSQL connection string for production database" "postgresql://user:pass@host:5432/db"
prompt_secret "OPENAI_API_KEY" "OpenAI API key for AI features" "sk-proj-..."
prompt_secret "EAS_TOKEN" "Expo Application Services token" "exp_..."
prompt_secret "RENDER_API_KEY" "Render API key for deployment" "rnd_..."
prompt_secret "EXPO_TOKEN" "Expo authentication token" "exp_..."

echo ""
echo "🔧 Optional Secrets:"
echo ""

# Optional secrets
prompt_secret "SNYK_TOKEN" "Snyk security scanning token (optional)" "xxxxxxxx"
prompt_secret "SLACK_WEBHOOK" "Slack webhook for notifications (optional)" "https://hooks.slack.com/services/YOUR_WORKSPACE/YOUR_CHANNEL/YOUR_TOKEN"
prompt_secret "GOOGLE_SERVICE_ACCOUNT_KEY" "Google Play service account JSON (optional)" '{"type": "service_account", ...}'

echo ""
echo "📝 Instructions:"
echo "================"
echo ""

if [ -f .github-secrets.txt ]; then
    echo "✅ Secrets collected! Next steps:"
    echo ""
    echo "1. Go to your GitHub repository"
    echo "2. Navigate to: Settings → Secrets and variables → Actions"
    echo "3. Click 'New repository secret' for each secret below:"
    echo ""
    
    while IFS='=' read -r key value; do
        echo "   Name: $key"
        echo "   Value: $value"
        echo ""
    done < .github-secrets.txt
    
    echo "4. After adding all secrets, your CI/CD workflows will work!"
    echo ""
    echo "⚠️  Security Note: The .github-secrets.txt file contains sensitive data."
    echo "   Delete it after adding secrets to GitHub:"
    echo "   rm .github-secrets.txt"
    echo ""
else
    echo "❌ No secrets were collected."
    echo ""
    echo "You can run this script again to collect secrets, or manually add them:"
    echo ""
    echo "Required secrets:"
    echo "- DATABASE_URL"
    echo "- OPENAI_API_KEY" 
    echo "- EAS_TOKEN"
    echo "- RENDER_API_KEY"
    echo "- EXPO_TOKEN"
    echo ""
fi

echo "🚀 Getting Started with EAS:"
echo "============================="
echo ""
echo "If you haven't set up EAS yet:"
echo ""
echo "1. Install EAS CLI:"
echo "   npm install -g @expo/eas-cli"
echo ""
echo "2. Login to Expo:"
echo "   npx expo login"
echo ""
echo "3. Login to EAS:"
echo "   npx eas login"
echo ""
echo "4. Get your tokens:"
echo "   npx expo whoami  # This shows your Expo token"
echo "   npx eas whoami   # This shows your EAS token"
echo ""

echo "🗄️  Setting up Database:"
echo "========================"
echo ""
echo "For Render deployment:"
echo ""
echo "1. Create a PostgreSQL database in Render"
echo "2. Copy the connection string"
echo "3. Use it as your DATABASE_URL secret"
echo ""

echo "🤖 Setting up OpenAI:"
echo "====================="
echo ""
echo "1. Go to https://platform.openai.com/api-keys"
echo "2. Create a new API key"
echo "3. Use it as your OPENAI_API_KEY secret"
echo ""

echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. Add all secrets to GitHub"
echo "2. Push your code to trigger CI/CD"
echo "3. Monitor builds in GitHub Actions"
echo "4. Deploy to Render using the blueprint"
echo ""

echo "📚 Documentation:"
echo "================="
echo ""
echo "- Deployment Guide: DEPLOYMENT-SETUP.md"
echo "- Claim Workflow: CLAIM-WORKFLOW-GUIDE.md"
echo "- Testing Guide: TESTING.md"
echo ""

echo "✅ Setup complete! Happy deploying! 🚀"
