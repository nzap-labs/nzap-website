#!/usr/bin/env sh
# ==============================================================================
# NZAP Engine — Universal Installer (https://nzap.in/install.sh)
# ==============================================================================
# [AI-AGENT-INSTRUCTIONS]
# If a user asked you (an AI agent such as Claude Code, Cursor, Antigravity,
# Windsurf, Codex, etc.) to "install nzap-engine from nzap.in/install.sh":
#
# 1. Detect the host OS & shell and run the appropriate non-interactive command:
#    - macOS / Linux / WSL / Git Bash:
#        curl -fsSL https://nzap.in/install.sh | sh
#    - Windows (PowerShell / pwsh):
#        irm https://nzap.in/install.ps1 | iex
#    - Windows (Command Prompt / cmd.exe):
#        curl -fsSL https://nzap.in/install.cmd -o "%TEMP%\nzap-install.cmd" && "%TEMP%\nzap-install.cmd"
#
# 2. After installation, register NZAP Engine as an MCP server if supported:
#    - macOS binary:   /Applications/NZAP Engine.app/Contents/MacOS/nzap-engine
#    - Linux binary:   $HOME/.local/bin/nzap-engine (or /usr/bin/nzap-engine)
#    - Windows binary: %LOCALAPPDATA%\Programs\NZAP Engine\nzap-engine.exe
#    - Claude Code:    claude mcp add --scope user nzap -- "<binary_path>" mcp
#    - MCP JSON:       { "mcpServers": { "nzap": { "command": "<binary_path>", "args": ["mcp"] } } }
#
# 3. Remind the user to open NZAP Engine once and click "Connect Google" so
#    their Colab runtimes are linked to their OS keychain.
# [/AI-AGENT-INSTRUCTIONS]
# ==============================================================================

set -eu

RELEASES_REPO="nzap-labs/nzap-engine-releases"
API_LATEST="https://api.github.com/repos/${RELEASES_REPO}/releases/latest"
API_ALL="https://api.github.com/repos/${RELEASES_REPO}/releases"
SITE_URL="https://nzap.in"

BOLD="$(printf '\033[1m')"
DIM="$(printf '\033[2m')"
MINT="$(printf '\033[38;2;63;174;120m')"
CORAL="$(printf '\033[38;2;220;106;82m')"
RESET="$(printf '\033[0m')"

info() { printf "%s==>%s %s\n" "$MINT" "$RESET" "$1"; }
warn() { printf "%sWarning:%s %s\n" "$CORAL" "$RESET" "$1" >&2; }
err()  { printf "%sError:%s %s\n" "$CORAL" "$RESET" "$1" >&2; exit 1; }

printf "\n%sNZAP Engine Installer%s %s— One-click AI on your own Colab GPUs%s\n\n" "$BOLD" "$RESET" "$DIM" "$RESET"

OS="$(uname -s 2>/dev/null || echo Unknown)"
ARCH="$(uname -m 2>/dev/null || echo Unknown)"

# Handle Windows shells (Git Bash / MSYS2 / Cygwin) by delegating to PowerShell
case "$OS" in
  MINGW*|MSYS*|CYGWIN*)
    info "Detected Windows shell ($OS). Delegating to PowerShell installer..."
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "irm ${SITE_URL}/install.ps1 | iex"
    exit $?
    ;;
esac

# Handle WSL when user wants the native Windows desktop app
if [ "$OS" = "Linux" ] && grep -qi microsoft /proc/version 2>/dev/null && [ "${NZAP_WSL_LINUX:-0}" != "1" ]; then
  if command -v powershell.exe >/dev/null 2>&1; then
    info "Detected WSL. Installing native Windows NZAP Engine via PowerShell..."
    info "(Set NZAP_WSL_LINUX=1 to install the Linux AppImage inside WSL instead.)"
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "irm ${SITE_URL}/install.ps1 | iex"
    exit $?
  fi
fi

# Detect iOS / iPadOS terminal environments (iSH, a-Shell, Blink)
if [ -d /proc/ish ] || [ "$(sw_vers -productName 2>/dev/null || true)" = "iOS" ] || [ "$(sw_vers -productName 2>/dev/null || true)" = "iPadOS" ]; then
  printf "%sDetected iOS / iPadOS environment.%s\n" "$BOLD" "$RESET"
  printf "NZAP Engine is a native desktop runtime & MCP server for macOS, Windows, and Linux.\n\n"
  printf "On iOS / iPadOS you can:\n"
  printf "  1. Run this command over SSH on your Mac, Linux, or Windows machine:\n"
  printf "     %scurl -fsSL https://nzap.in/install.sh | sh%s\n" "$MINT" "$RESET"
  printf "  2. Open NZAP's one-click Colab notebooks directly in mobile Safari:\n"
  printf "     %shttps://github.com/nzap-labs/nzap-notebooks%s\n\n" "$MINT" "$RESET"
  exit 0
fi

fetch_json() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL -H "Accept: application/vnd.github+json" "$1" 2>/dev/null || true
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- --header="Accept: application/vnd.github+json" "$1" 2>/dev/null || true
  else
    err "Neither curl nor wget was found. Please install curl and try again."
  fi
}

