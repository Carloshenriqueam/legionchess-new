import React, { useState } from 'react';
import TournamentBracket from './TournamentBracket';

interface Participant {
  name: string;
  rating: number;
  position?: number;
  status?: 'qualified' | 'pending' | 'eliminated';
  avatarUrl?: string;
}

interface Tournament {
  id: string;
  name: string;
  mode: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  startDate: string;
  participants: number;
  maxParticipants: number;
  prizePool: string;
  description: string;
  topParticipants: Participant[];
  rules?: string;
}

export default function OfficialTournaments() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [bracketTournament, setBracketTournament] = useState<Tournament | null>(null);

  // ============================================
  // 🎯 CONFIGURE SEU BRACKET AQUI
  // ============================================
  // Coloque a configuração do bracket aqui:
  const bracketConfig = {
    rounds: [
      // RODADA 1 - Primeira Rodada
      [
        {
          id: 'r1-m0',
          player1: { name: 'carloshenri', rating: 1841, avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' },
          player2: { name: 'carloshenriam3', rating: 1756, avatar: 'https://cdn.discordapp.com/embed/avatars/1.png' },
          status: 'finished' as const,
          winner: 'carloshenri',
          score: '1-0',
          round: 1
        },
        {
          id: 'r1-m1',
          player1: { name: 'GrandMaster_X', rating: 1725, avatar: 'https://cdn.discordapp.com/embed/avatars/2.png' },
          player2: { name: 'BlitzKing', rating: 1698, avatar: 'https://cdn.discordapp.com/embed/avatars/3.png' },
          status: 'finished' as const,
          winner: 'GrandMaster_X',
          score: '1-0',
          round: 1
        },
        {
          id: 'r1-m2',
          player1: { name: 'LightningBolt', rating: 1654, avatar: 'https://cdn.discordapp.com/embed/avatars/4.png' },
          player2: { name: 'ProPlayer', rating: 1890, avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' },
          status: 'playing' as const,
          round: 1
        },
          {
          id: 'r1-m3',
          player1: { name: 'LightningBolt', rating: 1654, avatar: 'https://cdn.discordapp.com/embed/avatars/4.png' },
          player2: { name: 'ProPlayer', rating: 1890, avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', isThirdPlace: true },
          status: 'playing' as const,
          round: 1
        }
      ],
      // RODADA 2 - Semifinal
      [
        {
          id: 'r2-m0',
          player1: { name: 'carloshenri', rating: 1841, avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' ,isChampion: true  },
          player2: { name: 'GrandMaster_X', rating: 1725, avatar: 'https://cdn.discordapp.com/embed/avatars/2.png' ,isSecondPlace: true},
          status: 'pending' as const,
          round: 2
        },
        {
          id: 'r2-m0',
          player1: { name: 'carloshenri', rating: 1841, avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' },
          player2: { name: 'GrandMaster_X', rating: 1725, avatar: 'https://cdn.discordapp.com/embed/avatars/2.png' },
          status: 'pending' as const,
          round: 2
          
        }
      ],
      
      // RODADA 3 - Final
      [
        {
          id: 'r3-m0',
          player1: null,
          player2: null,
          status: 'pending' as const,
          round: 3
        },
      ]
    ]
  };
  // ============================================

  const tournaments: Tournament[] = [
    {
      id: '1',
      name: 'Speed Infernal 2026',
      mode: 'Blitz',
      status: 'ongoing',
      startDate: 'Fevereiro 1, 2026 - 19:00',
      participants: 47,
      maxParticipants: 128,
      prizePool: '50.000 pontos Legion',
      description: 'Torneio oficial de Blitz com sistema de eliminação direta. Duração máxima de 3 minutos por jogador.',
      rules: `1. FORMATO E SISTEMA
• Sistema Suíço em 9 rodadas.
• Ritmo de jogo: 3 minutos + 0 segundos de incremento (3+0).
• O emparelhamento será realizado automaticamente pelo sistema.

2. PONTUAÇÃO E DESEMPATE
• Vitória: 1 ponto | Empate: 0.5 ponto | Derrota: 0 pontos.
• Critérios de desempate: Buchholz Cut 1, Sonneborn-Berger, Progressivo.

3. FAIR PLAY
• Uso de engines ou assistência externa resultará em banimento imediato e permanente.
• Jogadores com taxa de desconexão suspeita serão investigados.`,
      topParticipants: [
        { name: 'carloshenri', rating: 1841, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png' },
        { name: 'carloshenriam3', rating: 1756, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/1.png' },
        { name: 'GrandMaster_X', rating: 1725, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/2.png' },
        { name: 'BlitzKing', rating: 1698, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/3.png' },
        { name: 'LightningBolt', rating: 1654, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/4.png' }
      ]
    },
    {
      id: '2',
      name: 'Time of Calculo 2026',
      mode: 'Rapid',
      status: 'upcoming',
      startDate: 'Fevereiro 15, 2026 - 18:00',
      participants: 23,
      maxParticipants: 64,
      prizePool: '75.000 pontos Legion',
      description: 'Torneio oficial de Rápidas com sistema de eliminação direta. Duração máxima de 10 minutos por jogador',
      topParticipants: [
        { name: 'ProPlayer', rating: 1890, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png' },
        { name: 'TacticalMind', rating: 1823, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/1.png' },
        { name: 'carloshenri', rating: 1798, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/2.png' },
        { name: 'StrategyGamer', rating: 1775, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/3.png' },
        { name: 'RapidRush', rating: 1742, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/4.png' }
      ]
    },
    {
      id: '3',
      name: 'Bullet Champs 2026',
      mode: 'Bullet',
      status: 'upcoming',
      startDate: 'Janeiro 29, 2026 - 20:00',
      participants: 82,
      maxParticipants: 256,
      prizePool: '30.000 pontos Legion',
      description: 'Torneio oficial de Bullet com sistema de eliminação direta. Duração máxima de 1 minuto por jogador',
      topParticipants: [
        { name: 'BulletQueen', rating: 1765, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png' },
        { name: 'FastHands', rating: 1734, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/1.png' },
        { name: 'Blitz_Pro', rating: 1712, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/2.png' },
        { name: 'SpeedRunner', rating: 1689, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/3.png' },
        { name: 'MicroSeconds', rating: 1645, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/4.png' }
      ]
    },
       {
      id: '3',
      name: 'Chess Classic 2026',
      mode: 'Classico',
      status: 'upcoming',
      startDate: 'Janeiro 29, 2026 - 20:00',
      participants: 82,
      maxParticipants: 256,
      prizePool: '30.000 pontos Legion',
      description: 'Torneio oficial de Classico com sistema de eliminação direta. Duração máxima de 50 minutos por jogador.',
      topParticipants: [
        { name: 'BulletQueen', rating: 1765, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png' },
        { name: 'FastHands', rating: 1734, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/1.png' },
        { name: 'Blitz_Pro', rating: 1712, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/2.png' },
        { name: 'SpeedRunner', rating: 1689, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/3.png' },
        { name: 'MicroSeconds', rating: 1645, status: 'pending', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/4.png' }
      ]
    },
  ];

  const upcoming = tournaments.filter(t => t.status === 'upcoming');
  const ongoing = tournaments.filter(t => t.status === 'ongoing');
  const finished = tournaments.filter(t => t.status === 'finished');

  const getGradientForMode = (mode: string) => {
    switch (mode) {
      case 'Blitz': return 'from-red-900/30 via-black to-black';
      case 'Rapid': return 'from-blue-900/30 via-black to-black';
      case 'Bullet': return 'from-yellow-900/30 via-black to-black';
      case 'Classico': return 'from-purple-900/30 via-black to-black';
      default: return 'from-[#1a1a1a] via-[#0c0c0c] to-black';
    }
  };

  const getTextColor = (mode: string) => {
    switch (mode) {
      case 'Blitz': return 'text-red-500';
      case 'Rapid': return 'text-blue-500';
      case 'Bullet': return 'text-yellow-500';
      case 'Classico': return 'text-purple-500';
    }
  };

  const getHoverBorderColor = (mode: string) => {
    switch (mode) {
      case 'Blitz': return 'group-hover:border-red-500/20';
      case 'Rapid': return 'group-hover:border-blue-500/20';
      case 'Bullet': return 'group-hover:border-yellow-500/20';
      case 'Classico': return 'group-hover:border-purple-500/20';
      default: return 'group-hover:border-white/20';
    }
  };

  const renderTournamentCard = (tournament: Tournament) => (
    <article key={tournament.id} className="fade-in-section relative w-full group">
      <div className={`relative h-full bg-gradient-to-br ${getGradientForMode(tournament.mode)} border border-white/5 ${getHoverBorderColor(tournament.mode)} transition-colors duration-300 rounded-[1.8rem] p-1 overflow-hidden flex flex-col`}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative h-full bg-black/20 backdrop-blur-xl rounded-[1.6rem] p-6 flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                 <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                   {tournament.mode}
                 </span>
                 {tournament.status === 'ongoing' && (
                   <span className="flex h-2 w-2 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                   </span>
                 )}
              </div>
              <h3 className={`text-2xl font-black ${getTextColor(tournament.mode)} uppercase italic tracking-tighter leading-none transition-colors duration-300`}>
                {tournament.name}
              </h3>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
              tournament.status === 'upcoming' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
              tournament.status === 'ongoing' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
              'bg-gray-800/50 border-white/10 text-gray-500'
            }`}>
              {tournament.status === 'upcoming' ? 'Em Breve' :
               tournament.status === 'ongoing' ? 'Ao Vivo' : 'Finalizado'}
            </span>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-center transition-colors">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Premiação</span>
              <span className="text-xs font-bold text-yellow-500 truncate" title={tournament.prizePool}>
                {tournament.prizePool.split(' ')[0]} <span className="text-yellow-500/50">PTS</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-center transition-colors">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Participantes</span>
              <span className="text-xs font-bold text-white">
                {tournament.participants}<span className="text-gray-600">/</span>{tournament.maxParticipants}
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-6 font-medium border-l-2 border-red-500/20 pl-3">
            {tournament.description}
          </p>
          
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mb-6 bg-black/40 p-2 rounded-lg w-fit border border-white/5">
            <span>📅</span>
            <span className="uppercase tracking-wide">{tournament.startDate}</span>
          </div>

          {/* Participants */}
          <div className="mb-6 mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] uppercase font-bold text-gray-600 tracking-widest">Destaques</span>
            </div>
            <div className="flex items-center -space-x-2 pl-1">
              {tournament.topParticipants.slice(0, 5).map((p, i) => (
                <div key={i} className="relative group/avatar transition-transform hover:-translate-y-1 duration-300">
                  <img 
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-8 h-8 rounded-lg border-2 border-[#0c0c0c] bg-gray-800 object-cover shadow-lg"
                    title={`${p.name} (${p.rating})`}
                  />
                </div>
              ))}
              {tournament.participants > 5 && (
                <div className="w-8 h-8 rounded-lg border-2 border-[#0c0c0c] bg-red-900/20 text-red-500 flex items-center justify-center text-[9px] font-bold z-10">
                  +{tournament.participants - 5}
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-[1fr_1.5fr] gap-3 pt-4 border-t border-white/5">
             <button 
              onClick={() => setSelectedTournament(tournament)}
              className="py-3 rounded-xl bg-transparent hover:bg-white/5 text-gray-500 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all border border-white/10 hover:border-white/30"
            >
              Regras
            </button>

            {tournament.status === 'ongoing' && (
              <button 
                onClick={() => setBracketTournament(tournament)}
                className="py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-green-900/20 hover:shadow-green-600/40 border border-green-500/20 hover:scale-[1.02] active:scale-[0.98] group/btn"
              >
                🎯 Assistir <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
              </button>
            )}
            {tournament.status === 'upcoming' && (
              <a 
                href="https://discord.com/invite/n7kjQmfZGk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-900/20 hover:shadow-red-600/40 border border-red-500/20 hover:scale-[1.02] active:scale-[0.98] group/btn"
              >
                Inscrever-se <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
              </a>
            )}
            {tournament.status === 'finished' && (
              <button className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider transition-all border border-white/10 hover:border-white/30">
                Resultados
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <div className="space-y-20 animate-fadeIn pb-20">
      {/* Header */}
      <header className="text-center space-y-6 py-10">
        <h1 className="tech-font text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
          Torneios <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Oficiais</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-lg font-light leading-relaxed">
          Participe dos torneios oficiais do Legion Chess!
        </p>
      </header>

      {/* Ongoing Section */}
      {ongoing.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <h2 className="tech-font text-3xl font-bold text-white uppercase tracking-tight">Acontecendo Agora</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ongoing.map(renderTournamentCard)}
          </div>
        </section>
      )}

      {/* Upcoming Section */}
      <section>
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          <h2 className="tech-font text-3xl font-bold text-white uppercase tracking-tight">Próximos Torneios</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcoming.map(renderTournamentCard)}
        </div>
      </section>

      {/* Finished Section */}
      <section>
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <h2 className="tech-font text-3xl font-bold text-gray-400 uppercase tracking-tight">Arquivo de Torneios</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75 hover:opacity-100 transition-opacity duration-500">
          {finished.map(renderTournamentCard)}
        </div>
      </section>

      {/* Tournament Bracket Modal */}
      {bracketTournament && (
        <TournamentBracket 
          tournament={bracketTournament}
          bracketConfig={bracketConfig}
          onClose={() => setBracketTournament(null)}
        />
      )}

      {/* Rules Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedTournament(null)}>
          <div 
            className="bg-[#0a0a0a] border border-red-900/40 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl shadow-red-900/20 animate-slideIn" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-red-900/10">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Regras do Torneio</h3>
              <button onClick={() => setSelectedTournament(null)} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">
                &times;
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar bg-[#0a0a0a] scroll-smooth">
              <h4 className="text-lg font-bold text-red-500 mb-6 uppercase tracking-tight">{selectedTournament.name}</h4>
              <div className="text-gray-300 space-y-4 text-sm leading-relaxed whitespace-pre-line font-mono border-l-2 border-white/10 pl-4">
                {selectedTournament.rules || "As regras específicas para este torneio ainda não foram publicadas. Por favor, consulte o regulamento geral da Legion Chess ou entre em contato com a organização no Discord."}
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-[#0c0c0c] flex justify-end">
               <button 
                 onClick={() => setSelectedTournament(null)}
                 className="px-8 py-3 rounded-lg bg-white/5 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/10 hover:border-red-500"
               >
                 Entendido
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
