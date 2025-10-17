# 🚀 TexhPulze Web Auto Deployment Script
# This automation builds your web version, commits it to GitHub, and triggers an automatic Vercel deployment linked to www.texhpulze.com

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🌐 Starting TexhPulze Web Build & Deployment" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

# 1️⃣ Ensure dependencies are up to date
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

# 2️⃣ Clean old build files
Write-Host "🧹 Cleaning previous web build..." -ForegroundColor Yellow
if (Test-Path "dist/web-build") {
    Remove-Item -Recurse -Force "dist/web-build"
}

# 3️⃣ Build web version
Write-Host "⚙️ Exporting Expo Web build..." -ForegroundColor Blue
npx expo export --platform web

# 4️⃣ Verify build output
if (Test-Path "dist/web-build") {
    Write-Host "✅ Web build generated successfully!" -ForegroundColor Green
}
else {
    Write-Host "❌ Web build failed. Check Expo configuration." -ForegroundColor Red
    exit 1
}

# 5️⃣ Commit and push changes to GitHub
Write-Host "🌀 Preparing Git commit..." -ForegroundColor Blue
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git add .
git commit -m "Auto: Web build update for TexhPulze $timestamp"
git push origin main

# 6️⃣ Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
npx vercel --prod --confirm --name texhpulze-web --token=$env:VERCEL_TOKEN

# 7️⃣ Domain verification
Write-Host "🌍 Verifying domain connection..." -ForegroundColor Blue
npx vercel domains add texhpulze.com --token=$env:VERCEL_TOKEN
npx vercel alias set texhpulze.vercel.app www.texhpulze.com --token=$env:VERCEL_TOKEN

# 8️⃣ Final message
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 TexhPulze successfully deployed!" -ForegroundColor Green
Write-Host "🔗 Visit: https://www.texhpulze.com" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
# 🚀 TexhPulze Web Auto Deployment Script
# This automation builds your web version, commits it to GitHub, and triggers an automatic Vercel deployment linked to www.texhpulze.com

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🌐 Starting TexhPulze Web Build & Deployment" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

# 1️⃣ Ensure dependencies are up to date
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

# 2️⃣ Clean old build files
Write-Host "🧹 Cleaning previous web build..." -ForegroundColor Yellow
if (Test-Path "dist/web-build") {
    Remove-Item -Recurse -Force "dist/web-build"
}

# 3️⃣ Build web version
Write-Host "⚙️ Exporting Expo Web build..." -ForegroundColor Blue
npx expo export --platform web

# 4️⃣ Verify build output
if (Test-Path "dist/web-build") {
    Write-Host "✅ Web build generated successfully!" -ForegroundColor Green
}
else {
    Write-Host "❌ Web build failed. Check Expo configuration." -ForegroundColor Red
    exit 1
}

# 5️⃣ Commit and push changes to GitHub
Write-Host "🌀 Preparing Git commit..." -ForegroundColor Blue
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git add .
git commit -m "Auto: Web build update for TexhPulze $timestamp"
git push origin main

# 6️⃣ Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
npx vercel --prod --confirm --name texhpulze-web --token=$env:VERCEL_TOKEN

# 7️⃣ Domain verification
Write-Host "🌍 Verifying domain connection..." -ForegroundColor Blue
npx vercel domains add texhpulze.com --token=$env:VERCEL_TOKEN
npx vercel alias set texhpulze.vercel.app www.texhpulze.com --token=$env:VERCEL_TOKEN

# 8️⃣ Final message
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 TexhPulze successfully deployed!" -ForegroundColor Green
Write-Host "🔗 Visit: https://www.texhpulze.com" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