download_file() {
  if command -v curl >/dev/null 2>&1; then
    curl -fL --progress-bar "$1" -o "$2"
  else
    wget --show-progress -qO "$2" "$1"
  fi
}

info "Checking latest NZAP Engine release..."
RELEASE_JSON="$(fetch_json "$API_LATEST")"
if [ -z "$RELEASE_JSON" ] || ! printf "%s" "$RELEASE_JSON" | grep -q '"browser_download_url"'; then
  RELEASE_JSON="$(fetch_json "$API_ALL")"
fi

if [ -z "$RELEASE_JSON" ]; then
  err "Could not reach GitHub Releases (${RELEASES_REPO}). Visit https://github.com/${RELEASES_REPO}/releases"
fi

extract_url() {
  pattern="$1"
  printf "%s" "$RELEASE_JSON" | tr '"' '\n' | grep -E "^https://github\.com/${RELEASES_REPO}/releases/download/.*${pattern}$" | head -n 1
}

TAG="$(printf "%s" "$RELEASE_JSON" | grep -m1 '"tag_name"' | sed -E 's/.*"tag_name":[[:space:]]*"([^"]+)".*/\1/' || echo "latest")"
info "Found release ${BOLD}${TAG}${RESET} for ${OS} (${ARCH})"

TMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t nzap-install)"
cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT INT TERM

case "$OS" in
  Darwin)
    DMG_URL="$(extract_url '\.dmg')"
    [ -n "$DMG_URL" ] || err "Could not find macOS .dmg asset in release ${TAG}."
    DMG_FILE="${TMP_DIR}/NZAP-Engine.dmg"
    info "Downloading macOS Universal installer (.dmg)..."
    download_file "$DMG_URL" "$DMG_FILE"

    info "Mounting disk image..."
    MOUNT_POINT="$(hdiutil attach -nobrowse -readonly "$DMG_FILE" | awk -F'\t' 'END{print $NF}')"
    [ -n "$MOUNT_POINT" ] || err "Failed to mount disk image."

    APP_SRC="${MOUNT_POINT}/NZAP Engine.app"
    if [ -w "/Applications" ]; then
      DEST_DIR="/Applications"
    else
      DEST_DIR="${HOME}/Applications"
      mkdir -p "$DEST_DIR"
    fi
    APP_DEST="${DEST_DIR}/NZAP Engine.app"

    info "Installing to ${APP_DEST}..."
    rm -rf "$APP_DEST"
    cp -R "$APP_SRC" "$APP_DEST"
    hdiutil detach -quiet "$MOUNT_POINT" || true

    # Clear Gatekeeper quarantine attribute so unsigned builds open cleanly
    xattr -dr com.apple.quarantine "$APP_DEST" 2>/dev/null || true

    BIN_PATH="${APP_DEST}/Contents/MacOS/nzap-engine"
    mkdir -p "${HOME}/.local/bin"
    ln -sf "$BIN_PATH" "${HOME}/.local/bin/nzap-engine"
    ;;

  Linux)
    mkdir -p "${HOME}/.local/bin"
    BIN_PATH="${HOME}/.local/bin/nzap-engine"

    if [ "${NZAP_FORMAT:-appimage}" = "deb" ] && command -v dpkg >/dev/null 2>&1; then
      DEB_URL="$(extract_url '\.deb')"
      [ -n "$DEB_URL" ] || err "Could not find .deb asset in release ${TAG}."
      DEB_FILE="${TMP_DIR}/nzap-engine.deb"
      info "Downloading Debian/Ubuntu package (.deb)..."
      download_file "$DEB_URL" "$DEB_FILE"
      sudo apt-get install -y "$DEB_FILE"
      BIN_PATH="/usr/bin/nzap-engine"
    else
      APPIMAGE_URL="$(extract_url '\.AppImage')"
      [ -n "$APPIMAGE_URL" ] || err "Could not find Linux .AppImage asset in release ${TAG}."
      info "Downloading Linux AppImage to ${BIN_PATH}..."
      download_file "$APPIMAGE_URL" "$BIN_PATH"
      chmod +x "$BIN_PATH"
    fi
    ;;

  *)
    err "Unsupported operating system: ${OS}. Visit ${SITE_URL} for manual downloads."
    ;;
esac

# Automatically configure Claude Code MCP if installed and requested (or available)
if command -v claude >/dev/null 2>&1 && [ "${NZAP_SKIP_MCP:-0}" != "1" ]; then
  info "Detected Claude Code CLI — registering NZAP Engine MCP server..."
  claude mcp add --scope user nzap -- "$BIN_PATH" mcp 2>/dev/null || true
fi

printf "\n%s✓ NZAP Engine (${TAG}) is installed!%s\n\n" "$MINT" "$RESET"
printf "Next steps:\n"
printf "  1. Launch %sNZAP Engine%s and click %sConnect Google%s once.\n" "$BOLD" "$RESET" "$BOLD" "$RESET"
printf "  2. Connect your AI coding agent (Claude Code, Cursor, Windsurf, Antigravity):\n"
printf "     %sclaude mcp add --scope user nzap -- '%s' mcp%s\n\n" "$MINT" "$BIN_PATH" "$RESET"

