import requests

# Testar ranking blitz
r = requests.get('http://localhost:5000/api/ranking/blitz')
data = r.json()

print(f"Total de jogadores: {data['total_jogadores']}\n")

for j in data['jogadores']:
    print(f"#{j['rank']} - {j['nome']}")
    print(f"    Rating: {j['rating']}")
    print(f"    Discord ID: {j['id_discord']}")
    print(f"    Avatar URL: {j['avatar_url']}")
    print()
