#!/bin/bash

# ⚙️ Cursor Automation: TexhPulze Web Deployment (Vercel)
# This script builds your Expo app for the web and deploys it to your domain.

echo "🚀 Starting TexhPulze Web Build & Deployment..."

# 1️⃣ Clean existing builds if any
if [ -d "dist/web-build" ]; then
  echo "🧹 Cleaning old web build..."
  rm -rf dist/web-build
fi

# 2️⃣ Export Expo web build
echo "⚙️ Building Expo Web version..."
npx expo export --platform web

# 3️⃣ Verify the build output
if [ -d "dist/web-build" ]; then
  echo "✅ Web build created successfully at dist/web-build"
else
  echo "❌ Web build failed to generate. Check for Expo errors."
  exit 1
fi

# 4️⃣ Create vercel.json configuration for deployment
echo "📝 Creating Vercel configuration..."
cat <<EOT > vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/web-build/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/web-build/\$1"
    }
  ]
}
EOT

# 5️⃣ Deploy to Vercel (Make sure you are logged in with `vercel login`)
echo "🚀 Deploying to Vercel..."
npx vercel --prod --name texhpulze-web --confirm

# 6️⃣ Display Success Message
echo "🎉 Deployment complete!"
echo "🌐 Visit your site at: https://www.texhpulze.com"
