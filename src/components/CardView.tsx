/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Card, Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS, SUIT_LABELS } from '../utils/gameEngine';
import { Lock } from 'lucide-react';

interface CardViewProps {
  key?: string | number;
  card: Card;
  faceUp?: boolean;
  canPlay?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  isWinning?: boolean;
}

export function CardView({
  card,
  faceUp = true,
  canPlay = true,
  onClick,
  size = 'md',
  isWinning = false,
}: CardViewProps) {
  const symbol = SUIT_SYMBOLS[card.suit];
  const colorClass = SUIT_COLORS[card.suit];

  const sizeClasses = {
    sm: 'w-12 h-18 text-[10px] md:w-14 md:h-20 md:text-xs rounded-lg shadow-md',
    md: 'w-16 h-24 text-xs rounded-xl shadow-lg md:w-24 md:h-36 md:text-base',
    lg: 'w-24 h-34 text-sm rounded-2xl shadow-xl md:w-32 md:h-44 md:text-lg',
  };

  const rankSizeClasses = {
    sm: 'text-[9px] md:text-[11px]',
    md: 'text-xs md:text-base',
    lg: 'text-sm md:text-xl',
  };

  const symbolSizeClasses = {
    sm: 'text-[8px] md:text-[10px]',
    md: 'text-[10px] md:text-sm',
    lg: 'text-xs md:text-lg',
  };

  const middleSymbolSizeClasses = {
    sm: 'text-lg md:text-2xl',
    md: 'text-2xl md:text-4xl',
    lg: 'text-4xl md:text-6xl',
  };

  const suitLabel = SUIT_LABELS[card.suit];

  // Face down design (Back of the card) - Frosted Glass style
  if (!faceUp) {
    return (
      <motion.div
        className={`${sizeClasses[size]} relative flex items-center justify-center bg-gradient-to-br from-indigo-950/80 via-slate-950/90 to-purple-950/80 border border-white/15 backdrop-blur-md select-none overflow-hidden shadow-2xl`}
        whileHover={onClick ? { scale: 1.05, y: -4 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Futuristic Card Pattern Back */}
        <div className="absolute inset-1 rounded-lg border border-white/5 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-2 bg-gradient-to-br from-slate-950/90 to-slate-900/90 rounded-md flex flex-col items-center justify-center border border-white/10 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(99,102,241,0.25)]">
          <div className="text-indigo-400 font-mono tracking-widest text-[9px] md:text-xs font-black select-none uppercase">
            SIPA
          </div>
          <div className="w-5 h-5 rounded-full border border-indigo-400/40 mt-1.5 flex items-center justify-center bg-indigo-500/10 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Frosted dynamic card style with high-contrast text and glowing interactions
  const pokerSuitColors: Record<Suit, string> = {
    spades: 'text-neutral-900', // Pique en noir
    hearts: 'text-red-600',    // Cœur en rouge
    diamonds: 'text-red-500',  // Carreau en rouge
    clubs: 'text-neutral-900',  // Trèfle en noir
  };

  const suitColorClass = pokerSuitColors[card.suit];

  return (
    <motion.div
      onClick={canPlay && onClick ? onClick : undefined}
      className={`
        ${sizeClasses[size]} playing-card
        relative border select-none transition-all duration-300 overflow-hidden
        ${isWinning 
          ? 'bg-gradient-to-br from-white via-amber-50/90 to-amber-100/70 border-amber-500 text-slate-950 shadow-[0_12px_28px_rgba(245,158,11,0.45)] cursor-pointer ring-2 ring-amber-400/40' 
          : canPlay && onClick
            ? 'bg-gradient-to-b from-white to-slate-50/95 border-slate-250 text-slate-950 hover:border-blue-500 hover:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.3)] cursor-pointer shadow-md'
            : 'bg-slate-100/90 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed shadow-none'
        }
      `}
      whileHover={canPlay && onClick ? { scale: 1.06, y: -8, zIndex: 10 } : {}}
      whileTap={canPlay && onClick ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
    >
      {/* Premium Inner Cardstock Border */}
      <div className={`absolute inset-1 md:inset-1.5 border rounded-[inherit] pointer-events-none ${
        isWinning ? 'border-amber-200/40' : 'border-slate-100/80'
      }`} />

      {/* Top Left Indicator */}
      <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 flex flex-col items-center leading-none">
        <span className={`font-sans font-black tracking-tight leading-none ${rankSizeClasses[size]} ${suitColorClass}`}>
          {card.rank}
        </span>
        <span className={`${symbolSizeClasses[size]} ${suitColorClass} filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]`}>
          {symbol}
        </span>
      </div>

      {/* Middle Huge Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`${middleSymbolSizeClasses[size]} select-none ${suitColorClass} opacity-85 font-serif filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)]`}>
          {symbol}
        </span>
      </div>

      {/* Bottom Right Indicator */}
      <div className="absolute bottom-1.5 right-1.5 md:bottom-2 md:right-2 flex flex-col items-center leading-none rotate-180">
        <span className={`font-sans font-black tracking-tight leading-none ${rankSizeClasses[size]} ${suitColorClass}`}>
          {card.rank}
        </span>
        <span className={`${symbolSizeClasses[size]} ${suitColorClass} filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]`}>
          {symbol}
        </span>
      </div>

      {/* Follow-suit Lock Overlay - High-end Glassmorphic style */}
      {!canPlay && (
        <div className="absolute inset-0 bg-slate-950/45 rounded-[inherit] flex items-center justify-center flex-col gap-1.5 pointer-events-none backdrop-blur-[2px] transition-all duration-300">
          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center shadow-lg shadow-black/30 transform scale-90 md:scale-100">
            <Lock className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/90" />
          </div>
          <span className="text-[7.5px] md:text-[9px] text-slate-200 text-center font-mono font-bold tracking-wider px-2 py-0.5 bg-slate-950/80 border border-white/10 rounded-full shadow-md uppercase">
            {suitLabel}
          </span>
        </div>
      )}
    </motion.div>
  );
}
