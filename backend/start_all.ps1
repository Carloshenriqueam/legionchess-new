#!/usr/bin/env powershell
# Script para iniciar Backend + Portal

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Portal de Xadrez - Iniciador         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$python_path = "C:\Users\carlu\legion-chess-bot\venv\Scripts\python.exe"
$backend_path = "C:\Users\carlu\Desktop\legion-chess-site\backend"
$portal_path = "C:\Users\carlu\Desktop\legion-chess-site\index.html"

Write-Host "[1/3] Verificando banco de dados..." -ForegroundColor Yellow
& $python_path "$backend_path\check_data.py"

Write-Host ""
Write-Host "[2/3] Iniciando backend em http://localhost:5000" -ForegroundColor Yellow
Write-Host ""

Set-Location $backend_path
& $python_path app.py

Write-Host ""
Write-Host "[3/3] Abra o portal:" -ForegroundColor Green
Write-Host "      file:///$portal_path" -ForegroundColor Cyan
Write-Host ""
