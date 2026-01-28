
import React, { useState, useEffect } from 'react';
import { Player, GameMode, ViewState, Tournament } from './types.ts';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import RankingTable from './components/RankingTable.tsx';
import PlayerModal from './components/PlayerModal.tsx';
import TournamentSection from './components/TournamentSection.tsx';
import Regulations from './components/Regulations.tsx';
import OfficialTournaments from './components/OfficialTournaments.tsx';
// Removed mock imports to rely only on backend data

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [activeMode, setActiveMode] = useState<GameMode>('blitz');
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Busca Rankings do Backend com Fallback para Mock
  const fetchRankings = async (mode: GameMode) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/ranking/${mode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'omit'
      });
      if (!response.ok) throw new Error('Falha na conexão com o Nexus');
      const data = await response.json();
      
      const formattedPlayers: Player[] = data.jogadores.map((j: any, idx: number) => {
        // Usar avatar_hash para construir URL do Discord CDN (melhor que /api/avatar)
        const avatarUrl = `${API_URL}/avatar/${j.id_discord}`;
        return {
          id_discord: j.id_discord,
          nome: j.nome,
          avatar_url: avatarUrl,
          rank: idx + 1,
          estatisticas: {
            [mode]: {
              rating: j.rating || 0,
              vitorias: j.vitorias || 0,
              derrotas: j.derrotas || 0,
              empates: j.empates || 0,
              partidas_jogadas: j.partidas_jogadas || 0
            }
          }
        };
      });
      
      setPlayers(formattedPlayers);
      setLastUpdate(new Date(data.ultimo_update).toLocaleString('pt-BR'));
      setIsDemoMode(false);
    } catch (error) {
      console.warn("Backend offline ao buscar rankings. Removendo dados fictícios.");
      // Mantém os dados já carregados; se não houver, limpa a lista (sem usar dados fictícios)
      setPlayers((curr) => (curr.length > 0 ? curr : []));
      setLastUpdate(new Date().toLocaleString('pt-BR'));
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Busca Torneios do Backend com Fallback para Mock
  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${API_URL}/tournaments/in-progress`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      // Enriquecer dados dos torneios com ratings reais do ranking atual
      const enrichedTournaments = data.tournaments?.map((t: any) => {
        const updatedParticipants = t.participants?.map((p: any) => {
          // Procurar o jogador nos dados atuais do ranking
          const playerInRanking = players.find(rp => rp.nome.toLowerCase() === p.name.toLowerCase());
          if (playerInRanking) {
            // Usar o rating da modalidade atual
            const currentModeStats = playerInRanking.estatisticas?.[activeMode];
            p.rating = currentModeStats?.rating || p.rating;
          }
          return p;
        }) || [];
        return { ...t, participants: updatedParticipants };
      }) || [];
      
      setTournaments(enrichedTournaments);
    } catch (error) {
      console.warn("Backend offline, entrando em Modo Simulação (Torneios).");
      // Não utilizar torneios fictícios — mostrar lista vazia quando backend indisponível
      setTournaments([]);
    }
  };

  useEffect(() => {
    if (view === 'rankings') {
      fetchRankings(activeMode).then(() => fetchTournaments());
    } else if (view === 'home') {
      // Na home, buscar os rankings de blitz e os torneios
      fetchRankings(activeMode).then(() => fetchTournaments());
    } else {
      fetchTournaments();
    }
  }, [view, activeMode]);

  const filteredPlayers = players.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#050505] bg-grid">
      <Header 
        searchQuery={searchQuery} 
        onSearch={setSearchQuery} 
        currentView={view}
        setView={setView}
      />
      
      <main className="flex-grow pt-28 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {isDemoMode && (
            <div className="bg-red-600/10 border border-red-600/30 p-2 text-center rounded-xl">
               <span className="tech-font text-[9px] text-red-500 uppercase font-black animate-pulse">
                 Atenção: Servidor Legion offline. Visualizando dados de simulação local.
               </span>
            </div>
          )}

          {view === 'home' ? (
            <>
              <Hero onAction={() => setView('rankings')} onTournaments={() => setView('tournaments')} />
              <TournamentSection 
                tournaments={tournaments} 
                onRefresh={fetchTournaments}
                players={players}
                onPlayerClick={setSelectedPlayer}
              />
            </>
          ) : view === 'regulations' ? (
            <Regulations />
          ) : view === 'tournaments' ? (
            <OfficialTournaments />
          ) : (
            <section className="space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="tech-font text-4xl font-black bg-gradient-to-r from-red-500 via-white to-red-500 text-transparent bg-clip-text uppercase tracking-tighter">
                    Legion Rankings
                  </h2>
                  <p className="text-red-500/60 text-[10px] tech-font uppercase mt-1">
                    Último Sinc: {lastUpdate}
                  </p>
                </div>
                
                <div className="flex gap-2 bg-[#111] p-1.5 rounded-xl border border-red-900/20 shadow-inner">
                  {(['blitz', 'rapid', 'bullet', 'classic'] as GameMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setActiveMode(mode)}
                      className={`px-5 py-2 rounded-lg tech-font text-[10px] uppercase font-bold transition-all ${
                        activeMode === mode 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="LOCALIZAR COMBATENTE..."
                  className="w-full max-w-md bg-[#111] border border-red-900/30 rounded-full px-6 py-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all tech-font"
                />
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                  <span className="tech-font text-xs text-red-500 animate-pulse">Sincronizando com Nexus...</span>
                </div>
              ) : (
                <RankingTable 
                  players={filteredPlayers} 
                  mode={activeMode}
                  onPlayerClick={setSelectedPlayer} 
                />
              )}
            </section>
          )}

        </div>
      </main>

      <footer className="py-10 border-t border-red-900/10 text-center bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="tech-font text-[10px] text-gray-500 tracking-[0.3em] uppercase">
            &copy; 2026 Legion Chess • Protocolo de Combate Ativo
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 hover:text-red-500 transition-colors tech-font text-[10px]">Discord</a>
            <a href="#" className="text-gray-600 hover:text-red-500 transition-colors tech-font text-[10px]">Manual</a>
          </div>
        </div>
      </footer>

      {selectedPlayer && (
        <PlayerModal 
          player={selectedPlayer} 
          activeMode={activeMode}
          onClose={() => setSelectedPlayer(null)} 
        />
      )}
    </div>
  );
};

export default App;
