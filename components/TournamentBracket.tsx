import React, { useState, useEffect } from 'react';

interface BracketMatch {
  id: string;
  player1: {
    name: string;
    rating: number;
    avatar?: string;
    isChampion?: boolean;
    isSecondPlace?: boolean;
    isThirdPlace?: boolean;
  } | null;
  player2: {
    name: string;
    rating: number;
    avatar?: string;
    isChampion?: boolean;
    isSecondPlace?: boolean;
    isThirdPlace?: boolean;
  } | null;
  winner?: string;
  score?: string;
  status: 'pending' | 'playing' | 'finished';
  round: number;
}

interface Participant {
  name: string;
  rating: number;
  status?: 'qualified' | 'pending' | 'eliminated';
  avatarUrl?: string;
}

interface BracketProps {
  tournament: {
    id: string;
    name: string;
    mode: string;
    status: 'upcoming' | 'ongoing' | 'finished';
    topParticipants?: Participant[];
  };
  // Configuração completa do bracket via código
  bracketConfig?: {
    rounds: BracketMatch[][];
  };
  // Ou gerar automaticamente dos participantes
  autoGenerate?: boolean;
  onClose: () => void;
}

// Gerar bracket inicial a partir dos participantes
const generateBracket = (participants: Participant[]): BracketMatch[][] => {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  
  const rounds: BracketMatch[][] = [];
  let currentRound: BracketMatch[] = [];
  
  for (let i = 0; i < shuffled.length; i += 2) {
    const match: BracketMatch = {
      id: `r1-m${i / 2}`,
      player1: shuffled[i] ? {
        name: shuffled[i].name,
        rating: shuffled[i].rating,
        avatar: shuffled[i].avatarUrl
      } : null,
      player2: shuffled[i + 1] ? {
        name: shuffled[i + 1].name,
        rating: shuffled[i + 1].rating,
        avatar: shuffled[i + 1].avatarUrl
      } : null,
      status: 'pending',
      round: 1
    };
    
    if (Math.random() > 0.5) {
      match.status = 'finished';
      match.winner = match.player1?.name || '';
      match.score = '1-0';
    }
    
    currentRound.push(match);
  }
  rounds.push(currentRound);
  
  let matchesInRound = Math.floor(currentRound.length / 2);
  let roundNumber = 2;
  
  while (matchesInRound > 0) {
    currentRound = [];
    for (let i = 0; i < matchesInRound; i++) {
      const match: BracketMatch = {
        id: `r${roundNumber}-m${i}`,
        player1: null,
        player2: null,
        status: 'pending',
        round: roundNumber
      };
      currentRound.push(match);
    }
    rounds.push(currentRound);
    matchesInRound = Math.floor(matchesInRound / 2);
    roundNumber++;
  }
  
  return rounds;
};

