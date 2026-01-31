import React, { useState, useEffect } from 'react';
import { Player, GameMode } from '../types.ts';

interface RankingTableProps {
  players: Player[];
  mode: GameMode;
  onPlayerClick: (p: Player) => void;
}

export default function RankingTable({ players, mode, onPlayerClick }: RankingTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [mode]);

  const totalPages = Math.ceil(players.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPlayers = players.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="rounded-3xl border border-red-900/10 bg-[#0a0a0a]/80 backdrop-blur-sm shadow-2xl relative flex flex-col">
      <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-gradient-to-b from-[#111] to-[#0a0a0a] backdrop-blur-md">
          <tr className="bg-red-900/5 tech-font text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-red-900/10">
            <th className="px-6 py-6 text-center w-20">Rank</th>
            <th className="px-6 py-6">Jogador</th>
            <th className="px-6 py-6 text-right">Rating</th>
            <th className="px-6 py-6 text-center">V</th>
            <th className="px-6 py-6 text-center hidden md:table-cell">E</th>
            <th className="px-6 py-6 text-center hidden md:table-cell">D</th>
            <th className="px-6 py-6 w-32">Win Rate</th>
            <th className="px-6 py-6 text-right hidden sm:table-cell">Partidas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-red-900/5">
          {currentPlayers.map((player) => {
            const stats = player.estatisticas?.[mode] ?? { rating: 0, vitorias: 0, derrotas: 0, empates: 0, partidas_jogadas: 0 };
            const partidas = Number(stats.partidas_jogadas || 0);
            const vitorias = Number(stats.vitorias || 0);
            const wrValue = partidas > 0 ? (vitorias / partidas) * 100 : 0;
            const wr = wrValue.toFixed(1);
            
            // Determine rank styling
            let rankBadge;
            let rowClass = "fade-in-section cursor-pointer transition-all duration-300 group border-l-2 ";

            if (player.rank === 1) {
              rowClass += "bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent border-yellow-500 hover:from-yellow-500/20 hover:scale-[1.01]";
              rankBadge = (
                <div className="relative w-10 h-10 flex items-center justify-center mx-auto">
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-md animate-pulse"></div>
                  <div className="relative w-8 h-8 rounded-full flex items-center justify-center tech-font font-black text-sm border border-yellow-500/50 text-yellow-500 bg-gradient-to-br from-yellow-500/20 to-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    👑
                  </div>
                </div>
              );
            } else if (player.rank === 2) {
              rowClass += "bg-gradient-to-r from-gray-400/10 via-transparent to-transparent border-gray-400 hover:from-gray-400/20 hover:scale-[1.01]";
              rankBadge = (
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto tech-font font-black text-sm border border-gray-400/50 text-gray-300 bg-gradient-to-br from-gray-400/20 to-gray-800/20 shadow-[0_0_10px_rgba(156,163,175,0.2)]">
                  🥈
                </div>
              );
            } else if (player.rank === 3) {
              rowClass += "bg-gradient-to-r from-orange-500/10 via-transparent to-transparent border-orange-500 hover:from-orange-500/20 hover:scale-[1.01]";
              rankBadge = (
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto tech-font font-black text-sm border border-orange-700/50 text-orange-600 bg-gradient-to-br from-orange-600/20 to-orange-900/20 shadow-[0_0_10px_rgba(194,65,12,0.2)]">
                  🥉
                </div>
              );
            } else {
              rowClass += "border-transparent hover:bg-red-600/5 hover:border-red-600 hover:pl-1";
              rankBadge = (
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto tech-font font-bold text-xs border border-white/5 text-gray-600 bg-white/5 group-hover:border-red-500/30 group-hover:text-red-500 transition-colors">
                  {player.rank}
                </div>
              );
            }

            // Win rate color calculation
            let wrColorClass = "bg-gray-700";
            if (wrValue >= 60) wrColorClass = "bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]";
            else if (wrValue >= 45) wrColorClass = "bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
            else if (wrValue > 0) wrColorClass = "bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]";

            return (
              <tr 
                key={player.id_discord} 
                onClick={() => onPlayerClick(player)}
                className={rowClass}
              >
                <td className="px-6 py-4">
                  {rankBadge}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border overflow-hidden flex-shrink-0 transition-all duration-300 ${
                      player.rank <= 3 ? 'border-red-500/30 shadow-lg shadow-red-900/20' : 'border-red-900/20 bg-red-900/10'
                    }`}>
                      <img 
                        src={player.avatar_url} 
                        alt={player.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://cdn.discordapp.com/embed/avatars/${Math.abs(Number(player.id_discord) || 0) % 5}.png`;
                        }}
                      />
                    </div>
                    <div>
                      <div className={`tech-font font-bold transition-colors uppercase tracking-tight ${
                        player.rank === 1 ? 'text-yellow-500' : 'text-white group-hover:text-red-500'
                      }`}>
                        {player.nome}
                      </div>
                      <div className="text-[9px] text-gray-600 tech-font uppercase flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${player.rank <= 3 ? 'bg-yellow-500 animate-pulse' : 'bg-green-500/50'}`}></span>
                        Legion Member
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`tech-font font-black text-lg ${
                    player.rank === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600' :
                    player.rank === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500' :
                    player.rank === 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-600' :
                    stats.rating >= 2000 ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600' : 
                    stats.rating >= 1500 ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {stats.rating ?? 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-green-500/80 tech-font text-sm text-center font-bold">{stats.vitorias ?? 0}</td>
                <td className="px-6 py-4 text-yellow-500/80 tech-font text-sm text-center font-bold hidden md:table-cell">{stats.empates ?? 0}</td>
                <td className="px-6 py-4 text-red-500/80 tech-font text-sm text-center font-bold hidden md:table-cell">{stats.derrotas ?? 0}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${wrColorClass}`} 
                        style={{ width: `${wr}%` }}
                      ></div>
                    </div>
                    <span className={`text-[10px] tech-font font-bold ${wrValue >= 50 ? 'text-white' : 'text-gray-500'}`}>{wr}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 tech-font text-xs uppercase font-medium text-right hidden sm:table-cell">
                    {partidas} <span className="text-[9px] opacity-50">JOGOS</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center p-6 border-t border-red-900/10 bg-gradient-to-b from-[#0a0a0a] to-[#111] rounded-b-3xl">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-6 py-2 rounded-xl bg-red-900/10 hover:bg-red-900/20 border border-red-900/20 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all tech-font text-[10px] font-bold uppercase tracking-wider hover:scale-105 active:scale-95"
          >
            ← Anterior
          </button>
          
          <span className="text-[10px] tech-font text-gray-500 font-bold uppercase tracking-widest">
            Página <span className="text-white text-sm mx-1">{currentPage}</span> de <span className="text-gray-400">{totalPages}</span>
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-6 py-2 rounded-xl bg-red-900/10 hover:bg-red-900/20 border border-red-900/20 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all tech-font text-[10px] font-bold uppercase tracking-wider hover:scale-105 active:scale-95"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
