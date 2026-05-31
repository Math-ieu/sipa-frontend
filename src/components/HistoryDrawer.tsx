/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrickResult, Player, Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS, SUIT_LABELS } from '../utils/gameEngine';
import { X, History, Trophy, AlertTriangle } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tricksHistory: TrickResult[];
  players: Player[];
  currentRound: number;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  tricksHistory,
  players,
  currentRound,
}: HistoryDrawerProps) {
  const getPlayerName = (id: string) => {
    return players.find((p) => p.id === id)?.name || 'Joueur';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 cursor-pointer backdrop-blur-sm"
          />

          {/* Drawer - Frosted Glass panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-950/40 border-l border-white/10 text-slate-100 z-50 shadow-2xl flex flex-col backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-blue-400">
                <History className="w-5 h-5" />
                <h2 className="text-lg font-bold font-sans tracking-tight text-white">
                  Historique - Manche {currentRound}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {tricksHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3 text-center">
                  <div className="w-14 h-14 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                    <History className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Aucun pli joué</h3>
                    <p className="text-xs mt-1 max-w-xs px-6">
                      Les cartes s'afficheront ici à la fin de chaque pli du jeu.
                    </p>
                  </div>
                </div>
              ) : (
                tricksHistory.map((trick, index) => {
                  const leadPlay = trick.playedCards[0];
                  const startingSuit = leadPlay?.card.suit;
                  const winningPlayerName = getPlayerName(trick.winnerId);

                  return (
                    <div
                      key={trick.trickIndex}
                      className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-lg backdrop-blur-md"
                    >
                      {/* Round marker header */}
                      <div className="bg-white/5 px-4 py-2.5 flex items-center justify-between text-xs font-mono border-b border-white/10">
                        <span className="text-blue-400 font-black">
                          PLI #{index + 1}
                        </span>
                        <span className="text-slate-300 flex items-center gap-1.5">
                          Départ :{' '}
                          <span className={`${SUIT_COLORS[startingSuit as Suit]} font-bold`}>
                            {SUIT_SYMBOLS[startingSuit as Suit]} {SUIT_LABELS[startingSuit as Suit]}
                          </span>
                        </span>
                      </div>

                      {/* Played cards list */}
                      <div className="p-3 space-y-2">
                        {trick.playedCards.map((play) => {
                          const isLeadPlay = play.playerId === trick.leadPlayerId;
                          const isWinningPlay = play.playerId === trick.winnerId;
                          const isSacrifice = play.card.suit !== startingSuit;

                          return (
                            <div
                              key={play.playerId}
                              className={`flex items-center justify-between p-2.5 rounded-xl text-xs backdrop-blur-sm transition-all duration-200 ${
                                isWinningPlay
                                  ? 'bg-amber-400/10 border border-amber-400/30 shadow-[0_0_8px_rgba(251,191,36,0.1)]'
                                  : 'bg-black/30 border border-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-slate-100">
                                  {play.playerName}
                                </div>
                                {isLeadPlay && (
                                  <span className="bg-blue-500/15 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                                    MENEUR
                                  </span>
                                )}
                                {isSacrifice && (
                                  <span className="bg-red-500/15 text-red-300 border border-red-500/20 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5" /> SACRIFICE
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Card specification */}
                                {isSacrifice ? (
                                  <div className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-indigo-950/90 border border-indigo-500/30 text-[10px] font-mono font-bold text-indigo-300 shadow-xs relative overflow-hidden select-none">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse mr-0.5" />
                                    Dos
                                  </div>
                                ) : (
                                  <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white border border-slate-200 font-mono text-xs font-black shadow-xs ${
                                    play.card.suit === 'hearts' || play.card.suit === 'diamonds'
                                      ? 'text-red-600'
                                      : 'text-neutral-900'
                                  }`}>
                                    <span>{play.card.rank}</span>
                                    <span>{SUIT_SYMBOLS[play.card.suit]}</span>
                                  </div>
                                )}

                                {isWinningPlay && (
                                  <Trophy className="w-4 h-4 text-amber-400 fill-amber-400/10" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer announcement */}
                      <div className="bg-white/5 px-3 py-2 text-[10px] text-slate-300 border-t border-white/5 flex items-center justify-between">
                        <span>
                          Détenteur de la main : <strong className="text-white">{winningPlayerName}</strong>
                        </span>
                        <span className="text-amber-400 font-bold font-mono uppercase tracking-wider">
                          PREND LA MAIN
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Hint footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 text-[11px] text-slate-400 leading-normal text-center font-medium">
              Comptez les 7 sortis pour maximiser votre bonus lors de votre dernier pli !
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
