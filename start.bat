@echo off
echo Starting CoDexa Development Environment...
echo.
echo Opening 2 terminals:
echo   1. Inngest Dev Server
echo   2. Next.js Dev Server
echo.

start "Inngest Dev Server" cmd /k "npx inngest-cli@latest dev"
timeout /t 3 /nobreak > nul
start "Next.js Dev Server" cmd /k "npm run dev"

echo.
echo Servers starting in separate windows...
echo Close those windows to stop the servers.
echo.
pause
