# TechPulze Deployment Script for Vercel
# This script helps deploy your voting system to production

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TechPulze Production Deployment     " -ForegroundColor Cyan
Write-Host "   Deploy to www.techpulze.com         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location -Path $PSScriptRoot
Write-Host "=Â Current directory: $PWD" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check prerequisites
Write-Host "= Step 1: Checking prerequisites..." -ForegroundColor Green
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host " Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version 2>&1
    Write-Host " npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host " npm not found!" -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host " Vercel CLI installed!" -ForegroundColor Green
} else {
    Write-Host " Vercel CLI installed" -ForegroundColor Green
}

Write-Host ""

# Step 2: Run tests
Write-Host ">ê Step 2: Running production build test..." -ForegroundColor Green
Write-Host ""

Write-Host "Building production bundle..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host " Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host " Production build successful!" -ForegroundColor Green
Write-Host ""

# Step 3: Check environment variables
Write-Host "= Step 3: Checking environment setup..." -ForegroundColor Green
Write-Host ""

if (Test-Path ".env.local") {
    Write-Host " .env.local found" -ForegroundColor Green
} else {
    Write-Host "  Warning: .env.local not found" -ForegroundColor Yellow
}

if (Test-Path ".env.production") {
    Write-Host " .env.production found" -ForegroundColor Green
} else {
    Write-Host "  Warning: .env.production not found" -ForegroundColor Yellow
    Write-Host "  You'll need to set environment variables in Vercel Dashboard" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Git status check
Write-Host "=Ý Step 4: Checking Git status..." -ForegroundColor Green
Write-Host ""

$gitStatus = git status --porcelain 2>&1
if ($LASTEXITCODE -eq 0) {
    if ($gitStatus) {
        Write-Host "  You have uncommitted changes:" -ForegroundColor Yellow
        git status --short
        Write-Host ""

        $commit = Read-Host "Commit changes before deploying? (y/n)"
        if ($commit -eq 'y') {
            $message = Read-Host "Enter commit message"
            git add .
            git commit -m "$message"
            Write-Host " Changes committed!" -ForegroundColor Green
        }
    } else {
        Write-Host " No uncommitted changes" -ForegroundColor Green
    }
} else {
    Write-Host "  Git not initialized or not a Git repository" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Deploy to Vercel
Write-Host "=€ Step 5: Deploying to Vercel..." -ForegroundColor Green
Write-Host ""

$deploy = Read-Host "Ready to deploy to production? (y/n)"
if ($deploy -ne 'y') {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Deploying to Vercel (this may take a few minutes)..." -ForegroundColor Cyan
Write-Host ""

# Deploy to production
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   <‰ DEPLOYMENT SUCCESSFUL! <‰        " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app is now live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Configure custom domain in Vercel Dashboard" -ForegroundColor White
    Write-Host "2. Set environment variables (if not already done)" -ForegroundColor White
    Write-Host "3. Test voting system: https://your-app.vercel.app" -ForegroundColor White
    Write-Host "4. Configure DNS for techpulze.com" -ForegroundColor White
    Write-Host ""
    Write-Host "=Ú See PRODUCTION_DEPLOYMENT.md for detailed steps" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host " Deployment failed!" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Read-Host "Press Enter to exit"
