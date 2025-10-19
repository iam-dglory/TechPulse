# TechPulze Development Server Startup Script
# Run this in PowerShell or right-click > Run with PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TechPulze Voting System - Server    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to techpulze directory
Set-Location -Path $PSScriptRoot
Write-Host "Current directory: $PWD" -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Green
try {
    $nodeVersion = node --version 2>&1
    Write-Host " Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>&1
    Write-Host " npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host " npm not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies (first time setup)..." -ForegroundColor Yellow
    npm install
    Write-Host " Dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

# Check if .env.local exists
if (-Not (Test-Path ".env.local")) {
    Write-Host "  Warning: .env.local not found!" -ForegroundColor Yellow
    Write-Host "Create .env.local with your Supabase credentials" -ForegroundColor Yellow
    Write-Host ""
}

# Start the development server
Write-Host "Starting Next.js development server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Run npm dev
npm run dev
