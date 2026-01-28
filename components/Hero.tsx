
import React from 'react';

// Added interface for Hero props
interface HeroProps {
  onAction?: () => void;
  onTournaments?: () => void;
}

export default function Hero({ onAction, onTournaments }: HeroProps) {
  return (
    <section className="relative rounded-3xl overflow-hidden border border-red-900/20 bg-black">
      <div className="absolute inset-0 opacity-40">
        <img 
          src="https://picsum.photos/seed/tech/1200/400" 
          alt="Hero background" 
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      </div>
      
      <div className="relative z-10 p-10 md:p-16 max-w-2xl space-y-6">
        <div className="inline-block px-3 py-1 bg-red-600/20 border border-red-600/40 rounded text-red-500 tech-font text-[10px] font-bold uppercase tracking-widest">
          Season 2026
        </div>
        <h1 className="text-5xl md:text-7xl font-black tech-font text-white leading-tight uppercase">
          Claim Your <span className="text-red-600 text-glow-red italic">Legacy</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-md">
          Join thousands of elite competitors in the world's most advanced digital combat ranking system.
        </p>
        <div className="flex gap-4 pt-4">
          <a
            href="https://discord.com/invite/n7kjQmfZGk"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl tech-font font-bold text-sm transition-all shadow-xl shadow-red-600/20 flex items-center gap-2 group"
          >
            ENTRE NA COMUNIDADE
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <button onClick={onTournaments} className="border border-white/10 hover:bg-white/5 text-white px-6 py-2 rounded-xl tech-font font-bold text-sm transition-all">
            TORNEIOS OFICIAIS
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 p-8 hidden xl:block opacity-60">
        <div className="flex gap-12">
          <StatBox label="Jogadores Ativos" value="700" />
          <StatBox label="Premio Geral" value="--" />
          <StatBox label="Eventos Oficiais" value="6" />
        </div>
      </div>
    </section>
  );
}

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-right">
    <div className="text-xs text-red-500 tech-font uppercase tracking-widest font-bold mb-1">{label}</div>
    <div className="text-3xl text-white tech-font font-black">{value}</div>
  </div>
);
