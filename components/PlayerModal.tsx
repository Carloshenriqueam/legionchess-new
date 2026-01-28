
import React, { useState, useEffect } from 'react';
import { Player, GameMode, Match, Achievement } from '../types.ts';
import { GoogleGenAI } from "@google/genai";

const API_URL = 'http://localhost:5000/api';

interface PlayerModalProps {
  player: Player;
  activeMode: GameMode;
  onClose: () => void;
}

export default function PlayerModal({ player, activeMode, onClose }: PlayerModalProps) {
  const [history, setHistory] = useState<Match[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const stats = player.estatisticas[activeMode] || { rating: 0, vitorias: 0, derrotas: 0, empates: 0, partidas_jogadas: 0 };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  // Bloqueia scroll do site quando modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [histRes, achRes] = await Promise.all([
          fetch(`${API_URL}/historico/${player.id_discord}?modo=${activeMode}`),
          fetch(`${API_URL}/achievements/${player.id_discord}`)
        ]);
        
        if (!histRes.ok || !achRes.ok) throw new Error();

        const [histData, achData] = await Promise.all([histRes.json(), achRes.json()]);
        console.log('Histórico recebido:', histData);
        console.log('Conquistas recebidas:', achData);
        setHistory(histData.partidas || histData || []);
        setAchievements(achData.achievements || achData || []);
      } catch (e) {
        console.error("Erro ao buscar dados:", e);
        // Não carregar dados fictícios — mostrar listas vazias
        setHistory([]);
        setAchievements([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [player.id_discord, activeMode]);

  const generateAiReport = async () => {
    setIsLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise este jogador de Xadrez Legion e gere um relatório tático de olheiro agressivo:
        Nome: ${player.nome}
        Modo: ${activeMode}
        Rating: ${stats.rating}
        Taxa de Vitória: ${stats.partidas_jogadas > 0 ? ((stats.vitorias/stats.partidas_jogadas)*100).toFixed(1) : 0}%
        Vitórias: ${stats.vitorias}, Empates: ${stats.empates}, Derrotas: ${stats.derrotas}
        Conquistas: ${achievements.map(a => a.achievement_name).join(', ')}
        
        O relatório deve ter: 
        1. Nível de Ameaça (0-100%).
        2. Estilo de Jogo (Agressivo, Defensivo, Caótico).
        3. Ponto fraco explorável.`,
      });
      setAiReport(response.text);
    } catch (error) {
      setAiReport("Falha na varredura táctica. Sinal interferido.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${isClosing ? 'backdrop-fade-out' : 'backdrop-fade'}`} style={{ backdropFilter: isClosing ? 'blur(0px)' : 'blur(4px)' }}>
      <div className="absolute inset-0 bg-black/60 modal-backdrop" onClick={handleClose} />
      
      <div className={`relative w-full max-w-2xl bg-[#080808] border border-red-900/30 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(230,57,70,0.15)] animate-slideIn flex flex-col max-h-[85vh] ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
        
        {/* Botão de fechar fixo no topo do modal */}
        <button 
          onClick={handleClose} 
          className="absolute top-16 right-4 text-white text-3xl transition-all z-[80] bg-black/70 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-red-500/50 hover:bg-red-600/50"
        >
          ✕
        </button>

        {/* Área de rolagem principal */}
        <div className="overflow-y-auto custom-scrollbar flex-grow bg-grid">
          
          {/* Header Decorativo que rola junto */}
          <div className="h-40 bg-gradient-to-b from-red-600/20 via-red-900/10 to-transparent relative w-full" />

          <div className="px-8 pb-12 -mt-24 space-y-10 relative z-10">
            
            {/* Identidade do Jogador */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <img 
                  src={player.avatar_url} 
                  alt={player.nome} 
                  className="w-36 h-36 rounded-[2rem] border-4 border-[#080808] object-cover shadow-2xl bg-black relative z-10"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const idNum = Math.abs(parseInt(player.id_discord || '0', 10)) || 0;
                    const fallback = `https://cdn.discordapp.com/embed/avatars/${idNum % 5}.png`;
                    if (img.src !== fallback) img.src = fallback;
                  }}
                />
              </div>
              <div>
                <h2 className="tech-font text-4xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                  {player.nome}
                </h2>
                <p className="text-red-500 tech-font text-[10px] font-bold uppercase tracking-[0.4em] mt-2">
                  Protocolo Legion • Rank #{player.rank}
                </p>
              </div>
            </div>

            {/* Grid de Stats Primários - Agora com 2 linhas */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               <StatCard label="Rating" value={stats.rating.toString()} color="text-white" />
               <StatCard label="Win Rate" value={`${stats.partidas_jogadas > 0 ? ((stats.vitorias/stats.partidas_jogadas)*100).toFixed(1) : 0}%`} color="text-red-500" />
               <StatCard label="Matches" value={stats.partidas_jogadas.toString()} color="text-gray-500" />
               <StatCard label="Vitórias" value={stats.vitorias.toString()} color="text-green-500" />
               <StatCard label="Empates" value={stats.empates.toString()} color="text-yellow-500" />
               <StatCard label="Derrotas" value={stats.derrotas.toString()} color="text-red-600" />
            </div>

            {/* Achievements */}
            <section className="space-y-4">
              <h3 className="tech-font text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-red-900/30">
                Combat Achievements
              </h3>
              <div className="flex flex-wrap gap-2">
                {achievements.length > 0 ? achievements.map((ach, i) => (
                  <div key={i} className="bg-red-600/5 border border-red-900/10 px-5 py-3 rounded-2xl flex items-center gap-4 hover:bg-red-600/10 transition-all cursor-help" title={ach.description}>
                    <span className="text-xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">🏆</span>
                    <div>
                      <span className="text-[10px] tech-font text-white uppercase font-bold block">{ach.achievement_name}</span>
                      <span className="text-[8px] tech-font text-red-900 uppercase">{new Date(ach.unlocked_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-[10px] tech-font text-gray-700 italic pl-2">Nenhum registro de glória encontrado.</p>
                )}
              </div>
            </section>

            {/* History */}
            <section className="space-y-4">
              <h3 className="tech-font text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-red-900/30">
                Mission History // {activeMode.toUpperCase()}
              </h3>
              <div className="space-y-3">
                {isLoadingData ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                  </div>
                ) : history.length > 0 ? (
                  history.map((match, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-5 bg-[#0c0c0c] rounded-3xl border border-white/5 hover:border-red-600/30 transition-all cursor-pointer group hover:translate-x-1"
                      onClick={() => match.link_partida && window.open(match.link_partida, '_blank')}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center tech-font font-black text-sm transition-all ${
                          match.resultado === 'Vitória' ? 'bg-green-600/10 text-green-500 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 
                          match.resultado === 'Derrota' ? 'bg-red-600/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
                          'bg-gray-600/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {match.resultado === 'Vitória' ? 'W' : match.resultado === 'Derrota' ? 'L' : 'D'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase group-hover:text-red-500 transition-colors">vs {match.oponente_nome}</div>
                          <div className="text-[9px] text-gray-600 tech-font uppercase tracking-wider">{new Date(match.data).toLocaleDateString()} • {match.time_control}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="tech-font font-black text-sm text-white">{match.rating_depois}</div>
                        <div className={`text-[10px] tech-font font-bold ${match.variacao_rating.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {match.variacao_rating}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-yellow-600/10 border border-yellow-600/30 p-4 rounded-lg text-center">
                    <p className="text-[10px] tech-font text-yellow-600 uppercase">Nenhuma partida registrada neste modo</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer Fixo */}
        <div className="bg-[#0c0c0c] p-6 flex justify-between items-center border-t border-red-900/10 flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <div className="text-[9px] text-gray-600 tech-font uppercase font-bold tracking-widest">
              Legion Secure ID: {player.id_discord}
            </div>
          </div>
          <button className="text-[9px] text-red-900 hover:text-red-500 tech-font font-bold transition-all uppercase tracking-widest">
            Relatar Falha no Sistema
          </button>
        </div>
      </div>
    </div>
  );
}

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="bg-[#0c0c0c] border border-red-900/5 rounded-[1.5rem] p-6 text-center shadow-inner relative overflow-hidden group hover:border-red-900/20 transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform"></div>
    <div className="text-[9px] text-gray-600 tech-font uppercase tracking-widest mb-2 font-bold">{label}</div>
    <div className={`text-2xl tech-font font-black ${color} tracking-tighter`}>{value}</div>
  </div>
);
