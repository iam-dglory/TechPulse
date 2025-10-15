# TexhPulze GitHub Secrets Setup Script (PowerShell)
# This script helps you gather the required secrets for CI/CD

Write-Host "🔐 TexhPulze GitHub Secrets Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you gather the required secrets for CI/CD workflows." -ForegroundColor Yellow
Write-Host "You'll need to add these secrets to your GitHub repository:" -ForegroundColor Yellow
Write-Host "Settings → Secrets and variables → Actions → New repository secret" -ForegroundColor Yellow
Write-Host ""

# Function to prompt for secret value
function Prompt-Secret {
    param(
        [string]$VarName,
        [string]$Description,
        [string]$Example = ""
    )
    
    Write-Host "📋 $Description" -ForegroundColor Green
    if ($Example) {
        Write-Host "   Example: $Example" -ForegroundColor Gray
    }
    $value = Read-Host "   Enter value (or press Enter to skip)"
    
    if ($value) {
        Write-Host "✅ $VarName`: [HIDDEN]" -ForegroundColor Green
        Add-Content -Path ".github-secrets.txt" -Value "$VarName=$value"
    }
    else {
        Write-Host "⏭️  $VarName`: Skipped" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Clear any existing secrets file
if (Test-Path ".github-secrets.txt") {
    Remove-Item ".github-secrets.txt"
}

Write-Host "🔑 Required Secrets:" -ForegroundColor Cyan
Write-Host ""

# Required secrets
Prompt-Secret -VarName "DATABASE_URL" -Description "PostgreSQL connection string for production database" -Example "postgresql://user:pass@host:5432/db"
Prompt-Secret -VarName "OPENAI_API_KEY" -Description "OpenAI API key for AI features" -Example "sk-proj-..."
Prompt-Secret -VarName "EAS_TOKEN" -Description "Expo Application Services token" -Example "exp_..."
Prompt-Secret -VarName "RENDER_API_KEY" -Description "Render API key for deployment" -Example "rnd_..."
Prompt-Secret -VarName "EXPO_TOKEN" -Description "Expo authentication token" -Example "exp_..."

Write-Host ""
Write-Host "🔧 Optional Secrets:" -ForegroundColor Cyan
Write-Host ""

# Optional secrets
Prompt-Secret -VarName "SNYK_TOKEN" -Description "Snyk security scanning token (optional)" -Example "xxxxxxxx"
Prompt-Secret -VarName "SLACK_WEBHOOK" -Description "Slack webhook for notifications (optional)" -Example "https://hooks.slack.com/services/YOUR_WORKSPACE/YOUR_CHANNEL/YOUR_TOKEN"
Prompt-Secret -VarName "GOOGLE_SERVICE_ACCOUNT_KEY" -Description "Google Play service account JSON (optional)" -Example '{"type": "service_account", ...}'

Write-Host ""
Write-Host "📝 Instructions:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".github-secrets.txt") {
    Write-Host "✅ Secrets collected! Next steps:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Go to your GitHub repository" -ForegroundColor Yellow
    Write-Host "2. Navigate to: Settings → Secrets and variables → Actions" -ForegroundColor Yellow
    Write-Host "3. Click 'New repository secret' for each secret below:" -ForegroundColor Yellow
    Write-Host ""
    
    $secrets = Get-Content ".github-secrets.txt"
    foreach ($secret in $secrets) {
        $parts = $secret.Split('=')
        if ($parts.Length -eq 2) {
            Write-Host "   Name: $($parts[0])" -ForegroundColor White
            Write-Host "   Value: $($parts[1])" -ForegroundColor Gray
            Write-Host ""
        }
    }
    
    Write-Host "4. After adding all secrets, your CI/CD workflows will work!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Security Note: The .github-secrets.txt file contains sensitive data." -ForegroundColor Red
    Write-Host "   Delete it after adding secrets to GitHub:" -ForegroundColor Red
    Write-Host "   Remove-Item .github-secrets.txt" -ForegroundColor Red
    Write-Host ""
}
else {
    Write-Host "❌ No secrets were collected." -ForegroundColor Red
    Write-Host ""
    Write-Host "You can run this script again to collect secrets, or manually add them:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Required secrets:" -ForegroundColor Yellow
    Write-Host "- DATABASE_URL" -ForegroundColor White
    Write-Host "- OPENAI_API_KEY" -ForegroundColor White
    Write-Host "- EAS_TOKEN" -ForegroundColor White
    Write-Host "- RENDER_API_KEY" -ForegroundColor White
    Write-Host "- EXPO_TOKEN" -ForegroundColor White
    Write-Host ""
}

Write-Host "🚀 Getting Started with EAS:" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you haven't set up EAS yet:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Install EAS CLI:" -ForegroundColor White
Write-Host "   npm install -g @expo/eas-cli" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Login to Expo:" -ForegroundColor White
Write-Host "   npx expo login" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Login to EAS:" -ForegroundColor White
Write-Host "   npx eas login" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Get your tokens:" -ForegroundColor White
Write-Host "   npx expo whoami  # This shows your Expo token" -ForegroundColor Gray
Write-Host "   npx eas whoami   # This shows your EAS token" -ForegroundColor Gray
Write-Host ""

Write-Host "🗄️  Setting up Database:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For Render deployment:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create a PostgreSQL database in Render" -ForegroundColor White
Write-Host "2. Copy the connection string" -ForegroundColor White
Write-Host "3. Use it as your DATABASE_URL secret" -ForegroundColor White
Write-Host ""

Write-Host "🤖 Setting up OpenAI:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to https://platform.openai.com/api-keys" -ForegroundColor White
Write-Host "2. Create a new API key" -ForegroundColor White
Write-Host "3. Use it as your OPENAI_API_KEY secret" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Add all secrets to GitHub" -ForegroundColor White
Write-Host "2. Push your code to trigger CI/CD" -ForegroundColor White
Write-Host "3. Monitor builds in GitHub Actions" -ForegroundColor White
Write-Host "4. Deploy to Render using the blueprint" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host ""
Write-Host "- Deployment Guide: DEPLOYMENT-SETUP.md" -ForegroundColor White
Write-Host "- Claim Workflow: CLAIM-WORKFLOW-GUIDE.md" -ForegroundColor White
Write-Host "- Testing Guide: TESTING.md" -ForegroundColor White
Write-Host ""

Write-Host "✅ Setup complete! Happy deploying! 🚀" -ForegroundColor Green
