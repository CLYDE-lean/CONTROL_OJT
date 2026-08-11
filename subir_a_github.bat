@echo off
title Script Automatizado de Subida a GitHub (CONTROL_OJT)
echo ============================================================
echo      SUBIENDO PROYECTO BI OJT A TU CUENTA DE GITHUB
echo ============================================================
echo.

cd /d "%~dp0"

echo 1. Inicializando repositorio Git local...
git init

echo 2. Agregando archivos al staging (excluyendo node_modules y credenciales .env)...
git add .

echo 3. Creando el commit con tu codigo completo...
git commit -m "feat: Portal BI Control Operativo OJT completo"

echo 4. Asignando rama principal main...
git branch -M main

echo.
echo ============================================================
echo CONECTANDO CON TU REPOSITORIO EN GITHUB:
echo URL: https://github.com/CLYDE-lean/CONTROL_OJT.git
echo ============================================================
echo.

git remote remove origin 2>nul
git remote add origin https://github.com/CLYDE-lean/CONTROL_OJT.git

echo 5. Subiendo codigo local a GitHub (reemplazando iniciales)...
git push -u origin main --force

echo.
echo ============================================================
echo   ¡ÉXITO TOTAL! Tu código ya se encuentra subido en:
echo   https://github.com/CLYDE-lean/CONTROL_OJT
echo.
echo   Ahora ve a Netlify (app.netlify.com) para seleccionar
echo   el repositorio CONTROL_OJT y desplegar tu proyecto.
echo ============================================================
pause
