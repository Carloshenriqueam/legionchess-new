
import React, { useState, useEffect } from 'react';
import { Player, GameMode, Match, Achievement } from '../types.ts';
import { GoogleGenAI } from "@google/genai";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



interface PlayerModalProps {
  player: Player;
  activeMode: GameMode;
  onClose: () => void;
  apiUrl: string;
}

export default function PlayerModal({ player, activeMode, onClose, apiUrl }: PlayerModalProps) {
  const [currentMode, setCurrentMode] = useState<GameMode | 'todos'>(activeMode);
  const [history, setHistory] = useState<Match[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 5;
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [fullStats, setFullStats] = useState(player.estatisticas);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Calcula stats agregados se o modo for 'todos', senão pega do modo específico
  const getDisplayStats = () => {
    if (currentMode === 'todos') {
        let v = 0, d = 0, e = 0, p = 0;
        Object.values(fullStats).forEach((s: any) => {
            if(s) { v += (s.vitorias || 0); d += (s.derrotas || 0); e += (s.empates || 0); p += (s.partidas_jogadas || 0); }
        });
        // Rating 0 para 'todos' pois não faz sentido somar ratings
        return { rating: 0, vitorias: v, derrotas: d, empates: e, partidas_jogadas: p };
    }
    return fullStats[currentMode as GameMode] || { rating: 0, vitorias: 0, derrotas: 0, empates: 0, partidas_jogadas: 0 };
  };

  const stats = getDisplayStats();
  const totalPages = Math.ceil(history.length / itemsPerPage);

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

  // Fetch Global Data (Stats & Achievements)
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const [achRes, detailsRes] = await Promise.all([
          fetch(`${apiUrl}/achievements/${player.id_discord}`),
          fetch(`${apiUrl}/jogador/${player.id_discord}`)
        ]);
        
        if (achRes.ok) {
            const achData = await achRes.json();
            setAchievements(achData.achievements || achData || []);
        }
        
        if (detailsRes.ok) {
            const detailsData = await detailsRes.json();
            if (detailsData.estatisticas) {
                setFullStats(detailsData.estatisticas);
            }
        }
      } catch (e) {
        console.error("Erro ao buscar dados globais:", e);
      }
    };
    fetchGlobalData();
  }, [player.id_discord]);

  // Fetch History on Mode Change
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingData(true);
      try {
        // Adiciona timestamp para evitar cache do navegador
        const histRes = await fetch(`${apiUrl}/historico/${player.id_discord}?modo=${currentMode}&t=${new Date().getTime()}`, {
            cache: 'no-store'
        });
        if (!histRes.ok) throw new Error();
        const histData = await histRes.json();
        console.log("Dados de histórico recebidos:", histData);
        const partidas = Array.isArray(histData.partidas) ? histData.partidas : Array.isArray(histData) ? histData : [];
        setHistory(partidas);
        setHistoryPage(1);
      } catch (e) {
        console.error("Erro ao buscar histórico:", e);
        setHistory([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchHistory();
  }, [player.id_discord, currentMode]);

  const generateAiReport = async () => {
    setIsLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise este jogador de Xadrez Legion e gere um relatório tático de olheiro agressivo:
        Nome: ${player.nome}
        Modo: ${currentMode}
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
        <div className="overflow-y-auto custom-scrollbar flex-grow bg-grid scroll-smooth">
          
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

            {/* Mode Tabs */}
            <div className="flex justify-center gap-2 mb-6">
              {(['todos', 'blitz', 'rapid', 'bullet', 'classic'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCurrentMode(mode)}
                  className={`px-6 py-2 rounded-xl tech-font text-[10px] uppercase font-bold tracking-wider transition-all duration-300 ${
                    currentMode === mode
                      ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-105'
                      : 'bg-[#111] text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-white/5 hover:border-red-500/30'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Grid de Stats Primários - Agora com 2 linhas */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               <StatCard label="Rating" value={stats.rating > 0 ? stats.rating.toString() : "---"} color="text-white" />
               <StatCard label="Win Rate" value={`${stats.partidas_jogadas > 0 ? ((stats.vitorias/stats.partidas_jogadas)*100).toFixed(1) : 0}%`} color="text-red-500" />
               <StatCard label="Matches" value={stats.partidas_jogadas.toString()} color="text-gray-500" />
               <StatCard label="Vitórias" value={stats.vitorias.toString()} color="text-green-500" />
               <StatCard label="Empates" value={stats.empates.toString()} color="text-yellow-500" />
               <StatCard label="Derrotas" value={stats.derrotas.toString()} color="text-red-600" />
            </div>

            {/* Rating Evolution Chart */}
            <div className="h-64 w-full bg-[#0c0c0c] border border-red-900/5 rounded-[1.5rem] p-4 relative overflow-hidden group hover:border-red-900/20 transition-all">
                 <h3 className="absolute top-4 left-6 tech-font text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] z-10">
                    Rating Evolution
                 </h3>
                 <div className="w-full h-full pt-6">
                  {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[...history].reverse().map(m => ({
                      date: new Date(m.data).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
                      rating: m.rating_depois,
                      fullDate: new Date(m.data).toLocaleString()
                    }))}>
                      <defs>
                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#444" 
                        tick={{fontSize: 10, fill: '#666', fontFamily: 'monospace'}} 
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                      />
                      <YAxis 
                        stroke="#444" 
                        domain={['auto', 'auto']} 
                        tick={{fontSize: 10, fill: '#666', fontFamily: 'monospace'}} 
                        tickLine={false}
                        axisLine={false}
                        width={30}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#ef4444', fontFamily: 'monospace', fontSize: '12px' }}
                        labelStyle={{ color: '#888', marginBottom: '4px', fontSize: '10px', fontFamily: 'monospace' }}
                        formatter={(value: number) => [value, 'Rating']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        fillOpacity={1}
                        fill="url(#colorRating)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                        <span className="text-4xl mb-2 grayscale">📉</span>
                        <span className="tech-font text-[10px] uppercase tracking-widest text-gray-500">Sem dados de histórico</span>
                    </div>
                  )}
                 </div>
              </div>

            {/* Achievements */}
            <section className="space-y-4">
              <h3 className="tech-font text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-red-900/30">
                Combat Achievements
              </h3>
              <div className="flex flex-wrap gap-2">
                {achievements.length > 0 ? achievements.map((ach, i) => {
                  const name = ach.achievement_name || '';
                  const isVerified = /verificado|verified/i.test(name);
                  const isRival = /rival/i.test(name);
                  const isChampionAch = /champion|campe(o|ã)o|campeonato|league champion/i.test(name);
                  return (
                  <div key={i} className="bg-red-600/5 border border-red-900/10 px-5 py-3 rounded-2xl flex items-center gap-4 hover:bg-red-600/10 transition-all cursor-help" title={ach.description}>
                    {isVerified ? (
                      <img src="/verified-badge.png" alt="Membro Verificado" className="w-8 h-8 rounded-md" />
                    ) : isChampionAch ? (
                      <img src="/league_champion.0017401b.png" alt="Campeão da Semana" className="w-8 h-8 rounded-md" />
                    ) : isRival ? (
                      <img src="/rival.png" alt="Rival" className="w-8 h-8 rounded-md" />
                    ) : (
                      <span className="text-xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">🏆</span>
                    )}
                    <div>
                      <span className="text-[10px] tech-font text-white uppercase font-bold block">{ach.achievement_name}</span>
                      <span className="text-[8px] tech-font text-red-900 uppercase">{new Date(ach.unlocked_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}) : (
                  <p className="text-[10px] tech-font text-gray-700 italic pl-2">Nenhum registro de glória encontrado.</p>
                )}
              </div>
            </section>

            {/* History */}
            <section className="space-y-4">
              <h3 className="tech-font text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-red-900/30">
                Mission History // {currentMode.toUpperCase()}
              </h3>
              <div className="space-y-3">
                {isLoadingData ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                  </div>
                ) : history.length > 0 ? (
                  <>
                    {history.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage).map((match, i) => (
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
                  ))}
                  
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                      <button 
                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                        disabled={historyPage === 1}
                        className="px-4 py-2 rounded-lg bg-[#111] hover:bg-[#1a1a1a] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all tech-font text-[9px] font-bold uppercase tracking-wider border border-white/5"
                      >
                        ← Anterior
                      </button>
                      
                      <span className="text-[9px] tech-font text-gray-600 font-bold uppercase tracking-widest">
                        <span className="text-white">{historyPage}</span> / {totalPages}
                      </span>

                      <button 
                        onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                        disabled={historyPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-[#111] hover:bg-[#1a1a1a] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all tech-font text-[9px] font-bold uppercase tracking-wider border border-white/5"
                      >
                        Próxima →
                      </button>
                    </div>
                  )}
                  </>
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
