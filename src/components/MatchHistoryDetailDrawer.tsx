/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Trophy, User, Bot, Smartphone, Globe, ChevronDown, ChevronUp, AlertTriangle, Award } from 'lucide-react';
import { SUIT_SYMBOLS, SUIT_COLORS, SUIT_LABELS } from '../utils/gameEngine';
import { Suit } from '../types';

interface MatchHistoryDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
  activePlayerId: string;
}

export function MatchHistoryDetailDrawer({
  isOpen,
  onClose,
  match,
  activePlayerId,
}: MatchHistoryDetailDrawerProps) {
  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>({ 1: true });

  if (!match) return null;

  const formattedDate = new Date(match.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const toggleRound = (roundNumber: number) => {
    setExpandedRounds((prev) => ({
      ...prev,
      [roundNumber]: !prev[roundNumber],
    }));
  };

  const getPlayerName = (id: string) => {
    return match.players.find((p: any) => p.playerId === id)?.name || 'Joueur';
  };

  const isUserWinner = match.winnerId === activePlayerId;

  // Determine game mode badge details
  const getGameModeBadge = () => {
    switch (match.gameMode) {
      case 'online':
        return (
          <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Globe className="w-3 h-3" /> En ligne
          </span>
        );
      case 'pass_and_play':
        return (
          <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> Local
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Bot className="w-3 h-3" /> Contre IA
          </span>
        );
    }
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
            className="fixed inset-0 bg-black/55 z-40 cursor-pointer backdrop-blur-sm"
          />

          {/* Drawer - Frosted Glass panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-slate-950/40 border-l border-white/10 text-slate-100 z-50 shadow-2xl flex flex-col backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
              <div className="flex flex-col text-left">
                <h2 className="text-lg font-black tracking-tight text-white uppercase">
                  Détail du Match
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {getGameModeBadge()}
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formattedDate}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {/* Match Summary Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 backdrop-blur-md shadow-lg">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Résultat final</span>
                    <span className={`text-base font-black uppercase tracking-wide ${isUserWinner ? 'text-emerald-450' : 'text-slate-350'}`}>
                      {isUserWinner ? 'Victoire 🎉' : 'Défaite'}
                    </span>
                  </div>
                  {match.winnerId && (
                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full text-xs font-bold font-sans">
                      <Trophy className="w-3.5 h-3.5 fill-amber-400/10" />
                      <span>Gagnant : {getPlayerName(match.winnerId)}</span>
                    </div>
                  )}
                </div>

                {/* Scoreboard List */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Tableau des scores</span>
                  <div className="divide-y divide-white/10 bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                    {[...match.players].sort((a, b) => b.score - a.score).map((p) => {
                      const isWinner = p.playerId === match.winnerId;
                      return (
                        <div key={p.playerId} className="flex items-center justify-between p-2.5 text-xs">
                          <span className={`font-semibold ${isWinner ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
                            {p.name} {p.isAI && <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded ml-1">IA</span>}
                          </span>
                          <span className="font-mono font-bold text-slate-200">{p.score} pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rounds Detailed List */}
              <div className="space-y-4 text-left">
                <h3 className="text-xs font-mono font-black text-slate-350 uppercase tracking-widest px-1">
                  Déroulement par manche
                </h3>

                {!match.history || match.history.length === 0 ? (
                  <div className="bg-black/20 border border-dashed border-white/10 p-8 rounded-2xl text-center text-xs text-slate-455 font-mono">
                    Aucun détail de manche enregistré pour ce match (partie peut-être annulée prématurément).
                  </div>
                ) : (
                  match.history.map((round: any) => {
                    const isExpanded = expandedRounds[round.roundNumber] !== false;

                    return (
                      <div
                        key={round.roundNumber}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-md"
                      >
                        {/* Round Header Trigger */}
                        <button
                          onClick={() => toggleRound(round.roundNumber)}
                          className="w-full px-4 py-3 bg-white/5 flex items-center justify-between font-mono text-xs font-black text-slate-200 border-b border-white/5 hover:bg-white/10 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-blue-400" />
                            MANCHE #{round.roundNumber}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{round.tricks.length} Pli(s)</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Round tricks history details */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="p-3 space-y-4 overflow-hidden"
                            >
                              {round.tricks.map((trick: any, index: number) => {
                                const leadPlay = trick.playedCards[0];
                                const startingSuit = leadPlay?.card.suit;
                                const winningPlayerName = getPlayerName(trick.winnerId);

                                return (
                                  <div
                                    key={trick.trickIndex}
                                    className="bg-black/20 rounded-xl border border-white/5 overflow-hidden text-left"
                                  >
                                    {/* Trick Indicator Header */}
                                    <div className="bg-white/5 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono border-b border-white/5">
                                      <span className="text-blue-400 font-bold">
                                        PLI #{index + 1}
                                      </span>
                                      {startingSuit && (
                                        <span className="text-slate-350">
                                          Sorte :{' '}
                                          <span className={`${SUIT_COLORS[startingSuit as Suit]} font-bold`}>
                                            {SUIT_SYMBOLS[startingSuit as Suit]} {SUIT_LABELS[startingSuit as Suit]}
                                          </span>
                                        </span>
                                      )}
                                    </div>

                                    {/* Trick Plays List in Order */}
                                    <div className="p-2 space-y-1.5">
                                      {trick.playedCards.map((play: any, playIdx: number) => {
                                        const isLeadPlay = play.playerId === trick.leadPlayerId;
                                        const isWinningPlay = play.playerId === trick.winnerId;
                                        const isSacrifice = play.card.suit !== startingSuit;

                                        return (
                                          <div
                                            key={play.playerId}
                                            className={`flex items-center justify-between p-2 rounded-lg text-[11px] transition duration-150 ${
                                              isWinningPlay
                                                ? 'bg-amber-400/10 border border-amber-400/25'
                                                : 'bg-black/30 border border-white/5'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="font-mono text-[9px] text-slate-500 font-black">
                                                #{playIdx + 1}
                                              </span>
                                              <span className="font-bold text-slate-100">
                                                {play.playerName}
                                              </span>
                                              {isLeadPlay && (
                                                <span className="bg-blue-500/10 text-blue-300 border border-blue-500/15 px-1 py-0.2 rounded text-[8px] font-mono font-bold">
                                                  MENEUR
                                                </span>
                                              )}
                                              {isSacrifice && (
                                                <span className="bg-red-500/10 text-red-300 border border-red-500/15 px-1 py-0.2 rounded text-[8px] font-mono font-bold flex items-center gap-0.5">
                                                  <AlertTriangle className="w-2.5 h-2.5" /> SACRIFICE
                                                </span>
                                              )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                              {/* Played Card */}
                                              <div className={`flex items-center gap-1.5 py-0.5 px-2 rounded bg-white border border-slate-200 font-mono text-[11px] font-black shadow-xs ${
                                                play.card.suit === 'hearts' || play.card.suit === 'diamonds'
                                                  ? 'text-red-600'
                                                  : 'text-neutral-900'
                                              }`}>
                                                <span>{play.card.rank}</span>
                                                <span>{SUIT_SYMBOLS[play.card.suit as Suit]}</span>
                                              </div>

                                              {isWinningPlay && (
                                                <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10" />
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Trick winner summary footer */}
                                    <div className="bg-white/5 px-2.5 py-1 text-[9px] text-slate-350 border-t border-white/5 flex items-center justify-between">
                                      <span>
                                        Vainqueur du pli : <strong className="text-white">{winningPlayerName}</strong>
                                      </span>
                                      <span className="text-amber-400 font-bold font-mono tracking-wider uppercase">
                                        PREND LA MAIN
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Drawer footer hint */}
            <div className="p-4 bg-white/5 border-t border-white/10 text-[10px] text-slate-400 text-center font-medium font-sans">
              Analysez les sacrifices d'un match pour comprendre les stratégies de vos adversaires !
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
