# run-health-app-fixes.ps1 - Family Health Track v2.4.9 + v2.4.10 + v2.4.11 in one run
# ============================================================================
# How to use:
#   1. Copy this file + fix-health-app-v2.4.9.cjs + fix-health-app-v2.4.10.cjs
#      + fix-health-app-v2.4.11.cjs (4 files) into the project root
#      (the folder with package.json).
#   2. In the VS Code Terminal (PowerShell) run:
#        powershell -ExecutionPolicy Bypass -File .\run-health-app-fixes.ps1
#   3. The three scripts run in order (2.4.9 -> 2.4.10 -> 2.4.11).
#      If one fails, this script stops there. Run it again later and the
#      steps that already succeeded will be skipped ("Already applied").
# Time: each script runs npm install + typecheck + tests + build, so the
# whole run can take a few minutes.
# NOTE: this file is English-only on purpose. Windows PowerShell 5.1 reads
# a script file as ANSI when it has no BOM, which corrupts non-English
# text and breaks parsing. Node.js reads the .cjs files as UTF-8, so the
# Burmese text inside them is fine.
# ============================================================================

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host 'Family Health Track - v2.4.9 + v2.4.10 + v2.4.11 (one run)' -ForegroundColor Cyan
Write-Host ''

# 1. Check node is available
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host '[ERROR] node was not found. Please make sure Node.js is installed.' -ForegroundColor Red
  exit 1
}

# 2. Check we are in the project root
if (-not (Test-Path '.\package.json')) {
  Write-Host '[ERROR] package.json was not found. Run this script from the project root (the folder with package.json).' -ForegroundColor Red
  exit 1
}

# 3. Check all three fix scripts are present
$scripts = @('fix-health-app-v2.4.9.cjs', 'fix-health-app-v2.4.10.cjs', 'fix-health-app-v2.4.11.cjs')
foreach ($s in $scripts) {
  if (-not (Test-Path ".\$s")) {
    Write-Host "[ERROR] $s was not found. Copy all three .cjs files into the project root." -ForegroundColor Red
    exit 1
  }
}

# 4. Run them in order - stop at the first failure
foreach ($s in $scripts) {
  Write-Host ''
  Write-Host "========== $s ==========" -ForegroundColor Yellow
  node ".\$s"
  if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host "[STOP] $s did not succeed (exit code $LASTEXITCODE)." -ForegroundColor Red
    Write-Host 'Read the error above, fix it, then run this script again.' -ForegroundColor Yellow
    Write-Host 'Note: steps that already succeeded will be skipped ("Already applied").' -ForegroundColor Yellow
    exit 1
  }
}

Write-Host ''
Write-Host '[DONE] v2.4.9 + v2.4.10 + v2.4.11 all succeeded.' -ForegroundColor Green
Write-Host ''
Write-Host 'NEXT STEPS (these cannot be done by the script):'
Write-Host '  1. Firebase Console > Firestore Database > Rules: publish the new firestore.rules'
Write-Host '     (v2.4.10 changed the rules - without this, family records, admin add-user and Q&A notifications will not work)'
Write-Host '  2. git add -A / git commit / git push (Cloudflare will auto-deploy)'
Write-Host '  3. On your phone, hard-refresh with Ctrl+Shift+R and check Version History shows v2.4.11'
