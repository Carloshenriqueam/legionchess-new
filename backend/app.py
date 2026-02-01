"""
Backend Flask para integrar o Portal de Xadrez com a database do bot Discord.py
"""
import sqlite3
import json
import os
import sys
from datetime import datetime
from flask import Flask, jsonify, request, send_file, redirect
from flask_cors import CORS
from pathlib import Path
import requests
from io import BytesIO

# Configurar o caminho para importar o database.py do bot
BOT_PATH = r"C:\Users\carlu\legion-chess-bot"
sys.path.insert(0, BOT_PATH)

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend

# Caminho do banco de dados SQLite do bot
DB_PATH = os.path.join(BOT_PATH, 'legion_chess.db')

def get_db_connection():
    """Cria conexão com SQLite"""
    conn = sqlite3.connect(DB_PATH, timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Inicializa o banco de dados criando as tabelas necessárias"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Criar tabela players
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS players (
            discord_id TEXT PRIMARY KEY,
            discord_username TEXT NOT NULL,
            lichess_username TEXT,
            rating INTEGER DEFAULT 1200,
            rating_bullet INTEGER DEFAULT 1200,
            rating_blitz INTEGER DEFAULT 1200,
            rating_rapid INTEGER DEFAULT 1200,
            rating_classic INTEGER DEFAULT 1200,
            wins_bullet INTEGER DEFAULT 0,
            losses_bullet INTEGER DEFAULT 0,
            draws_bullet INTEGER DEFAULT 0,
            wins_blitz INTEGER DEFAULT 0,
            losses_blitz INTEGER DEFAULT 0,
            draws_blitz INTEGER DEFAULT 0,
            wins_rapid INTEGER DEFAULT 0,
            losses_rapid INTEGER DEFAULT 0,
            draws_rapid INTEGER DEFAULT 0,
            wins_classic INTEGER DEFAULT 0,
            losses_classic INTEGER DEFAULT 0,
            draws_classic INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            draws INTEGER DEFAULT 0,
            avatar_hash TEXT
        )
    ''')
    
    # Criar tabela swiss_tournaments
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS swiss_tournaments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'waiting',
            max_players INTEGER DEFAULT 16,
            current_round INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            started_at TIMESTAMP,
            finished_at TIMESTAMP
        )
    ''')
    
    # Criar tabela swiss_participants
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS swiss_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournament_id INTEGER,
            discord_id TEXT,
            rating INTEGER DEFAULT 1200,
            score REAL DEFAULT 0.0,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tournament_id) REFERENCES swiss_tournaments (id),
            FOREIGN KEY (discord_id) REFERENCES players (discord_id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print('[OK] Banco de dados inicializado com tabelas necessárias')

def dict_from_row(row):
    """Converte sqlite3.Row para dict"""
    return dict(row) if row else None

def get_avatar_url(discord_id, avatar_hash=None):
    """Retorna URL do avatar Discord do jogador"""
    # Se houver hash, usar a URL com hash
    if avatar_hash:
        return f"https://cdn.discordapp.com/avatars/{discord_id}/{avatar_hash}.png"
    # Caso contrário, usar um dos 5 avatares padrão do Discord
    else:
        default_avatar_id = int(discord_id) % 5
        return f"https://cdn.discordapp.com/embed/avatars/{default_avatar_id}.png"

@app.route('/api/ranking/<mode>', methods=['GET'])
def get_ranking(mode):
    """
    Retorna o ranking de um modo específico (bullet, blitz, rapid, classic)
    GET /api/ranking/blitz
    """
    valid_modes = ['bullet', 'blitz', 'rapid', 'classic']
    
    if mode not in valid_modes:
        return jsonify({'error': f'Modo inválido. Use: {", ".join(valid_modes)}'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscar todos os jogadores ordenados por rating do modo
        rating_col = f'rating_{mode}'
        wins_col = f'wins_{mode}'
        losses_col = f'losses_{mode}'
        draws_col = f'draws_{mode}'
        
        cursor.execute(f'''
            SELECT 
                discord_id,
                discord_username,
                lichess_username,
                {rating_col} as rating,
                {wins_col} as vitorias,
                {losses_col} as derrotas,
                {draws_col} as empates
            FROM players
            WHERE {rating_col} > 0 OR {wins_col} > 0 OR {losses_col} > 0 OR {draws_col} > 0
            ORDER BY {rating_col} DESC
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        jogadores = []
        for idx, row in enumerate(rows, 1):
            player_dict = dict(row)
            total_partidas = (player_dict['vitorias'] or 0) + (player_dict['derrotas'] or 0) + (player_dict['empates'] or 0)
            win_rate = 0
            if total_partidas > 0:
                win_rate = round((player_dict['vitorias'] or 0) / total_partidas * 100, 1)
            
            jogadores.append({
                'rank': idx,
                'id_discord': player_dict['discord_id'],
                'nome': player_dict['discord_username'],
                'lichess_username': player_dict['lichess_username'],
                'rating': player_dict['rating'] or 1200,
                'vitorias': player_dict['vitorias'] or 0,
                'derrotas': player_dict['derrotas'] or 0,
                'empates': player_dict['empates'] or 0,
                'partidas_jogadas': total_partidas,
                'win_rate': win_rate
            })
        
        return jsonify({
            'modo': mode,
            'ultimo_update': datetime.now().isoformat() + 'Z',
            'total_jogadores': len(jogadores),
            'jogadores': jogadores
        })
    
    except Exception as e:
        print(f'Erro ao buscar ranking: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/jogador/<discord_id>', methods=['GET'])
def get_jogador_detalhes(discord_id):
    """
    Retorna detalhes de um jogador específico com stats de todos os modos
    GET /api/jogador/123456789
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM players WHERE discord_id = ?
        ''', (discord_id,))
        
        player = cursor.fetchone()
        
        if not player:
            conn.close()
            return jsonify({'error': 'Jogador não encontrado'}), 404
        
        player_dict = dict(player)
        
        # Buscar histórico de partidas
        cursor.execute('''
            SELECT * FROM game_history
            WHERE player1_id = ? OR player2_id = ?
            ORDER BY played_at DESC
            LIMIT 20
        ''', (discord_id, discord_id))
        
        historico = [dict(row) for row in cursor.fetchall()]
        
        # Buscar achievements
        cursor.execute('''
            SELECT achievement_name, description, value, unlocked_at, achievement_type
            FROM achievements 
            WHERE player_id = ?
            ORDER BY unlocked_at DESC
        ''', (discord_id,))
        
        achievements = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        # Formatar resposta
        modes = ['bullet', 'blitz', 'rapid', 'classic']
        stats_por_modo = {}
        
        for mode in modes:
            rating_col = f'rating_{mode}'
            wins_col = f'wins_{mode}'
            losses_col = f'losses_{mode}'
            draws_col = f'draws_{mode}'
            
            vitorias = player_dict.get(wins_col, 0) or 0
            derrotas = player_dict.get(losses_col, 0) or 0
            empates = player_dict.get(draws_col, 0) or 0
            total = vitorias + derrotas + empates
            
            stats_por_modo[mode] = {
                'rating': player_dict.get(rating_col, 1200) or 1200,
                'vitorias': vitorias,
                'derrotas': derrotas,
                'empates': empates,
                'partidas_jogadas': total,
                'win_rate': round(vitorias / total * 100, 1) if total > 0 else 0
            }
        
        # Gerar URL do avatar via API proxy
        avatar_url = f'/api/avatar/{player_dict["discord_id"]}'  # Usar rota proxy da API
        
        return jsonify({
            'id_discord': player_dict['discord_id'],
            'nome': player_dict['discord_username'],
            'lichess_username': player_dict['lichess_username'],
            'avatar_url': avatar_url,
            'avatar_hash': player_dict.get('avatar_hash'),
            'estatisticas': stats_por_modo,
            'historico_recente': historico[:10],
            'achievements': achievements,
            'ultima_atualizacao': datetime.now().isoformat() + 'Z'
        })
    
    except Exception as e:
        print(f'Erro ao buscar jogador: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats-gerais', methods=['GET'])
def get_stats_gerais():
    """
    Retorna estatísticas gerais da comunidade
    GET /api/stats-gerais
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Total de jogadores
        cursor.execute('SELECT COUNT(*) as total FROM players')
        total_jogadores = cursor.fetchone()['total']
        
        # Total de partidas
        cursor.execute('SELECT COUNT(*) as total FROM game_history')
        total_partidas = cursor.fetchone()['total']
        
        # Top 5 jogadores por modo
        modes = ['bullet', 'blitz', 'rapid', 'classic']
        top_por_modo = {}
        
        for mode in modes:
            rating_col = f'rating_{mode}'
            wins_col = f'wins_{mode}'
            
            cursor.execute(f'''
                SELECT discord_username, {rating_col} as rating
                FROM players
                WHERE {rating_col} > 0
                ORDER BY {rating_col} DESC
                LIMIT 5
            ''')
            
            top_por_modo[mode] = [
                {
                    'nome': row['discord_username'],
                    'rating': row['rating']
                }
                for row in cursor.fetchall()
            ]
        
        conn.close()
        
        return jsonify({
            'total_jogadores': total_jogadores,
            'total_partidas': total_partidas,
            'top_por_modo': top_por_modo,
            'ultima_atualizacao': datetime.now().isoformat() + 'Z'
        })
    
    except Exception as e:
        print(f'Erro ao buscar stats gerais: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/historico/<discord_id>', methods=['GET'])
def get_historico(discord_id):
    """
    Retorna o histórico de partidas de um jogador
    GET /api/historico/123456789
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Permite filtrar por modo via query param '?modo=blitz|rapid|bullet|classic'
        modo_filter = request.args.get('modo')
        print(f'[DEBUG] Buscando histórico para {discord_id}, modo: {modo_filter}')
        
        if modo_filter and modo_filter.lower() != 'todos':
            print(f'[DEBUG] Filtrando por modo: {modo_filter}')
            cursor.execute('''
                SELECT 
                    id,
                    player1_id,
                    player2_id,
                    player1_name,
                    player2_name,
                    winner_id,
                    result,
                    mode,
                    time_control,
                    game_url,
                    player1_rating_before,
                    player2_rating_before,
                    player1_rating_after,
                    player2_rating_after,
                    played_at
                FROM game_history
                WHERE (player1_id = ? OR player2_id = ?) AND mode = ?
                ORDER BY played_at DESC
                LIMIT 50
            ''', (discord_id, discord_id, modo_filter))
        else:
            # Buscar partidas do jogador (como player1 ou player2)
            print(f'[DEBUG] Buscando todas as partidas')
            cursor.execute('''
                SELECT 
                    id,
                    player1_id,
                    player2_id,
                    player1_name,
                    player2_name,
                    winner_id,
                    result,
                    mode,
                    time_control,
                    game_url,
                    player1_rating_before,
                    player2_rating_before,
                    player1_rating_after,
                    player2_rating_after,
                    played_at
                FROM game_history
                WHERE player1_id = ? OR player2_id = ?
                ORDER BY played_at DESC
                LIMIT 50
            ''', (discord_id, discord_id))
        
        rows = cursor.fetchall()
        print(f'[DEBUG] Total de partidas encontradas: {len(rows)}')
        conn.close()
        
        partidas = []
        for row in rows:
            row_dict = dict(row)
            
            # Determinar se foi vitória, derrota ou empate
            if row_dict['result'] == 'draw':
                resultado = 'Empate'
                cor_resultado = 'gray'
            elif row_dict['winner_id'] == discord_id:
                resultado = 'Vitória'
                cor_resultado = 'green'
            else:
                resultado = 'Derrota'
                cor_resultado = 'red'
            
            # Determinar oponente
            if row_dict['player1_id'] == discord_id:
                oponente_id = row_dict['player2_id']
                oponente_nome = row_dict['player2_name']
                rating_antes = row_dict['player1_rating_before']
                rating_depois = row_dict['player1_rating_after']
                rating_oponente_antes = row_dict['player2_rating_before']
            else:
                oponente_id = row_dict['player1_id']
                oponente_nome = row_dict['player1_name']
                rating_antes = row_dict['player2_rating_before']
                rating_depois = row_dict['player2_rating_after']
                rating_oponente_antes = row_dict['player1_rating_before']
            
            # Calcular variação de rating
            variacao_rating = (rating_depois or 0) - (rating_antes or 0) if rating_depois and rating_antes else 0
            sinal = '+' if variacao_rating > 0 else ''
            
            partidas.append({
                'id': row_dict['id'],
                'oponente_id': oponente_id,
                'oponente_nome': oponente_nome,
                'resultado': resultado,
                'cor_resultado': cor_resultado,
                'modo': row_dict['mode'],
                'time_control': row_dict['time_control'],
                'rating_antes': rating_antes or 0,
                'rating_depois': rating_depois or 0,
                'variacao_rating': sinal + str(variacao_rating),
                'rating_oponente': rating_oponente_antes or 0,
                'link_partida': row_dict['game_url'],
                'data': row_dict['played_at']
            })
        
        print(f'[DEBUG] Retornando {len(partidas)} partidas processadas')
        return jsonify({
            'discord_id': discord_id,
            'total_partidas': len(partidas),
            'partidas': partidas
        })
    
    except Exception as e:
        print(f'[ERROR] Erro ao buscar histórico: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tournaments/in-progress', methods=['GET'])
def get_in_progress_tournaments():
    """
    Retorna uma lista de torneios suíços em andamento.
    GET /api/tournaments/in-progress
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT
                t.id,
                t.name,
                t.description,
                'swiss' as mode,
                t.time_control,
                t.nb_rounds,
                t.started_at,
                p.discord_username as created_by_name,
                COUNT(sp.player_id) as participant_count
            FROM swiss_tournaments t
            LEFT JOIN players p ON t.created_by = p.discord_id
            LEFT JOIN swiss_participants sp ON t.id = sp.tournament_id
            WHERE t.status IN ('in_progress', 'open')
            GROUP BY t.id, t.name, t.description, t.time_control, t.nb_rounds, t.started_at, p.discord_username
            ORDER BY t.created_at DESC
        """)
        
        rows = cursor.fetchall()
        
        tournaments = []
        for row in rows:
            tournament = dict(row)
            
            # Buscar participantes do torneio
            cursor2 = conn.cursor()
            cursor2.execute("""
                SELECT 
                    p.discord_username,
                    p.rating_blitz,
                    p.rating_rapid,
                    p.rating_classic,
                    p.rating_bullet
                FROM swiss_participants sp
                JOIN players p ON sp.player_id = p.discord_id
                WHERE sp.tournament_id = ?
            """, (tournament['id'],))
            
            participants_raw = cursor2.fetchall()
            
            # Processar participantes e determinar rating baseado no time_control
            participants = []
            for participant_row in participants_raw:
                participant = dict(participant_row)
                # Determinar o rating baseado no time_control
                time_control = tournament['time_control']
                if '3+0' in time_control or '2+1' in time_control:
                    rating = participant['rating_bullet'] or 1200
                    mode = 'Bullet'
                elif '5+3' in time_control or '10+0' in time_control:
                    rating = participant['rating_blitz'] or 1200
                    mode = 'Blitz'
                elif '15+10' in time_control or '30+0' in time_control:
                    rating = participant['rating_rapid'] or 1200
                    mode = 'Rápida'
                else:
                    rating = participant['rating_classic'] or 1200
                    mode = 'Clássico'
                
                participants.append({
                    'name': participant['discord_username'],
                    'rating': rating,
                    'mode': mode
                })
            
            # Ordenar participantes por rating em ordem decrescente (maior para menor)
            participants.sort(key=lambda x: x['rating'], reverse=True)
            
            tournament['participants'] = participants
            tournaments.append(tournament)
        
        conn.close()
        
        return jsonify({
            'ultimo_update': datetime.now().isoformat() + 'Z',
            'tournaments': tournaments
        })
    
    except Exception as e:
        print(f'Erro ao buscar torneios em andamento: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/tournaments/swiss', methods=['GET'])
def get_swiss_tournaments():
    """
    Retorna uma lista de torneios suíços finalizados.
    GET /api/tournaments/swiss
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # A sintaxe do SQL foi corrigida para garantir compatibilidade e clareza
        cursor.execute("""
            SELECT
                t.id,
                t.name,
                t.description,
                'swiss' as mode,
                t.time_control,
                t.finished_at,
                p.discord_username as winner_name
            FROM swiss_tournaments t
            LEFT JOIN players p ON t.winner_id = p.discord_id
            WHERE t.status = 'finished'
            ORDER BY t.finished_at DESC
        """)
        
        rows = cursor.fetchall()
        conn.close()
        
        tournaments = [dict(row) for row in rows]
        
        return jsonify({
            'ultimo_update': datetime.now().isoformat() + 'Z',
            'tournaments': tournaments
        })
    
    except Exception as e:
        print(f'Erro ao buscar torneios: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/', methods=['GET'])
def index():
    """Serve a página inicial"""
    try:
        frontend_path = Path(__file__).parent.parent / 'index.html'
        return send_file(frontend_path)
    except Exception as e:
        return f"Erro ao carregar página: {e}", 500

@app.route('/debug', methods=['GET'])
def debug_page():
    """Serve a página de debug"""
    try:
        frontend_path = Path(__file__).parent.parent / 'debug_tournaments_page.html'
        return send_file(frontend_path)
    except Exception as e:
        return f"Erro ao carregar página: {e}", 500

@app.route('/<path:filename>', methods=['GET'])
def static_files(filename):
    """Serve arquivos estáticos (CSS, JS, etc.)"""
    try:
        if filename.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.html')):
            frontend_path = Path(__file__).parent.parent / filename
            if frontend_path.exists():
                return send_file(frontend_path)
        return "Arquivo não encontrado", 404
    except Exception as e:
        return f"Erro ao carregar arquivo: {e}", 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({'status': 'ok', 'database': DB_PATH}), 200

@app.route('/api/debug/db-info', methods=['GET'])
def debug_db_info():
    """Debug endpoint - mostra informações do banco de dados"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Contar dados em cada tabela
        cursor.execute("SELECT COUNT(*) as count FROM players")
        player_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM game_history")
        history_count = cursor.fetchone()['count']
        
        # Listar alguns jogadores
        cursor.execute("SELECT discord_id, discord_username FROM players LIMIT 5")
        players = [dict(row) for row in cursor.fetchall()]
        
        # Listar algumas partidas
        cursor.execute("SELECT player1_id, player2_id, mode, played_at FROM game_history LIMIT 5")
        games = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            'players_count': player_count,
            'games_count': history_count,
            'sample_players': players,
            'sample_games': games
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/avatar/<discord_id>', methods=['GET'])
def get_avatar(discord_id):
    """
    Proxy para avatar do Discord
    GET /api/avatar/123456789
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT avatar_hash FROM players WHERE discord_id = ?', (discord_id,))
        row = cursor.fetchone()
        conn.close()
        
        avatar_hash = row[0] if row else None
        
        # Gerar URL do avatar
        if avatar_hash:
            avatar_url = f"https://cdn.discordapp.com/avatars/{discord_id}/{avatar_hash}.png"
        else:
            default_avatar_id = int(discord_id) % 5
            avatar_url = f"https://cdn.discordapp.com/embed/avatars/{default_avatar_id}.png"
        
        # Buscar a imagem do Discord
        response = requests.get(avatar_url, timeout=10)
        if response.ok:
            img_response = send_file(
                BytesIO(response.content),
                mimetype=response.headers.get('content-type', 'image/png'),
                as_attachment=False
            )
            img_response.headers['Cache-Control'] = 'public, max-age=86400'
            img_response.headers['Access-Control-Allow-Origin'] = '*'
            return img_response
        
        # Fallback se falhar
        return redirect(avatar_url)
    
    except Exception as e:
        print(f'Erro ao buscar avatar: {e}')
        # Fallback para avatar padrão
        default_avatar_id = int(discord_id) % 5
        default_url = f"https://cdn.discordapp.com/embed/avatars/{default_avatar_id}.png"
        try:
            response = requests.get(default_url, timeout=10)
            img_response = send_file(
                BytesIO(response.content),
                mimetype='image/png',
                as_attachment=False
            )
            img_response.headers['Cache-Control'] = 'public, max-age=86400'
            img_response.headers['Access-Control-Allow-Origin'] = '*'
            return img_response
        except:
            return redirect(default_url)

@app.route('/api/achievements/<discord_id>', methods=['GET'])
def get_player_achievements(discord_id):
    """
    Retorna as conquistas (achievements) de um jogador
    GET /api/achievements/123456789
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT achievement_name, description, value, unlocked_at, achievement_type
            FROM achievements 
            WHERE player_id = ?
            ORDER BY unlocked_at DESC
        ''', (discord_id,))
        
        achievements = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify({
            'achievements': achievements,
            'total': len(achievements),
            'ultima_atualizacao': datetime.now().isoformat() + 'Z'
        })
    
    except Exception as e:
        print(f'Erro ao buscar achievements: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['GET'])
def search_players():
    """
    Busca jogadores por nome
    GET /api/search?query=nome
    """
    query = request.args.get('query', '').strip().lower()
    if not query or len(query) < 2:
        return jsonify([])
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Search in discord_username, using blitz stats
        cursor.execute('''
            SELECT discord_id, discord_username, lichess_username, avatar_hash,
                   rating_blitz, wins_blitz, losses_blitz, draws_blitz
            FROM players
            WHERE LOWER(discord_username) LIKE ?
            ORDER BY rating_blitz DESC
            LIMIT 10
        ''', ('%' + query + '%',))
        
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for row in rows:
            player_dict = dict(row)
            total_games = (player_dict['wins_blitz'] or 0) + (player_dict['losses_blitz'] or 0) + (player_dict['draws_blitz'] or 0)
            win_rate = round((player_dict['wins_blitz'] or 0) / total_games * 100, 1) if total_games > 0 else 0
            
            avatar_url = f'{request.host_url}api/avatar/{player_dict["discord_id"]}'
            
            results.append({
                'id_discord': player_dict['discord_id'],
                'nome': player_dict['discord_username'],
                'lichess_username': player_dict['lichess_username'],
                'avatar_url': avatar_url,
                'rating': player_dict['rating_blitz'] or 1200,
                'vitorias': player_dict['wins_blitz'] or 0,
                'derrotas': player_dict['losses_blitz'] or 0,
                'empates': player_dict['draws_blitz'] or 0,
                'partidas_jogadas': total_games,
                'win_rate': win_rate
            })
        
        return jsonify(results)
    
    except Exception as e:
        print(f'Erro na busca: {e}')
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Rota não encontrada'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Erro no servidor'}), 500

if __name__ == '__main__':
    # Verificar se banco existe, se não, criar
    if not os.path.exists(DB_PATH):
        print(f'[INFO] Banco de dados nao encontrado em {DB_PATH}')
        print('[INFO] Criando banco de dados...')
        try:
            init_database()
            print('[OK] Banco de dados criado com sucesso!')
        except Exception as e:
            print(f'[ERROR] Falha ao criar banco de dados: {e}')
            sys.exit(1)
    else:
        print(f'[OK] Banco de dados encontrado: {DB_PATH}')
        # Garantir que todas as tabelas existem (para compatibilidade)
        init_database()
    
    print(f'[INFO] Iniciando servidor em http://localhost:5000')
    print(f'[INFO] Endpoints disponiveis:')
    print(f'   GET /api/ranking/<mode> - Ranking de um modo')
    print(f'   GET /api/jogador/<discord_id> - Detalhes de um jogador')
    print(f'   GET /api/search?query=<name> - Buscar jogadores')
    print(f'   GET /api/stats-gerais - Estatisticas gerais')
    print(f'   GET /api/health - Health check')
    
    app.run(debug=True, host='0.0.0.0', port=5000)
