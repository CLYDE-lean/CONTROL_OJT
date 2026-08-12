@echo off
title Script Automatizado de Subida a GitHub (CONTROL_OJT)
echo ============================================================
echo      SUBIENDO PROYECTO BI OJT A TU CUENTA DE GITHUB
echo ============================================================
echo.

cd /d "%~dp0"

echo 1. Asegurando configuracion de usuario Git...
git config user.email "clyde@example.com"
git config user.name "CLYDE-lean"

echo 2. Inicializando repositorio Git...
git init

echo 3. Agregando cambios al staging...
git add .

echo 4. Creando commit con mejoras visuales y backend...
git commit -m "feat: Embudo OJT Stacked Bars de 3 estados, leyenda interactiva, auditoria OJT real y fix de tooltips"

echo 5. Configurando rama main y remoto origin...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/CLYDE-lean/CONTROL_OJT.git

echo 6. Enviando codigo a GitHub...
git push -u origin main --force

echo.
echo ============================================================
echo   ¡ÉXITO TOTAL! Tu código actualizado ya está en GitHub:
echo   https://github.com/CLYDE-lean/CONTROL_OJT
echo ============================================================
pause
