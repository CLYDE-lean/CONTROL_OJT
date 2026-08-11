@echo off
title Portal BI Control Operativo OJT de 5 Días
echo ============================================================
echo   INICIANDO PORTAL BI CONTROL OPERATIVO OJT (5 DÍAS BASE)
echo ============================================================
echo.

echo 0. Liberando puerto 3001 si estaba ocupado por una instancia previa...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

echo.
echo 1. Instalando dependencias del Backend...
cd /d "%~dp0backend"
call npm install

echo.
echo 2. Instalando dependencias del Frontend...
cd /d "%~dp0frontend"
call npm install

echo.
echo 3. Iniciando Servidor Backend en puerto 3001...
start "Backend OJT API" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo.
echo 4. Iniciando Servidor Frontend Vite en puerto 3000...
start "Frontend OJT UI" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ============================================================
echo   SISTEMA LISTO. Abre tu navegador en: http://localhost:3000
echo ============================================================
pause
