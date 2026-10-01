@echo off
chcp 65001 >nul
echo ============================================================
echo      SUBIENDO PROYECTO BI OJT A TU CUENTA DE GITHUB
echo ============================================================
echo.

cd /d "%~dp0"

echo 1. Verificando estado git...
git status -s

echo 2. Agregando archivos modificados...
git add -A

echo 3. Guardando commit...
git commit -m "fix: actualizar anon key y conexion oficial a control_ojt" 2>nul

echo 4. Enviando a GitHub (git push origin main)...
git push origin main

echo.
echo ============================================================
echo   PROCESO TERMINADO. Revisa la consola arriba.
echo ============================================================
pause
