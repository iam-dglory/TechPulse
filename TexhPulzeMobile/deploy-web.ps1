# ⚙️ Cursor Automation: TexhPulze Web Deployment (Vercel)
# This script builds your Expo app for the web and deploys it to your domain.

Write-Host "🚀 Starting TexhPulze Web Build & Deployment..." -ForegroundColor Green

# 1️⃣ Clean existing builds if any
if (Test-Path "dist/web-build") {
    Write-Host "🧹 Cleaning old web build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "dist/web-build"
}

# 2️⃣ Export Expo web build
Write-Host "⚙️ Building Expo Web version..." -ForegroundColor Blue
npx expo export --platform web

# 3️⃣ Verify the build output
if (Test-Path "dist/web-build") {
    Write-Host "✅ Web build created successfully at dist/web-build" -ForegroundColor Green
}
else {
    Write-Host "❌ Web build failed to generate. Check for Expo errors." -ForegroundColor Red
    exit 1
}

# 4️⃣ Create vercel.json configuration for deployment
Write-Host "📝 Creating Vercel configuration..." -ForegroundColor Blue
$vercelConfig = @"
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
"@
$vercelConfig | Out-File -FilePath "vercel.json" -Encoding UTF8

# 5️⃣ Deploy to Vercel (Make sure you are logged in with `vercel login`)
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
npx vercel --prod --name texhpulze-web --confirm

# 6️⃣ Display Success Message
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Visit your site at: https://www.texhpulze.com" -ForegroundColor Cyan
