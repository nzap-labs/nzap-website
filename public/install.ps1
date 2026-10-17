# ==============================================================================
# NZAP Engine — Windows PowerShell Installer (https://nzap.in/install.ps1)
# Usage: irm https://nzap.in/install.ps1 | iex
# ==============================================================================

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$ReleasesRepo = "nzap-labs/nzap-engine-releases"
$Headers = @{ "Accept" = "application/vnd.github+json"; "User-Agent" = "nzap-installer" }

Write-Host ""
Write-Host "NZAP Engine Installer " -NoNewline -ForegroundColor White
Write-Host "— One-click AI on your own Colab GPUs" -ForegroundColor DarkGray
Write-Host ""

Write-Host "==> " -NoNewline -ForegroundColor Green
Write-Host "Checking latest NZAP Engine release..."

try {
  $Release = Invoke-RestMethod -Uri "https://api.github.com/repos/$ReleasesRepo/releases/latest" -Headers $Headers
} catch {
  $AllReleases = Invoke-RestMethod -Uri "https://api.github.com/repos/$ReleasesRepo/releases" -Headers $Headers
  $Release = $AllReleases | Select-Object -First 1
}

if (-not $Release) {
  throw "Could not find a release in $ReleasesRepo. Visit https://github.com/$ReleasesRepo/releases"
}

$Asset = $Release.assets | Where-Object { $_.name -like "*-setup.exe" } | Select-Object -First 1
if (-not $Asset) {
  $Asset = $Release.assets | Where-Object { $_.name -like "*.msi" } | Select-Object -First 1
}
if (-not $Asset) {
  throw "Could not find a Windows installer in release $($Release.tag_name)."
}

$InstallerPath = Join-Path $env:TEMP $Asset.name
Write-Host "==> " -NoNewline -ForegroundColor Green
Write-Host "Downloading $($Asset.name) ($($Release.tag_name))..."

Invoke-WebRequest -Uri $Asset.browser_download_url -OutFile $InstallerPath -UseBasicParsing

Write-Host "==> " -NoNewline -ForegroundColor Green
Write-Host "Installing NZAP Engine for current user..."

if ($Asset.name -like "*.msi") {
  Start-Process msiexec.exe -ArgumentList "/i `"$InstallerPath`" /qb" -Wait
} else {
  Start-Process -FilePath $InstallerPath -ArgumentList "/S" -Wait
}

Remove-Item $InstallerPath -Force -ErrorAction SilentlyContinue

$CandidatePaths = @(
  "$env:LOCALAPPDATA\Programs\NZAP Engine\NZAP Engine.exe",
  "$env:LOCALAPPDATA\Programs\NZAP Engine\nzap-engine.exe",
  "$env:LOCALAPPDATA\NZAP Engine\NZAP Engine.exe",
  "$env:ProgramFiles\NZAP Engine\NZAP Engine.exe"
)
$ExePath = $CandidatePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $ExePath) {
  $ExePath = "$env:LOCALAPPDATA\Programs\NZAP Engine\nzap-engine.exe"
}

if ((Get-Command claude -ErrorAction SilentlyContinue) -and ($env:NZAP_SKIP_MCP -ne "1")) {
  Write-Host "==> " -NoNewline -ForegroundColor Green
  Write-Host "Detected Claude Code CLI — registering NZAP Engine MCP server..."
  try {
    & claude mcp add --scope user nzap -- "$ExePath" mcp 2>$null
  } catch {}
}

Write-Host ""
Write-Host "✓ NZAP Engine ($($Release.tag_name)) is installed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Open NZAP Engine from the Start Menu and click 'Connect Google' once."
Write-Host "  2. Connect your AI coding agent (Claude Code, Cursor, Windsurf, Antigravity):"
Write-Host "     claude mcp add --scope user nzap -- `"$ExePath`" mcp" -ForegroundColor Cyan
Write-Host ""

