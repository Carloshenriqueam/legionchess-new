
import React from 'react';
import { Tournament, Player } from '../types.ts';

interface TournamentSectionProps {
  tournaments: Tournament[];
  onRefresh: () => void;
  players: Player[];
  onPlayerClick: (player: Player) => void;
}

export default function TournamentSection({ tournaments, onRefresh, players, onPlayerClick }: TournamentSectionProps) {
  return (
    <section id="tournaments" className="space-y-8 py-12">
      <div className="flex justify-between items-end border-b border-red-900/20 pb-4">
        <div>
          <h2 className="tech-font text-3xl font-black text-white uppercase italic tracking-tighter">
            Torneios Ativos
          </h2>
          <p className="text-gray-500 tech-font text-[10px] uppercase mt-1">Sessões de torneios em tempo real</p>
        </div>
        <button 
          onClick={onRefresh}
          className="text-red-500 hover:text-white transition-colors text-xl p-2 hover:bg-red-600/20 rounded-full"
          title="Atualizar Fluxo"
        >
          🔄
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tournaments.length > 0 ? ( tournaments.map(t => (
          <div key={t.id} className="fade-in-section bg-[#0c0c0c] border border-red-900/20 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/40 transition-all">
            <div className="absolute top-0 right-0 p-4 bg-red-600/10 border-b border-l border-red-900/20 rounded-bl-xl">
               <span className="tech-font text-[10px] text-red-500 font-bold uppercase">{t.time_control}</span>
            </div>
            
            <h3 className="tech-font text-xl font-black text-white mb-2 uppercase group-hover:text-red-500 transition-colors">{t.name}</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{t.description || "Torneio suíço competitivo da Legião."}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[9px] text-gray-500 tech-font uppercase">Rodadas</div>
                <div className="tech-font text-lg text-white">{t.nb_rounds}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[9px] text-gray-500 tech-font uppercase">Inscritos</div>
                <div className="tech-font text-lg text-white">{t.participant_count}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] text-red-500 tech-font font-bold uppercase tracking-widest border-b border-red-900/10 pb-2">🏆 Top Participantes</div>
              <div className="space-y-2">
                {t.participants?.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5).map((p, i) => {
                  // Procurar dados completos do jogador no array players
                  const playerData = players.find(pl => pl.nome.toLowerCase() === p.name.toLowerCase());
                  // Usar Discord CDN padrão se não tiver avatar específico
                  const avatarUrl = playerData?.avatar_url || `https://cdn.discordapp.com/embed/avatars/${i % 5}.png`;
                  const rating = p.rating || '--';
                  
                  return (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-2.5 bg-black/30 rounded-lg hover:bg-black/50 transition-all border border-red-900/10 cursor-pointer"
                      onClick={() => {
                        if (playerData) {
                          onPlayerClick(playerData);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2.5 flex-1">
                        <span className="text-[10px] font-bold text-red-500/70 w-5 text-center">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                        </span>
                        <img 
                          src={avatarUrl}
                          alt={p.name}
                          className="w-6 h-6 rounded-full border border-red-900/30 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://cdn.discordapp.com/embed/avatars/${i % 5}.png`;
                          }}
                        />
                        <span className="text-xs font-bold text-white truncate">{p.name}</span>
                      </div>
                      <span className="text-xs font-bold text-red-500 ml-2 whitespace-nowrap">{rating}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-red-900/10 rounded-3xl">
            <div className="text-4xl mb-4 grayscale opacity-30">🏆</div>
            <p className="tech-font text-xs text-gray-600 uppercase">Nenhum torneio em andamento nos servidores Nexus.</p>
          </div>
        )}
      </div>
    </section>
  );
}