export default function TournamentBracket({ tournament, bracketConfig, autoGenerate = false, onClose }: BracketProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  // Desativar scroll quando modal estiver aberto
  useEffect(() => {
    if (!isClosing) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isClosing]);
  
  // Usar configuração fornecida ou gerar automaticamente
  const bracket = bracketConfig?.rounds || (autoGenerate && tournament.topParticipants ? generateBracket(tournament.topParticipants) : []);
  
  const totalRounds = bracket.length;
  const finalRound = bracket[totalRounds - 1];
  
  // Determinar vencedor: explícito pelo status isChampion ou vencedor da última rodada
  let winner = finalRound?.[0]?.winner;
  let secondPlace: string | undefined;
  let thirdPlace: string | undefined;
  
  // Scan for explicit statuses
  bracket.forEach(round => round.forEach(match => {
    if (match.player1?.isChampion) winner = match.player1.name;
    if (match.player2?.isChampion) winner = match.player2.name;
    
    if (match.player1?.isSecondPlace) secondPlace = match.player1.name;
    if (match.player2?.isSecondPlace) secondPlace = match.player2.name;
    
    if (match.player1?.isThirdPlace) thirdPlace = match.player1.name;
    if (match.player2?.isThirdPlace) thirdPlace = match.player2.name;
  }));

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const getRoundLabel = (roundNum: number) => {
    const roundLabels: { [key: number]: string } = {
      1: 'Rodada 1',
      2: 'Rodada 2',
      3: 'Rodada 3',
      4: 'Rodada 4',
      5: 'Rodada 5'
    };
    return roundLabels[roundNum] || `Rodada ${roundNum}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished': return 'text-green-500';
      case 'playing': return 'text-yellow-500 animate-pulse';
      case 'pending': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const MatchCard = ({ match }: { match: BracketMatch }) => {
    const isWinner1 = match.winner === match.player1?.name;
    const isWinner2 = match.winner === match.player2?.name;
    const isTournamentWinner1 = (winner && match.player1?.name === winner) || match.player1?.isChampion;
    const isTournamentWinner2 = (winner && match.player2?.name === winner) || match.player2?.isChampion;
    
    const isSecond1 = match.player1?.isSecondPlace;
    const isSecond2 = match.player2?.isSecondPlace;
    const isThird1 = match.player1?.isThirdPlace;
    const isThird2 = match.player2?.isThirdPlace;

    const score1 = match.score ? match.score.split('-')[0] : '';
    const score2 = match.score ? match.score.split('-')[1] : '';

    return (
      <div className={`w-full bg-[#0c0c0c] border ${match.status === 'playing' ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-white/10'} rounded-xl overflow-hidden hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-red-900/20 group/card relative`}>
        {/* Status Indicator Strip */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${match.status === 'playing' ? 'bg-yellow-500 animate-pulse' : match.status === 'finished' ? 'bg-green-500' : 'bg-gray-800'}`}></div>
        
        {/* Player 1 */}
        <div className={`pl-4 pr-3 py-3 border-b border-white/5 flex items-center gap-3 ${
            isTournamentWinner1 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : 
            isSecond1 ? 'bg-gradient-to-r from-gray-400/10 to-transparent' :
            isThird1 ? 'bg-gradient-to-r from-orange-700/10 to-transparent' :
            isWinner1 ? 'bg-gradient-to-r from-green-900/20 to-transparent' : ''
        } transition-colors`}>
          {match.player1 ? (
            <>
              <div className="relative">
                <img 
                  src={match.player1.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt={match.player1.name}
                  className={`w-8 h-8 rounded-md object-cover border ${
                      isTournamentWinner1 ? 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 
                      isSecond1 ? 'border-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.4)]' :
                      isThird1 ? 'border-orange-700 shadow-[0_0_8px_rgba(194,65,12,0.4)]' :
                      isWinner1 ? 'border-green-500' : 'border-white/10'
                  }`}
                />
                {isTournamentWinner1 && (
                   <div className="absolute -top-3 -left-2 z-20">
                     <img src="/league_champion.0017401b.png" alt="Campeão da Semana" className="w-5 h-5 drop-shadow-lg animate-bounce" />
                   </div>
                )}
                {isSecond1 && (
                   <div className="absolute -top-2 -left-1 text-gray-300 z-20 text-[10px] filter drop-shadow-lg animate-bounce">
                     🥈
                   </div>
                )}
                {isThird1 && (
                   <div className="absolute -top-2 -left-1 text-orange-600 z-20 text-[10px] filter drop-shadow-lg animate-bounce">
                     🥉
                   </div>
                )}
                {isWinner1 && !isTournamentWinner1 && !isSecond1 && !isThird1 && (
                   <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border border-black z-10">
                     <svg className="w-2 h-2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                   </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
                <div className="truncate">
                  <div className={`text-xs font-bold ${
                      isTournamentWinner1 ? 'text-yellow-400' : 
                      isSecond1 ? 'text-gray-300' :
                      isThird1 ? 'text-orange-400' :
                      isWinner1 ? 'text-green-400' : 'text-gray-200'
                  } truncate`}>{match.player1.name}</div>
                  <div className="text-[9px] text-gray-500 font-mono">{match.player1.rating}</div>
                </div>
                {match.score && <span className={`font-black text-sm ${isWinner1 ? 'text-green-500' : 'text-gray-600'}`}>{score1}</span>}
              </div>
            </>
          ) : (
            <div className="flex-1 text-center text-gray-700 italic text-[10px] py-1 uppercase tracking-wider">
              Aguardando...
            </div>
          )}
        </div>

        {/* Player 2 */}
        <div className={`pl-4 pr-3 py-3 flex items-center gap-3 ${
            isTournamentWinner2 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : 
            isSecond2 ? 'bg-gradient-to-r from-gray-400/10 to-transparent' :
            isThird2 ? 'bg-gradient-to-r from-orange-700/10 to-transparent' :
            isWinner2 ? 'bg-gradient-to-r from-green-900/20 to-transparent' : ''
        } transition-colors`}>
          {match.player2 ? (
            <>
              <div className="relative">
                <img 
                  src={match.player2.avatar || 'https://cdn.discordapp.com/embed/avatars/1.png'}
                  alt={match.player2.name}
                  className={`w-8 h-8 rounded-md object-cover border ${
                      isTournamentWinner2 ? 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 
                      isSecond2 ? 'border-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.4)]' :
                      isThird2 ? 'border-orange-700 shadow-[0_0_8px_rgba(194,65,12,0.4)]' :
                      isWinner2 ? 'border-green-500' : 'border-white/10'
                  }`}
                />
                {isTournamentWinner2 && (
                   <div className="absolute -top-3 -left-2 z-20">
                     <img src="/league_champion.0017401b.png" alt="Campeão da Semana" className="w-5 h-5 drop-shadow-lg animate-bounce" />
                   </div>
                )}
                {isSecond2 && (
                   <div className="absolute -top-2 -left-1 text-gray-300 z-20 text-[10px] filter drop-shadow-lg animate-bounce">
                     🥈
                   </div>
                )}
                {isThird2 && (
                   <div className="absolute -top-2 -left-1 text-orange-600 z-20 text-[10px] filter drop-shadow-lg animate-bounce">
                     🥉
                   </div>
                )}
                {isWinner2 && !isTournamentWinner2 && !isSecond2 && !isThird2 && (
                   <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border border-black z-10">
                     <svg className="w-2 h-2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                   </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
                <div className="truncate">
                  <div className={`text-xs font-bold ${
                      isTournamentWinner2 ? 'text-yellow-400' : 
                      isSecond2 ? 'text-gray-300' :
                      isThird2 ? 'text-orange-400' :
                      isWinner2 ? 'text-green-400' : 'text-gray-200'
                  } truncate`}>{match.player2.name}</div>
                  <div className="text-[9px] text-gray-500 font-mono">{match.player2.rating}</div>
                </div>
                {match.score && <span className={`font-black text-sm ${isWinner2 ? 'text-green-500' : 'text-gray-600'}`}>{score2}</span>}
              </div>
            </>
          ) : (
            <div className="flex-1 text-center text-gray-700 italic text-[10px] py-1 uppercase tracking-wider">
              Aguardando...
            </div>
          )}
        </div>

        {/* Footer info */}
        {match.status === 'playing' && (
           <div className="bg-yellow-500/10 py-1 px-3 flex justify-center items-center gap-2 border-t border-yellow-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
             <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">Em Andamento</span>
           </div>
        )}
        {match.status === 'pending' && !match.player1 && !match.player2 && (
           <div className="bg-white/5 py-1 px-3 flex justify-center items-center border-t border-white/5">
             <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Aguardando Definição</span>
           </div>
        )}
      </div>
    );
  };

  if (bracket.length === 0) {
    return (
      <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 ${isClosing ? 'backdrop-fade-out' : 'backdrop-fade'}`} style={{ backdropFilter: isClosing ? 'blur(0px)' : 'blur(4px)' }}>
        <div className="absolute inset-0 bg-black/60 modal-backdrop" onClick={handleClose} />
        
        <div className={`relative w-full max-w-2xl bg-[#080808] border border-red-900/30 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(230,57,70,0.15)] flex flex-col p-8 ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
              {tournament.name}
            </h2>
            <p className="text-gray-400">Nenhum bracket configurado</p>
            <p className="text-sm text-gray-500">
              Passe <code className="bg-black/50 px-2 py-1 rounded text-red-400">bracketConfig</code> ou ative <code className="bg-black/50 px-2 py-1 rounded text-red-400">autoGenerate</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 ${isClosing ? 'backdrop-fade-out' : 'backdrop-fade'}`} style={{ backdropFilter: isClosing ? 'blur(0px)' : 'blur(4px)' }}>
      <div className="absolute inset-0 bg-black/60 modal-backdrop" onClick={handleClose} />
      
      <div className={`relative w-full max-w-[95vw] bg-[#080808] border border-red-900/30 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(230,57,70,0.15)] flex flex-col max-h-[90vh] ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-8 border-b border-red-900/20 bg-gradient-to-r from-red-900/10 to-transparent flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
              Bracket do Torneio
            </h2>
            <p className="text-red-500 text-sm mt-2">{tournament.name}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 p-1">
              <button 
                onClick={() => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-xs font-mono font-bold text-gray-500 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={() => setZoom(z => Math.min(1.5, parseFloat((z + 0.1).toFixed(1))))}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Zoom In"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto overflow-x-auto custom-scrollbar flex-grow bg-grid scroll-smooth">
          <div 
            className="p-12 min-w-max flex flex-col min-h-[600px] transition-transform duration-200 ease-out"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
            {/* Rounds Layout */}
            <div className="flex flex-col gap-8">
              {/* Round Headers */}
              <div className="flex gap-16 items-start">
                {bracket.map((round, roundIdx) => (
                  <div key={`header-${roundIdx}`} className="w-72 text-center">
                    <h3 className="tech-font text-xs font-bold text-red-500 uppercase tracking-[0.3em] bg-[#080808]/80 backdrop-blur px-4 py-1 rounded-full border border-red-900/20 inline-block">
                      {getRoundLabel(round[0]?.round || roundIdx + 1)}
                    </h3>
                  </div>
                ))}
              </div>

              {/* Brackets */}
              <div className="flex gap-16 items-stretch flex-grow">
                {bracket.map((round, roundIdx) => (
                  <div key={roundIdx} className="flex flex-col w-72 relative">

                  {/* Matches */}
                  <div className="flex flex-col flex-grow justify-around relative">
                    {round.map((match, matchIdx) => (
                      <div key={match.id} className="flex-1 flex flex-col justify-center relative group px-2">
                        <div className="relative z-10">
                           <MatchCard match={match} />
                        </div>

                        {/* Right Connectors (Outgoing) */}
                        {roundIdx < bracket.length - 1 && (
                          <>
                            {matchIdx % 2 === 0 ? (
                              <div className="absolute right-[-32px] top-1/2 w-8 h-[50%] border-r-2 border-t-2 border-red-500/30 rounded-tr-xl pointer-events-none group-hover:border-red-500 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-300"></div>
                            ) : (
                              <div className="absolute right-[-32px] bottom-1/2 w-8 h-[50%] border-r-2 border-b-2 border-red-500/30 rounded-br-xl pointer-events-none group-hover:border-red-500 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-300"></div>
                            )}
                          </>
                        )}

                        {/* Left Connectors (Incoming) */}
                        {roundIdx > 0 && (
                          <div className="absolute left-[-32px] top-1/2 w-10 h-0.5 bg-red-500/30 pointer-events-none group-hover:bg-red-500 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-300"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              </div>
            </div>

            {/* Winner Announcement */}
            {(winner || secondPlace || thirdPlace) && (
              <div className="mt-12 pt-12 border-t border-red-900/30 text-center animate-fadeIn">
                {winner && (
                  <div className="inline-block p-8 rounded-3xl bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/30 relative overflow-hidden mb-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.2),transparent_70%)]"></div>
                    <div className="relative z-10">
                      <div className="text-sm uppercase tracking-[0.5em] text-yellow-500 font-bold mb-4">Grande Campeão</div>
                      <div className="text-5xl font-black text-white uppercase tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                        🏆 {winner}
                      </div>
                      <div className="text-gray-400 text-xs font-mono uppercase tracking-wider mt-2">Vencedor do Torneio</div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center gap-8 flex-wrap">
                  {secondPlace && (
                    <div className="inline-block p-6 rounded-2xl bg-gradient-to-b from-gray-400/10 to-transparent border border-gray-400/30 relative overflow-hidden">
                      <div className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-2">Vice-Campeão</div>
                      <div className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(156,163,175,0.5)]">🥈 {secondPlace}</div>
                    </div>
                  )}
                  {thirdPlace && (
                    <div className="inline-block p-6 rounded-2xl bg-gradient-to-b from-orange-700/10 to-transparent border border-orange-700/30 relative overflow-hidden">
                      <div className="text-xs uppercase tracking-[0.3em] text-orange-600 font-bold mb-2">Terceiro Lugar</div>
                      <div className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(194,65,12,0.5)]">🥉 {thirdPlace}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0c0c0c] p-6 border-t border-red-900/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">
              Status: <span className={`ml-2 ${tournament.status === 'ongoing' ? 'text-green-500' : 'text-blue-500'}`}>
                {tournament.status === 'ongoing' ? 'Ao Vivo' : tournament.status === 'finished' ? 'Finalizado' : 'Em Breve'}
              </span>
            </div>
            <button 
              onClick={handleClose}
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
