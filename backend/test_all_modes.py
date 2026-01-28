import requests

# Testar todos os modos
modes = ['bullet', 'blitz', 'rapid', 'classic']

for mode in modes:
    r = requests.get(f'http://localhost:5000/api/ranking/{mode}')
    data = r.json()
    
    print(f"\n{mode.upper()}:")
    print(f"  Total: {data['total_jogadores']}")
    
    for j in data['jogadores']:
        print(f"    #{j['rank']} - {j['nome']} (Rating: {j['rating']})")
