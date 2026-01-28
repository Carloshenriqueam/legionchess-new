#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para testar a integração Portal + Bot
Executa antes de rodar o app.py
"""

import sqlite3
import json
from pathlib import Path

DB_PATH = r'C:\Users\carlu\legion-chess-bot\legion_chess.db'

def test_database():
    """Testa conexão e exibe dados do banco"""
    print("\n" + "="*50)
    print("🧪 TESTE DE INTEGRAÇÃO")
    print("="*50 + "\n")
    
    # Verificar se banco existe
    if not Path(DB_PATH).exists():
        print(f"❌ Banco não encontrado: {DB_PATH}")
        return False
    
    print(f"✅ Banco encontrado: {DB_PATH}")
    
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Contar jogadores
        cursor.execute('SELECT COUNT(*) FROM players')
        total_players = cursor.fetchone()[0]
        print(f"✅ Total de jogadores: {total_players}")
        
        # Buscar um jogador
        cursor.execute('SELECT * FROM players LIMIT 1')
        player = cursor.fetchone()
        
        if player:
            player_dict = dict(player)
            print(f"\n📊 Exemplo de jogador:")
            print(f"   Nome: {player_dict['discord_username']}")
            print(f"   Discord ID: {player_dict['discord_id']}")
            print(f"   Rating Blitz: {player_dict['rating_blitz']}")
            print(f"   Rating Bullet: {player_dict['rating_bullet']}")
            
        # Contar partidas
        cursor.execute('SELECT COUNT(*) FROM game_history')
        total_games = cursor.fetchone()[0]
        print(f"\n✅ Total de partidas registradas: {total_games}")
        
        # Contar desafios
        cursor.execute('SELECT COUNT(*) FROM challenges')
        total_challenges = cursor.fetchone()[0]
        print(f"✅ Total de desafios: {total_challenges}")
        
        conn.close()
        
        print("\n" + "="*50)
        print("✅ TESTE PASSOU! Seu banco está pronto.")
        print("="*50 + "\n")
        
        print("📝 Próximos passos:")
        print("   1. Execute: python app.py")
        print("   2. Abra: http://localhost:5000/api/health")
        print("   3. Abra seu portal: index.html")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Erro ao acessar banco: {e}")
        return False

if __name__ == '__main__':
    success = test_database()
    exit(0 if success else 1)
