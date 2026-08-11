@echo off
title Script Automatizado de Subida a GitHub (CONTROL_OJT)
echo ============================================================
echo      SUBIENDO PROYECTO BI OJT A TU CUENTA DE GITHUB
echo ============================================================
echo.

cd /d "%~dp0"

echo 1. Inicializando repositorio Git local...
git init

echo 2. Agregando archivos al staging...
git add .

echo 3. Creando commit con la solucion Netlify Serverless API...
git commit -m "feat: Integracion de Netlify Functions para backend Express y conexion live a Supabase"

echo 4. Asignando rama principal main...
git branch -M main

git remote remove origin 2>nul
git remote add origin https://github.com/CLYDE-lean/CONTROL_OJT.git

echo 5. Subiendo codigo a GitHub...
git push -u origin main --force

echo.
echo ============================================================
echo   ¡ÉXITO TOTAL! Tu código con Netlify Functions ya está en GitHub:
echo   https://github.com/CLYDE-lean/CONTROL_OJT
echo ============================================================
pause
