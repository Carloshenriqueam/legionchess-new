# Script para iniciar o backend a partir do diretório correto

$python_executable = "C:\Users\carlu\legion-chess-bot\venv\Scripts\python.exe"
$backend_script = "c:\Users\carlu\Desktop\legionchess-new\backend\app.py"

Write-Host "Iniciando o servidor backend..." -ForegroundColor Yellow
Write-Host "Executando: $python_executable $backend_script"

# Executa o script do backend
& $python_executable $backend_script