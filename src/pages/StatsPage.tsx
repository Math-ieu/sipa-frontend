/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../utils/backendService';
import { MatchHistoryDetailDrawer } from '../components/MatchHistoryDetailDrawer';
import {
  Trophy,
  Crown,
  RefreshCw,
  Globe,
  Smartphone,
  Bot,
  Gamepad2,
} from 'lucide-react';

interface StatsPageProps {
  currentUser: { id: string; username: string; avatarId: string };
}

export function StatsPage({ currentUser }: StatsPageProps) {
  const activePlayerId = currentUser.id;
  const [stats, setStats] = useState<{ totalMatches: number; wins: number; losses: number; winRate: number } | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<any | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const fetchDashboardData = async () => {
    if (!activePlayerId) return;

    setIsLoadingDashboard(true);
    try {
      const statsRes = await fetch(`${API_BASE_URL}/api/users/${activePlayerId}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const matchesRes = await fetch(`${API_BASE_URL}/api/users/${activePlayerId}/matches`);
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (activePlayerId) {
      fetchDashboardData();
    }
  }, [activePlayerId]);

  return (
    <>
      <motion.div
        key="stats_tab"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6 text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/5">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                  Stats & Historique
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consultez votre classement, vos performances, et vos matchs récents
                </p>
              </div>
            </div>

            <button
              onClick={fetchDashboardData}
              disabled={isLoadingDashboard}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50 cursor-pointer shadow-md"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats Dashboard Grid */}
          {stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Sapphire Blue parties panel */}
              <div className="bg-gradient-to-br from-blue-900/10 via-slate-900/55 to-slate-950/85 glass border border-blue-500/20 p-5 rounded-2xl text-left relative overflow-hidden group hover:border-blue-500/40 transition duration-300">
                <div className="absolute inset-0 bg-blue-500/2 opacity-0 group-hover:opacity-100 transition duration-300" />
                <Gamepad2 className="absolute top-4 right-4 w-12 h-12 text-blue-500/15 pointer-events-none group-hover:text-blue-500/25 transition duration-300" />
                <div className="text-[10px] font-mono text-blue-300 uppercase tracking-widest mb-1.5 font-bold">Parties Jouées</div>
                <div className="text-4xl font-black text-white tracking-tight font-sans">{stats.totalMatches}</div>
                <span className="text-[9px] font-mono text-slate-500 block mt-2.5 uppercase font-bold">Historique complet</span>
              </div>

              {/* Emerald green win panel */}
              <div className="bg-gradient-to-br from-emerald-900/10 via-slate-900/55 to-slate-950/85 glass border border-emerald-500/20 p-5 rounded-2xl text-left relative overflow-hidden group hover:border-emerald-500/40 transition duration-300">
                <div className="absolute inset-0 bg-emerald-500/2 opacity-0 group-hover:opacity-100 transition duration-300" />
                <Crown className="absolute top-4 right-4 w-12 h-12 text-emerald-500/15 pointer-events-none group-hover:text-emerald-500/25 transition duration-300" />
                <div className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest mb-1.5 font-bold">Victoires</div>
                <div className="text-4xl font-black text-emerald-450 tracking-tight flex items-baseline gap-2 font-sans">
                  {stats.wins}
                  <span className="text-xs text-slate-500 font-mono font-normal">({stats.losses} défaites)</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 block mt-2.5 uppercase font-bold">Ratio de réussite</span>
              </div>

              {/* Royalty purple win rate panel */}
              <div className="bg-gradient-to-br from-purple-900/10 via-slate-900/55 to-slate-950/85 glass border border-purple-500/20 p-5 rounded-2xl text-left relative overflow-hidden group font-sans hover:border-purple-500/40 transition duration-300">
                <div className="absolute inset-0 bg-purple-500/2 opacity-0 group-hover:opacity-100 transition duration-300" />
                <Trophy className="absolute top-4 right-4 w-12 h-12 text-purple-500/15 pointer-events-none group-hover:text-purple-500/25 transition duration-300" />
                <div className="text-[10px] font-mono text-purple-300 uppercase tracking-widest mb-1.5 font-bold">Taux de Victoire</div>
                <div className="text-4xl font-black text-purple-400 tracking-tight">{stats.winRate}%</div>
                {/* Elegant Progress bar indicator */}
                <div className="w-full bg-white/5 h-2 rounded-full mt-3 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-650 h-full rounded-full" style={{ width: `${stats.winRate}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500 font-mono glass border border-dashed border-white/10 rounded-2xl mb-6">
              {isLoadingDashboard ? 'Chargement en cours...' : 'Aucune statistique disponible pour le moment.'}
            </div>
          )}

          {/* Match History List */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-mono font-black text-slate-350 uppercase tracking-widest px-1">
              Historique détaillé des Matchs
            </h4>

            {matches.length === 0 ? (
              <div className="bg-black/20 border border-dashed border-white/10 p-8 rounded-2xl text-center text-xs text-slate-455 font-mono">
                {isLoadingDashboard ? 'Chargement de l\'historique...' : 'Aucun match enregistré à ce jour. Lancez-vous dans l\'Arène de Jeu !'}
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                {matches.map((m) => {
                  const isUserWinner = m.winnerId === activePlayerId;
                  const formattedDate = new Date(m.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const opponents = m.players.filter((p: any) => p.playerId !== activePlayerId);

                  return (
                    <div
                      key={m.matchId}
                      onClick={() => {
                        setSelectedMatchForDetail(m);
                        setIsDetailDrawerOpen(true);
                      }}
                      className={`match-history-card cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 gap-4 bg-gradient-to-r from-slate-900/50 to-slate-950/80 hover:border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${isUserWinner
                          ? 'border-emerald-500/15 hover:border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                          : 'border-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-black text-sm border-2 shadow-inner transition duration-300 ${isUserWinner
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450 shadow-md shadow-emerald-500/5'
                            : 'bg-slate-500/10 border border-slate-500/20 text-slate-450'
                          }`}>
                          {isUserWinner ? 'V' : 'D'}
                        </div>

                        <div className="text-left space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono text-slate-350 font-black uppercase tracking-wider flex items-center gap-1">
                              {m.gameMode === 'online' ? (
                                <>
                                  <Globe className="w-3 h-3 text-cyan-400" />
                                  <span>Ligne</span>
                                </>
                              ) : m.gameMode === 'pass_and_play' ? (
                                <>
                                  <Smartphone className="w-3 h-3 text-purple-400" />
                                  <span>Local</span>
                                </>
                              ) : (
                                <>
                                  <Bot className="w-3 h-3 text-blue-400" />
                                  <span>IA</span>
                                </>
                              )}
                            </span>
                            <span className="text-sm font-extrabold text-white tracking-wide">
                              {opponents.length > 0
                                ? `vs ${opponents.map((p: any) => p.name).join(', ')}`
                                : 'Match SIPA'
                              }
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            Joué le {formattedDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-white/5 pt-3.5 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest font-bold">
                            Score
                          </span>
                          <span className="text-sm font-mono font-black text-slate-200">
                            {(() => {
                              const myScore = m.players.find((p: any) => p.playerId === activePlayerId)?.score || 0;
                              const opponentsScores = opponents.map((p: any) => p.score);
                              const maxOpponentScore = opponentsScores.length > 0 ? Math.max(...opponentsScores) : 0;
                              return `${myScore} - ${maxOpponentScore} pts`;
                            })()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest font-bold">
                            Résultat
                          </span>
                          <span className={`text-xs font-black uppercase tracking-wider ${isUserWinner ? 'text-emerald-450' : 'text-slate-500'
                            }`}>
                            {isUserWinner ? 'Victoire' : 'Défaite'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <MatchHistoryDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        match={selectedMatchForDetail}
        activePlayerId={activePlayerId}
      />
    </>
  );
}
