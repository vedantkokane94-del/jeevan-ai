$ErrorActionPreference = "Stop"
$env:GIT_PAGER = "cat"
$env:GIT_ASKPASS = "echo" # Prevent any interactive prompts

Write-Host "Adding files..."
git add -A

Write-Host "Committing..."
git commit -m "feat: complete UI/UX redesign (Waves 1-6)"

Write-Host "Pushing..."
git push
