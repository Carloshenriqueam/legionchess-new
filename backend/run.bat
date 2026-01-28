@echo off
REM Script para iniciar o backend do Portal de Xadrez

cd /d C:\Users\carlu\Desktop\legion-chess-site\backend

echo.
echo ========================================
echo  Portal de Xadrez - Backend Flask
echo ========================================
echo.

REM Usar Python do venv do bot
set PYTHON="C:\Users\carlu\legion-chess-bot\venv\Scripts\python.exe"

echo [*] Iniciando servidor...
echo.

%PYTHON% app.py

pause
