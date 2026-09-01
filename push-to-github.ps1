# JEEVAN AI - GitHub Push Setup Script (PowerShell)
# Run this script to push your code to GitHub

Write-Host ""
Write-Host "========================================"
Write-Host "JEEVAN AI - GitHub Push Setup" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""

# Set location
cd "c:\jeevan-ai-main"

# Configure Git
Write-Host "Setting up Git configuration..." -ForegroundColor Yellow
git config --global user.name "vedantkokane94-del"
git config --global user.email "vedantkokane94@gmail.com"
git config --global credential.helper manager

Write-Host ""
Write-Host "Current Git Status:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "========================================"
Write-Host "NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host ""

Write-Host "The repository push failed with 403 Permission Denied." -ForegroundColor Red
Write-Host ""
Write-Host "Choose ONE option below:" -ForegroundColor Yellow
Write-Host ""

Write-Host "OPTION 1: Create New Repository" -ForegroundColor Green
Write-Host "  1. Visit: https://github.com/new"
Write-Host "  2. Name: jeevan-ai"
Write-Host "  3. Visibility: Public"
Write-Host "  4. Click 'Create Repository'"
Write-Host "  5. Copy the URL (should be: https://github.com/vedantkokane94-del/jeevan-ai.git)"
Write-Host "  6. Run:"
Write-Host "     git remote set-url origin https://github.com/vedantkokane94-del/jeevan-ai.git"
Write-Host "     git push -u origin main"
Write-Host ""

Write-Host "OPTION 2: Use SSH Key (Most Secure)" -ForegroundColor Green
Write-Host "  1. Generate SSH key:"
Write-Host "     ssh-keygen -t ed25519 -C 'vedantkokane94@gmail.com'"
Write-Host "  2. Add public key to: https://github.com/settings/keys"
Write-Host "  3. Update remote:"
Write-Host "     git remote set-url origin git@github.com:vedantkokane94-del/jeevan-ai.git"
Write-Host "  4. Push:"
Write-Host "     git push -u origin main"
Write-Host ""

Write-Host "OPTION 3: Use Personal Access Token (PAT)" -ForegroundColor Green
Write-Host "  1. Create new token at: https://github.com/settings/tokens/new"
Write-Host "  2. Name: jeevan-ai-deploy"
Write-Host "  3. Scopes: repo, read:user, user:email"
Write-Host "  4. Copy the token"
Write-Host "  5. Push with token:"
Write-Host "     git push https://vedantkokane94-del:[YOUR_TOKEN]@github.com/vedantkokane94-del/jeevan-ai.git main"
Write-Host ""

Write-Host "========================================"
Write-Host ""
Write-Host "Code committed locally:" -ForegroundColor Green
git log --oneline -5
Write-Host ""
Write-Host "Ready to push when you complete the steps above!"
