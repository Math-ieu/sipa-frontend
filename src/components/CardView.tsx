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
        ${sizeClasses[size]} 
        relative  border select-none transition-all duration-300 overflow-hidden
        ${isWinning 
          ? 'bg-gradient-to-br from-white to-amber-50/70 border-amber-500 text-slate-900 shadow-[0_0_25px_rgba(245,158,11,0.55)] cursor-pointer ring-2 ring-amber-400/45' 
          : canPlay && onClick
            ? 'bg-white border-slate-200 text-slate-950 hover:border-blue-500 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-pointer shadow-sm'
            : 'bg-neutral-50/90 border-slate-200 text-neutral-400 opacity-55 cursor-not-allowed shadow-none'
        }
      `}
      whileHover={canPlay && onClick ? { scale: 1.06, y: -8, zIndex: 10 } : {}}
      whileTap={canPlay && onClick ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
    >
      {/* Top Left Indicator */}
      <div className="absolute top-1 left-1 md:top-1.5 md:left-1.5 flex flex-col items-center leading-none">
        <span className={`font-sans font-black tracking-tight leading-none ${suitColorClass}`}>
          {card.rank}
        </span>
        <span className={`text-[10px] md:text-sm ${suitColorClass} filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]`}>
          {symbol}
        </span>
      </div>

      {/* Middle Huge Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-2xl md:text-4xl select-none ${suitColorClass} opacity-90 font-serif filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]`}>
          {symbol}
        </span>
      </div>

      {/* Bottom Right Indicator */}
      <div className="absolute bottom-1 right-1 md:bottom-1.5 md:right-1.5 flex flex-col items-center leading-none rotate-180">
        <span className={`font-sans font-black tracking-tight leading-none ${suitColorClass}`}>
          {card.rank}
        </span>
        <span className={`text-[10px] md:text-sm ${suitColorClass} filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]`}>
          {symbol}
        </span>
      </div>



      {/* Follow-suit Lock Overlay - Clean frosted lock */}
      {!canPlay && (
        <div className="absolute inset-0 bg-slate-950/40 rounded-[inherit] flex items-center justify-center flex-col gap-1 pointer-events-none backdrop-blur-xs">
          <Lock className="w-4 h-4 text-white drop-shadow-md" />
          <span className="text-[8px] md:text-[9px] text-white text-center font-bold px-1.5 py-0.5 bg-black/60 rounded uppercase tracking-wider font-mono">
            {suitLabel}
          </span>
        </div>
      )}
    </motion.div>
  );
}
