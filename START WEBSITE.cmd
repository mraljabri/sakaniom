@echo off
title SakaniOM - Starting...
color 0A

echo.
echo  =========================================
echo    SakaniOM - Oman Apartment Rentals
echo  =========================================
echo.

:: Set Node.js on PATH
set PATH=C:\Program Files\nodejs;%PATH%

:: Check Node is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: Node.js not found.
    echo  Please make sure Node.js is installed.
    pause
    exit /b 1
)

echo  [1/2] Starting backend API server...
start "SakaniOM Backend" /min cmd /c "cd /d "%~dp0backend" && node server.js"

:: Wait a moment for backend to initialise
timeout /t 2 /nobreak >nul

echo  [2/2] Starting frontend...
start "SakaniOM Frontend" /min cmd /c "cd /d "%~dp0frontend" && "C:\Program Files\nodejs\npm.cmd" run dev"

:: Wait for Vite to boot
timeout /t 4 /nobreak >nul

echo.
echo  =========================================
echo   Website is ready!
echo   Open your browser and go to:
echo.
echo      http://localhost:5173
echo.
echo   Keep this window open while using
echo   the site. Close it to shut down.
echo  =========================================
echo.

:: Open browser automatically
start "" "http://localhost:5173"

echo  Press any key to STOP the website...
pause >nul

:: Kill both servers on exit
echo.
echo  Shutting down servers...
taskkill /FI "WINDOWTITLE eq SakaniOM Backend" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq SakaniOM Frontend" /F >nul 2>&1
echo  Done. Goodbye!
timeout /t 2 /nobreak >nul
