@echo off
REM ============================================================================
REM NZAP Engine — Windows Command Prompt Installer (https://nzap.in/install.cmd)
REM Usage: curl -fsSL https://nzap.in/install.cmd -o "%TEMP%\nzap.cmd" && "%TEMP%\nzap.cmd"
REM ============================================================================
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm https://nzap.in/install.ps1 | iex"
exit /b %ERRORLEVEL%

