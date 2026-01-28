import requests

# Testar endpoint proxy de avatar
try:
    r = requests.get('http://localhost:5000/api/avatar/675456337706090506', timeout=5)
    print(f'Status: {r.status_code}')
    print(f'Content-Type: {r.headers.get("content-type")}')
    print(f'Content-Length: {len(r.content)} bytes')
    if r.ok:
        print('Avatar proxy funcionando!')
    else:
        print(f'Erro: {r.text}')
except Exception as e:
    print(f'Erro ao conectar: {e}')
