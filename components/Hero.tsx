
import React, { useEffect, useRef, useState } from 'react';

// Added interface for Hero props
interface HeroProps {
  onAction?: () => void;
  onTournaments?: () => void;
}

export default function Hero({ onAction, onTournaments }: HeroProps) {
  const parallaxRef = useRef<HTMLImageElement>(null);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        // Move a imagem para baixo a 30% da velocidade do scroll para criar o efeito de profundidade
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const text = "Batalhe pelo TRONO";
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative rounded-3xl overflow-hidden border border-red-900/20 bg-black">
      <div className="absolute inset-0 opacity-40">
        <img 
          ref={parallaxRef}
          src="https://picsum.photos/seed/tech/1200/400" 
          alt="Hero background" 
          className="absolute w-full h-[150%] object-cover grayscale -top-[25%] will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      </div>
      
      <div className="relative z-10 p-10 md:p-16 max-w-2xl space-y-6">
        <div className="inline-block px-3 py-1 bg-red-600/20 border border-red-600/40 rounded text-red-500 tech-font text-[10px] font-bold uppercase tracking-widest">
          Season 2026
        </div>
        <h1 className="text-5xl md:text-7xl font-black tech-font text-white leading-tight uppercase">
          {displayText.slice(0, 13)}<span className="text-red-600 text-glow-red italic">{displayText.slice(13)}</span>
          <span className="animate-pulse text-red-500">_</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-md">
          Junte-se a milhares de competidores de elite do xadrez online.
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
          <StatBox label="Eventos Oficiais" value="4" />
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
