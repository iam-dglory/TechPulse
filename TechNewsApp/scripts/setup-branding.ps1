# TexhPulze Branding Setup Script (PowerShell)
# This script helps set up branding assets for the TexhPulze app

Write-Host "🎨 TexhPulze Branding Setup" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "app.config.js")) {
    Write-Host "❌ Error: Please run this script from the TechNewsApp directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Current branding status:" -ForegroundColor Yellow
Write-Host ""

# Check for branding assets
$assets = @(
    @{Name = "icon.png"; Path = "assets/branding/icon.png" },
    @{Name = "splash.png"; Path = "assets/branding/splash.png" },
    @{Name = "adaptive-icon.png"; Path = "assets/branding/adaptive-icon.png" },
    @{Name = "favicon.png"; Path = "assets/branding/favicon.png" }
)

foreach ($asset in $assets) {
    if (Test-Path $asset.Path) {
        $content = Get-Content $asset.Path -Raw
        if ($content -match "PLACEHOLDER") {
            Write-Host "⚠️  $($asset.Name): Placeholder (needs to be replaced)" -ForegroundColor Yellow
        }
        else {
            Write-Host "✅ $($asset.Name): Ready" -ForegroundColor Green
        }
    }
    else {
        Write-Host "❌ $($asset.Name): Missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📱 App configuration status:" -ForegroundColor Yellow
Write-Host ""

# Check app.config.js for branding paths
$configContent = Get-Content "app.config.js" -Raw

if ($configContent -match "./assets/branding/icon.png") {
    Write-Host "✅ App icon path: Configured" -ForegroundColor Green
}
else {
    Write-Host "❌ App icon path: Not configured" -ForegroundColor Red
}

if ($configContent -match "./assets/branding/splash.png") {
    Write-Host "✅ Splash screen path: Configured" -ForegroundColor Green
}
else {
    Write-Host "❌ Splash screen path: Not configured" -ForegroundColor Red
}

if ($configContent -match "backgroundColor.*#000000") {
    Write-Host "✅ Splash background: Configured" -ForegroundColor Green
}
else {
    Write-Host "❌ Splash background: Not configured" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "1. Convert SVG files to PNG:"
Write-Host "   - icon.svg → icon.png (1024x1024)"
Write-Host "   - splash.svg → splash.png (1242x2688)"
Write-Host ""
Write-Host "2. Create additional assets:"
Write-Host "   - adaptive-icon.png (1024x1024)"
Write-Host "   - favicon.png (32x32)"
Write-Host ""
Write-Host "3. Replace placeholder files with actual PNG assets"
Write-Host ""
Write-Host "4. Test the app:"
Write-Host "   expo start"
Write-Host ""
Write-Host "5. Build for production:"
Write-Host "   expo build:android"
Write-Host "   expo build:ios"
Write-Host ""
Write-Host "📚 For detailed instructions, see:"
Write-Host "   assets/branding/BRANDING-GUIDE.md"
Write-Host ""
Write-Host "🔧 Asset generation tools:"
Write-Host "   - Online: https://cloudconvert.com/svg-to-png"
Write-Host "   - Command line: inkscape (requires installation)"
Write-Host "   - Design tools: Figma, Adobe Illustrator, Sketch"
