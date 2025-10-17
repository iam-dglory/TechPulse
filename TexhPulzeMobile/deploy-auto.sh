#!/bin/bash

# 🚀 TexhPulze Web Auto Deployment Script
# This automation builds your web version, commits it to GitHub, and triggers an automatic Vercel deployment linked to www.texhpulze.com

echo "============================================"
echo "🌐 Starting TexhPulze Web Build & Deployment"
echo "============================================"

# 1️⃣ Ensure dependencies are up to date
echo "📦 Installing dependencies..."
npm install

# 2️⃣ Clean old build files
echo "🧹 Cleaning previous web build..."
if [ -d "dist/web-build" ]; then
  rm -rf dist/web-build
fi

# 3️⃣ Build web version
echo "⚙️ Exporting Expo Web build..."
npx expo export --platform web

# 4️⃣ Verify build output
if [ -d "dist/web-build" ]; then
  echo "✅ Web build generated successfully!"
else
  echo "❌ Web build failed. Check Expo configuration."
  exit 1
fi

# 5️⃣ Commit and push changes to GitHub
echo "🌀 Preparing Git commit..."
git add .
git commit -m "Auto: Web build update for TexhPulze $(date +'%Y-%m-%d %H:%M:%S')"
git push origin main

# 6️⃣ Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod --confirm --name texhpulze-web --token=$VERCEL_TOKEN

# 7️⃣ Domain verification
echo "🌍 Verifying domain connection..."
npx vercel domains add texhpulze.com --token=$VERCEL_TOKEN
npx vercel alias set texhpulze.vercel.app www.texhpulze.com --token=$VERCEL_TOKEN

# 8️⃣ Final message
echo "============================================"
echo "🎉 TexhPulze successfully deployed!"
echo "🔗 Visit: https://www.texhpulze.com"
echo "============================================"
