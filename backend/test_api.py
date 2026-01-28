import requests
import json

# Testar endpoint de ranking
url = 'http://localhost:5000/api/ranking/blitz'

try:
    response = requests.get(url, timeout=5)
    if response.ok:
        data = response.json()
        print(f"Total de jogadores: {data['total_jogadores']}")
        
        if data['jogadores']:
            jogador = data['jogadores'][0]
            print(f"\nPrimeiro jogador:")
            print(f"  Nome: {jogador['nome']}")
            print(f"  Discord ID: {jogador['id_discord']}")
            print(f"  Avatar URL: {jogador['avatar_url']}")
            print(f"  Rating: {jogador['rating']}")
    else:
        print(f"Erro na API: {response.status_code}")
except Exception as e:
    print(f"Erro ao conectar: {e}")
