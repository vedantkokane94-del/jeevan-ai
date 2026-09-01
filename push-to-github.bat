@echo off
REM JEEVAN AI - GitHub Push Setup Script
REM Run this file to push your code to GitHub

cd /d c:\jeevan-ai-main

echo.
echo ========================================
echo JEEVAN AI - GitHub Push Setup
echo ========================================
echo.
echo Setting up Git configuration...
git config --global user.name "vedantkokane94-del"
git config --global user.email "vedantkokane94@gmail.com"

echo.
echo Checking git status...
git status

echo.
echo ========================================
echo INSTRUCTIONS:
echo ========================================
echo.
echo IMPORTANT: The current repository URL might not have proper permissions.
echo.
echo Choose ONE of these options:
echo.
echo OPTION 1: Create a new repository
echo ---------------------
echo 1. Go to: https://github.com/new
echo 2. Repository name: jeevan-ai
echo 3. Make it PUBLIC (unless you want it private)
echo 4. Click "Create repository"
echo 5. Copy the repository URL shown
echo 6. Then run these commands in PowerShell:
echo.
echo    cd c:\jeevan-ai-main
echo    git remote set-url origin [PASTE YOUR NEW URL HERE]
echo    git push -u origin main
echo.
echo OPTION 2: Use SSH (more secure)
echo ---------------------
echo 1. Run in PowerShell:
echo.
echo    ssh-keygen -t ed25519 -C "vedantkokane94@gmail.com"
echo.
echo 2. Add the public key to: https://github.com/settings/keys
echo 3. Then run:
echo.
echo    cd c:\jeevan-ai-main
echo    git remote set-url origin git@github.com:vedantkokane94-del/jeevan-ai.git
echo    git push -u origin main
echo.
echo OPTION 3: Use Personal Access Token
echo ---------------------
echo 1. Go to: https://github.com/settings/tokens/new
echo 2. Create token with 'repo' and 'read:user' scopes
echo 3. Copy the token
echo 4. Run in PowerShell:
echo.
echo    cd c:\jeevan-ai-main
echo    git push https://[YOUR_USERNAME]:[YOUR_TOKEN]@github.com/[YOUR_USERNAME]/jeevan-ai.git main
echo.
echo ========================================
echo.
pause
