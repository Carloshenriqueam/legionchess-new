
import React from 'react';
import { Player, GameMode } from '../types.ts';

interface RankingTableProps {
  players: Player[];
  mode: GameMode;
  onPlayerClick: (p: Player) => void;
}

export default function RankingTable({ players, mode, onPlayerClick }: RankingTableProps) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-red-900/10 bg-[#0a0a0a] shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-red-900/5 tech-font text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-red-900/10">
            <th className="px-8 py-6">Rank</th>
            <th className="px-8 py-6">Combatente</th>
            <th className="px-8 py-6">Rating ELO</th>
            <th className="px-8 py-6 text-center">V</th>
            <th className="px-8 py-6 text-center">E</th>
            <th className="px-8 py-6 text-center">D</th>
            <th className="px-8 py-6">Win Rate</th>
            <th className="px-8 py-6">Partidas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-red-900/5">
          {players.map((player) => {
            const stats = player.estatisticas?.[mode] ?? { rating: 0, vitorias: 0, derrotas: 0, empates: 0, partidas_jogadas: 0 };
            const partidas = Number(stats.partidas_jogadas || 0);
            const vitorias = Number(stats.vitorias || 0);
            const wr = partidas > 0 ? ((vitorias / partidas) * 100).toFixed(1) : "0.0";
            
            return (
              <tr 
                key={player.id_discord} 
                onClick={() => onPlayerClick(player)}
                className="hover:bg-red-600/5 cursor-pointer transition-all group"
              >
                <td className="px-8 py-5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center tech-font font-black text-xs border ${
                    player.rank === 1 ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]' :
                    player.rank === 2 ? 'border-gray-400/50 text-gray-300 bg-gray-400/10' :
                    player.rank === 3 ? 'border-orange-700/50 text-orange-600 bg-orange-700/10' :
                    'border-white/5 text-gray-600'
                  }`}>
                    {player.rank}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-900/30 rounded-xl flex items-center justify-center border border-red-900/30 overflow-hidden flex-shrink-0">
                      <img 
                        src={player.avatar_url} 
                        alt={player.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div>
                      <div className="tech-font font-bold text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">
                        {player.nome}
                      </div>
                      <div className="text-[9px] text-gray-600 tech-font uppercase">Discord Verified</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="tech-font text-red-500 font-black text-lg">{stats.rating ?? 0}</span>
                </td>
                <td className="px-8 py-5 text-green-500/80 tech-font text-sm text-center font-bold">{stats.vitorias ?? 0}</td>
                <td className="px-8 py-5 text-yellow-500/80 tech-font text-sm text-center font-bold">{stats.empates ?? 0}</td>
                <td className="px-8 py-5 text-red-500/80 tech-font text-sm text-center font-bold">{stats.derrotas ?? 0}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 shadow-[0_0_8px_rgba(230,57,70,0.5)]" style={{ width: `${wr}%` }}></div>
                    </div>
                    <span className="text-[11px] text-white tech-font font-bold">{wr}%</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-gray-600 tech-font text-xs uppercase">
                    {partidas}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
