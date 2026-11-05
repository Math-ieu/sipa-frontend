/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Trophy,
  Bot,
  Smartphone,
  Globe,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
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

  const isCanceled = match.status === 'canceled';
  const isCompleted = match.status === 'completed';

  const formattedDate = new Date(match.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
            <Smartphone className="w-3 h-3" /> Pass & Play
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Bot className="w-3 h-3" /> Solo IA
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
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-slate-950/90 border-l border-white/10 text-slate-100 z-50 shadow-2xl flex flex-col backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
              <div className="flex flex-col text-left">
                <h2 className="text-lg font-black tracking-tight text-white uppercase">
                  Détail du Match
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {getGameModeBadge()}

                  {/* AI or Human Tag */}
                  {match.hasAI ? (
                    <span className="text-[10px] bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Bot className="w-3 h-3 text-indigo-400" />
                      <span>Avec IA {match.aiCount ? `(${match.aiCount})` : ''}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-3 h-3 text-cyan-400" />
                      <span>100% Humain</span>
                    </span>
                  )}

                  {/* Status Badge */}
                  {isCompleted ? (
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Terminé
                    </span>
                  ) : isCanceled ? (
                    <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-amber-400" /> Annulé
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" /> En cours
                    </span>
                  )}

                  {match.xpGained > 0 && (
                    <span className="text-[10px] bg-amber-500/15 border border-amber-400/35 px-2 py-0.5 rounded-full font-mono text-amber-300 font-black uppercase tracking-wider">
                      +{match.xpGained} XP
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formattedDate}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {/* Canceled match warning banner */}
              {isCanceled && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-left">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-300 block uppercase tracking-wide">
                      Partie Annulée / Abandonnée
                    </span>
                    <p className="text-[11px] text-amber-200/80 leading-relaxed font-sans">
                      Cette partie a été quittée ou annulée avant son terme normal. Les scores et
                      statistiques ci-dessous représentent la situation exacte lors de l'arrêt.
                    </p>
                  </div>
                </div>
              )}

              {/* Match Summary Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 backdrop-blur-md shadow-lg">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Résultat
                    </span>
                    <span
                      className={`text-base font-black uppercase tracking-wide ${
                        isCanceled
                          ? 'text-amber-400'
                          : isUserWinner
                          ? 'text-emerald-450'
                          : 'text-slate-350'
                      }`}
                    >
                      {isCanceled ? 'Annulée' : isUserWinner ? 'Victoire 🎉' : 'Défaite'}
                    </span>
                  </div>
                  {match.winnerId && !isCanceled && (
                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full text-xs font-bold font-sans">
                      <Trophy className="w-3.5 h-3.5 fill-amber-400/10" />
                      <span>Gagnant : {getPlayerName(match.winnerId)}</span>
                    </div>
                  )}
                </div>

                {/* Scoreboard List */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Participants & Scores
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      {match.players?.length || 0} Joueurs
                    </span>
                  </div>
                  <div className="divide-y divide-white/10 bg-black/30 border border-white/5 rounded-xl overflow-hidden">
                    {[...(match.players || [])]
                      .sort((a, b) => b.score - a.score)
                      .map((p) => {
                        const isWinner = !isCanceled && p.playerId === match.winnerId;
                        return (
                          <div
                            key={p.playerId}
                            className="flex items-center justify-between p-2.5 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold ${
                                  isWinner
                                    ? 'text-amber-400 font-bold'
                                    : p.playerId === activePlayerId
                                    ? 'text-white font-bold'
                                    : 'text-slate-200'
                                }`}
                              >
                                {p.name}
                              </span>

                              {p.isAI ? (
                                <span className="text-[9px] font-mono font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                                  <Bot className="w-2.5 h-2.5" /> IA
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md">
                                  Humain
                                </span>
                              )}

                              {p.isHost && (
                                <span className="text-[8px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 rounded">
                                  Hôte
                                </span>
                              )}
                            </div>

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
                    {isCanceled
                      ? 'Aucun détail de manche enregistré (partie annulée prématurément).'
                      : 'Aucun détail de manche disponible pour ce match.'}
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
                          className="w-full px-4 py-3 bg-white/5 flex items-center justify-between font-mono text-xs font-black text-slate-200 border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-blue-400" />
                            MANCHE #{round.roundNumber}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{round.tricks?.length || 0} Pli(s)</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
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
                              {(round.tricks || []).map((trick: any, index: number) => {
                                const leadPlay = trick.playedCards?.[0];
                                const startingSuit = leadPlay?.card?.suit;
                                const winningPlayerName = getPlayerName(trick.winnerId);

                                return (
                                  <div
                                    key={trick.trickIndex ?? index}
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
                                          <span
                                            className={`${
                                              SUIT_COLORS[startingSuit as Suit]
                                            } font-bold`}
                                          >
                                            {SUIT_SYMBOLS[startingSuit as Suit]}{' '}
                                            {SUIT_LABELS[startingSuit as Suit]}
                                          </span>
                                        </span>
                                      )}
                                    </div>

                                    {/* Trick Plays List in Order */}
                                    <div className="p-2 space-y-1.5">
                                      {(trick.playedCards || []).map((play: any, playIdx: number) => {
                                        const isLeadPlay = play.playerId === trick.leadPlayerId;
                                        const isWinningPlay = play.playerId === trick.winnerId;
                                        const isSacrifice = play.card?.suit !== startingSuit;
                                        const playerObj = match.players?.find(
                                          (p: any) => p.playerId === play.playerId
                                        );

                                        return (
                                          <div
                                            key={play.playerId || playIdx}
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
                                              {playerObj?.isAI && (
                                                <span className="text-[8px] font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.2 rounded border border-indigo-500/20 font-bold">
                                                  IA
                                                </span>
                                              )}
                                              {isLeadPlay && (
                                                <span className="bg-blue-500/10 text-blue-300 border border-blue-500/15 px-1 py-0.2 rounded text-[8px] font-mono font-bold">
                                                  MENEUR
                                                </span>
                                              )}
                                              {isSacrifice && (
                                                <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1 py-0.2 rounded text-[8px] font-mono">
                                                  SACRIFICE
                                                </span>
                                              )}
                                            </div>

                                            {/* Card display badge */}
                                            {play.card && (
                                              <div
                                                className={`px-2 py-0.5 rounded font-mono font-bold text-xs flex items-center gap-1 bg-white/5 border border-white/10 ${
                                                  SUIT_COLORS[play.card.suit as Suit]
                                                }`}
                                              >
                                                <span>{play.card.value}</span>
                                                <span>{SUIT_SYMBOLS[play.card.suit as Suit]}</span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Trick Conclusion / Winner Banner */}
                                    <div className="bg-white/5 px-3 py-1 flex items-center justify-between text-[10px] font-mono border-t border-white/5 text-slate-400">
                                      <span>Remporté par :</span>
                                      <span className="text-amber-400 font-black">
                                        {winningPlayerName}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
