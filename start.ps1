# Script para iniciar Frontend + Backend
# Uso: .\start.ps1

Write-Host "=== LegionChess Iniciando ===" -ForegroundColor Cyan

# Abrir 2 terminais: um para backend, outro para frontend

# Terminal 1: Backend
$backendPath = "$PSScriptRoot\backend"
$pythonExe = "C:\Users\carlu\Desktop\legion-chess-site\.venv\Scripts\python.exe"
$backend = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; & '$pythonExe' app.py" -PassThru
Write-Host "[OK] Backend iniciado (PID: $($backend.Id))" -ForegroundColor Green

# Aguardar um pouco para o backend subir
Start-Sleep -Seconds 3

# Terminal 2: Frontend (Vite dev server)
$frontendPath = "$PSScriptRoot"
$frontend = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -PassThru
Write-Host "[OK] Frontend iniciado (PID: $($frontend.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "=== Ambos iniciados ===" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Feche os terminais para parar (ou pressione Ctrl+C)" -ForegroundColor Gray
