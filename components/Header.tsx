import React, { useState, useEffect } from 'react';
import { ViewState, SearchPlayer } from '../types.ts';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentView: ViewState;
  setView: (v: ViewState) => void;
  searchResults?: SearchPlayer[];
  onSelectPlayer?: (player: SearchPlayer) => void;
}

export default function Header({ searchQuery, onSearchChange, currentView, setView, searchResults = [], onSelectPlayer }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const burgerRef = React.useRef<HTMLButtonElement | null>(null);
  const firstNavRef = React.useRef<HTMLButtonElement | null>(null);

  // Bloqueia o scroll do fundo quando o menu está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Handle Escape key and focus management for accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        burgerRef.current?.focus();
      }
      if (e.key === 'Tab' && isMenuOpen) {
        // simple trap: if Shift+Tab on first element, move focus to burger to avoid leaving
        // (full focus trap is out of scope here)
      }
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', onKey);
      // move focus to first nav button when opening
      setTimeout(() => firstNavRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  const navItems = [
    { label: 'Home', view: 'home' },
    { label: 'Ranking', view: 'rankings' },
    { label: 'Torneios Oficiais', view: 'tournaments' },
    { label: 'Regulamentos', view: 'regulations' }
  ];

  const handleNavClick = (view: string) => {
    setView(view as ViewState);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-[100] bg-black/100 backdrop-blur-2xl border-b border-red-900/20 h-20">
      {/* Barra Superior - Sempre no TOPO de tudo */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between relative z-[130]">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => handleNavClick('home')}
        >
          <div className="w-20 h-20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all p-1">
            <img 
              src="/legion.gif" 
              alt="Legion Chess" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="tech-font text-xl font-black text-white tracking-tighter hidden xs:block">
            LEGION <span className="text-red-600">CHESS</span>
          </span>
        </div>

        {/* Navegação Desktop */}
        <nav className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.view)}
              className={`tech-font text-[10px] uppercase font-bold tracking-[0.2em] transition-all hover:text-red-500 relative py-2 group ${
                currentView === item.view ? 'text-red-500 text-glow-red' : 'text-gray-400'
              }`}
            >
              {item.label}
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-red-600 transform origin-left transition-transform duration-300 ${currentView === item.view ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}></span>
            </button>
          ))}
        </nav>

        {/* Search Bar - Desktop */}
        <div 
          className="hidden lg:block relative group mx-6"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="LOCALIZAR..."
            className="bg-black/50 border border-red-900/30 rounded-full px-4 py-2 text-[10px] text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all tech-font w-40 focus:w-64 uppercase"
          />
          
          {/* Search Results Dropdown */}
          {searchQuery.length > 2 && searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-64 bg-[#0a0a0a] border border-red-900/30 rounded-xl mt-2 shadow-2xl overflow-hidden z-50 flex flex-col">
              {searchResults.map((player) => (
                <button
                  key={player.id_discord}
                  onClick={() => onSelectPlayer?.(player)}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <img 
                    src={player.avatar_url} 
                    alt={player.nome}
                    className="w-8 h-8 rounded-full bg-black object-cover"
                  />
                  <div>
                    <div className="text-white text-xs font-bold">{player.nome}</div>
                    <div className="text-red-500 text-[10px] font-mono">Rating: {player.rating}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-4">
          <a 
            href="https://discord.com/invite/n7kjQmfZGk" 
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex bg-red-600/10 hover:bg-red-600 border border-red-600/50 text-red-500 hover:text-white px-5 py-2 rounded-lg tech-font text-[9px] font-bold transition-all uppercase tracking-widest active:scale-95 shadow-lg shadow-red-600/5"
          >
            Entrar Discord
          </a>

          {/* Botão Hambúrguer - Agora com Z-Index altíssimo garantido */}
          <button 
            ref={burgerRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden w-12 h-12 flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all active:scale-90 ${
              isMenuOpen ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/40' : 'bg-red-600/5 border-red-900/20'
            }`}
            aria-label={isMenuOpen ? "Fechar Menu" : "Abrir Menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className={`w-6 h-0.5 transition-all duration-300 transform ${isMenuOpen ? 'bg-white rotate-45 translate-y-2' : 'bg-red-600'}`} />
            <span className={`w-6 h-0.5 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'bg-red-600 opacity-100'}`} />
            <span className={`w-6 h-0.5 transition-all duration-300 transform ${isMenuOpen ? 'bg-white -rotate-45 -translate-y-2' : 'bg-red-600'}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu: slide-in panel from right with backdrop */}
      {isMenuOpen && (
        <>
          {/* Backdrop - fechável */}
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className="fixed top-0 right-0 h-screen w-72 bg-black z-50 lg:hidden shadow-2xl"
          >
            {/* Header do Menu */}
            <div className="flex items-center justify-between p-6 border-b border-red-900/20">
              <h3 className="tech-font text-white font-black uppercase">Menu</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                aria-label="Fechar menu"
              >
                <span className="text-white text-xl">✕</span>
              </button>
            </div>

            {/* Search - Mobile */}
            <div 
              className="p-6 pb-0"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="LOCALIZAR..."
                className="w-full bg-[#111] border border-red-900/30 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-all tech-font uppercase"
              />
            </div>

            {/* Navigation */}
            <nav className="p-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.view)}
                  className={`w-full text-left px-4 py-3 rounded-lg tech-font font-bold uppercase text-sm transition-all ${
                    currentView === item.view
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Discord Button */}
            <div className="p-6 space-y-4 mt-auto">
              <a
                href="https://discord.com/invite/n7kjQmfZGk"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg tech-font font-bold uppercase text-center transition-colors"
              >
                Entrar Discord
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}