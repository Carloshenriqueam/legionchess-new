"""
Configuração centralizada para o Backend
Facilita alterações sem editar app.py
"""

import os
from pathlib import Path

# ==========================================
# CONFIGURAÇÕES PRINCIPAIS
# ==========================================

# Caminho do banco de dados
BOT_PATH = r"C:\Users\carlu\legion-chess-bot"
DB_PATH = os.path.join(BOT_PATH, 'legion_chess.db')

# Configurações do servidor Flask
FLASK_HOST = '0.0.0.0'  # Aceita conexões de qualquer IP
FLASK_PORT = 5000
FLASK_DEBUG = True  # Mude para False em produção

# Configuração de CORS
CORS_ORIGINS = [
    'http://localhost:*',
    'http://127.0.0.1:*',
    'http://localhost:8000',  # Se abrir via servidor local
]

# ==========================================
# MODO DE OPERAÇÃO
# ==========================================

# True = Usar dados reais do banco
# False = Usar dados simulados (para testes sem banco)
USE_REAL_DATABASE = True

# ==========================================
# LOGGING
# ==========================================

LOG_LEVEL = 'DEBUG'  # DEBUG, INFO, WARNING, ERROR
LOG_FILE = None  # None = não salvar em arquivo
                 # ou 'app.log' = salvar aqui

# ==========================================
# CACHE (Próxima versão)
# ==========================================

CACHE_ENABLED = False
CACHE_TIMEOUT = 300  # 5 minutos em segundos

# ==========================================
# SEGURANÇA (Próxima versão)
# ==========================================

# Ativar autenticação
AUTH_ENABLED = False
API_KEY = 'sua-chave-secreta'

# Rate limiting
RATE_LIMIT_ENABLED = False
RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_PERIOD = 3600  # 1 hora em segundos

# ==========================================
# VALIDAÇÃO
# ==========================================

def validate_config():
    """Valida se as configurações estão corretas"""
    issues = []
    
    # Verificar se banco existe
    if USE_REAL_DATABASE and not Path(DB_PATH).exists():
        issues.append(f"⚠️  Banco não encontrado: {DB_PATH}")
    
    # Verificar porta
    if FLASK_PORT < 1024:
        issues.append(f"⚠️  Porta {FLASK_PORT} é reservada. Use porta >= 1024")
    
    # Avisos de produção
    if FLASK_DEBUG:
        issues.append("⚠️  Debug mode ativado. Desative em produção!")
    
    return issues

if __name__ == '__main__':
    print("✅ Configuração do Backend")
    print(f"   Banco: {DB_PATH}")
    print(f"   Host: {FLASK_HOST}:{FLASK_PORT}")
    print(f"   Debug: {FLASK_DEBUG}")
    
    issues = validate_config()
    if issues:
        print("\n⚠️  Avisos:")
        for issue in issues:
            print(f"   {issue}")
    else:
        print("\n✅ Tudo OK!")
