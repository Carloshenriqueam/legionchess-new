
export interface Achievement {
  id: string;
  achievement_name: string;
  description: string;
  achievement_type: string;
  value?: string;
  unlocked_at: string;
}

export interface Match {
  id: string;
  oponente_nome: string;
  resultado: 'Vitória' | 'Derrota' | 'Empate';
  modo: string;
  time_control: string;
  rating_antes: number;
  rating_depois: number;
  variacao_rating: string;
  data: string;
  link_partida?: string;
}

export interface PlayerStats {
  rating: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  partidas_jogadas: number;
}

export interface Player {
  id_discord: string;
  nome: string;
  avatar_url: string;
  rank: number;
  estatisticas: {
    bullet?: PlayerStats;
    blitz?: PlayerStats;
    rapid?: PlayerStats;
    classic?: PlayerStats;
  };
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  time_control: string;
  nb_rounds: number;
  participant_count: number;
  participants: Array<{ name: string; rating: number }>;
}

export type GameMode = 'blitz' | 'rapid' | 'bullet' | 'classic';
export type ViewState = 'home' | 'rankings' | 'regulations' | 'tournaments';
