#!/usr/bin/env pwsh
# Git Auto-Commit Workflow for location-system
# Purpose: Automatic single-line commits as changes are made
# Usage: Run this script after making code changes

param(
    [string]$CommitMessage = "",
    [string]$Type = "feat",      # feat, fix, docs, refactor, test, chore
    [string]$Scope = "",          # Optional scope (e.g., "mobile-app", "web-app")
    [string]$Description = ""     # Concise description of change
)

$ProjectRoot = Split-Path -Parent $PSCommandPath

# Ensure we're in the project root
Set-Location $ProjectRoot

# Check if message provided
if (-not $CommitMessage -and -not $Description) {
    Write-Host "❌ Error: Commit message or description required" -ForegroundColor Red
    Write-Host ""
    Write-Host "Usage Examples:" -ForegroundColor Yellow
    Write-Host "  .\auto-commit.ps1 -CommitMessage 'Add budget allocation module'"
    Write-Host "  .\auto-commit.ps1 -Type 'fix' -Scope 'mobile-app' -Description 'Resolve flag image loading issue'"
    Write-Host ""
    exit 1
}

# Build commit message if using Type/Scope/Description
if ($Type -and $Description) {
    if ($Scope) {
        $CommitMessage = "$Type($Scope): $Description"
    } else {
        $CommitMessage = "$Type: $Description"
    }
} elseif (-not $CommitMessage -and $Description) {
    $CommitMessage = $Description
}

# Check for unstaged changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
    exit 0
}

# Show what will be committed
Write-Host ""
Write-Host "📋 Changes to commit:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Stage all changes
Write-Host "📦 Staging changes..." -ForegroundColor Yellow
git add -A

# Create commit with exactly one-line message
Write-Host "💾 Committing..." -ForegroundColor Yellow
git commit -m $CommitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit successful!" -ForegroundColor Green
    Write-Host "📝 Message: $CommitMessage" -ForegroundColor Green
    Write-Host ""
    git log -1 --oneline
} else {
    Write-Host "❌ Commit failed" -ForegroundColor Red
    exit 1
}
