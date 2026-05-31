/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { isFirebaseConfigured, API_BASE_URL } from '../utils/firebaseService';
import { 
  Users, 
  Cpu, 
  Smartphone, 
  Globe, 
  User, 
  ArrowRight, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface LobbyViewsProps {
  onJoinLocalAI: (opts: { pseudo: string; avatarId: string; opponentCount: number }) => void;
  onJoinPassAndPlay: (opts: { pseudo: string; avatarId: string; playerCount: number }) => void;
  onCreateOnline: (opts: { pseudo: string; avatarId: string }) => Promise<void> | void;
  onJoinOnline: (roomId: string, opts: { pseudo: string; avatarId: string }) => Promise<void> | void;
}

export const AVATARS = [
  { id: 'av1', symbol: '❂', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'av2', symbol: '❈', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { id: 'av3', symbol: '✾', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  { id: 'av4', symbol: '✙', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: 'av5', symbol: '✺', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'av6', symbol: '✿', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { id: 'av7', symbol: '⚔', color: 'bg-white/10 text-slate-100 border-white/25' },
  { id: 'av8', symbol: '◈', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
];

export function LobbyViews({
  onJoinLocalAI,
  onJoinPassAndPlay,
  onCreateOnline,
  onJoinOnline,
}: LobbyViewsProps) {
  const [pseudo, setPseudo] = useState(() => {
    return localStorage.getItem('sipa_player_pseudo') || 'Joueur ' + Math.floor(100 + Math.random() * 900);
  });
  const [selectedAvatarId, setSelectedAvatarId] = useState('av1');
  const [mode, setMode] = useState<'root' | 'ai_config' | 'pass_config' | 'online_join'>('root');
  
  // Dashboard & Statistics States
  const [playerId] = useState(() => {
    return localStorage.getItem('sipa_local_player_id') || '';
  });
  const [stats, setStats] = useState<{ totalMatches: number; wins: number; losses: number; winRate: number } | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const fetchDashboardData = async () => {
    const storedPlayerId = localStorage.getItem('sipa_local_player_id');
    if (!storedPlayerId) return;

    setIsLoadingDashboard(true);
    try {
      const statsRes = await fetch(`${API_BASE_URL}/api/users/${storedPlayerId}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const matchesRes = await fetch(`${API_BASE_URL}/api/users/${storedPlayerId}/matches`);
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
    if (mode === 'root') {
      fetchDashboardData();
    }
  }, [mode]);
  
  // Game count variables
  const [aiCount, setAiCount] = useState<number>(3); // Default 3 (4 players total)
  const [passCount, setPassCount] = useState<number>(3); // Default 3
  
  // Online room state
  const [enteredRoomId, setEnteredRoomId] = useState('');
  const [onlineError, setOnlineError] = useState('');
  const [onlineLoading, setOnlineLoading] = useState(false);

  // Save pseudo
  const handlePseudoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.substring(0, 16);
    setPseudo(val);
    localStorage.setItem('sipa_player_pseudo', val);
  };

  const handleOnlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredRoomId.trim()) return;
    
    setOnlineLoading(true);
    setOnlineError('');
    try {
      await onJoinOnline(enteredRoomId.trim(), { pseudo, avatarId: selectedAvatarId });
    } catch (err: any) {
      setOnlineError(err.message || "Impossible de rejoindre le salon.");
    } finally {
      setOnlineLoading(false);
    }
  };

  const handleCreateOnlineRoom = async () => {
    setOnlineLoading(true);
    setOnlineError('');
    try {
      await onCreateOnline({ pseudo, avatarId: selectedAvatarId });
    } catch (err: any) {
      setOnlineError(err.message || "Erreur de création du salon.");
    } finally {
      setOnlineLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 relative">
      {/* Title Header */}
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 font-mono text-xs mb-3 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> JEU DE CARTES STRATÉGIQUE
        </motion.div>
        
        <h1 className="text-6xl md:text-7xl font-black font-sans tracking-tighter bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]">
          SIPA
        </h1>
        <p className="text-sm md:text-base text-slate-300 mt-2 font-medium max-w-md mx-auto leading-relaxed">
          Prise de main, mémoire et maîtrise des 7 de fin de manche.
        </p>
      </div>

      {/* Main Glass card panel */}
      <div className="glass p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow orb background decorative element inside card */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Step 1: Human Configuration */}
        <div className="space-y-6 mb-8 pb-8 border-b border-white/10 relative z-10">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-350 uppercase tracking-widest mb-2">
              Votre Pseudo
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={pseudo}
                onChange={handlePseudoChange}
                placeholder="Ex: Alexandre"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-350 uppercase tracking-widest mb-3">
              Choisissez votre Sceau
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatarId(av.id)}
                  className={`
                    aspect-square rounded-xl text-xl font-bold flex items-center justify-center transition-all duration-200 border-2
                    ${av.color}
                    ${selectedAvatarId === av.id 
                      ? 'border-blue-400 ring-4 ring-blue-500/35 scale-105' 
                      : 'opacity-50 hover:opacity-100 hover:scale-102 hover:border-white/20'
                    }
                  `}
                >
                  {av.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Mode router */}
        {mode === 'root' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {/* AI Option */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => setMode('ai_config')}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 text-center transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 group-hover:scale-110 transition">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-100 text-sm">Contre l'ordinateur</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Partie rapide avec IA intelligentes. Idéal pour s'entraîner.
                </p>
              </motion.button>

              {/* Pass and Play Option */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => setMode('pass_config')}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 text-center transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 group-hover:scale-110 transition">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-100 text-sm">Passer & Jouer</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Prenez place autour d'une table et jouez à tour de rôle localement.
                </p>
              </motion.button>

              {/* Online Option */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => setMode('online_join')}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 text-center transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 group-hover:scale-110 transition relative">
                  <Globe className="w-6 h-6" />
                  {!isFirebaseConfigured && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-100 text-sm">Multijoueur en Ligne</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Affrontez vos amis en temps réel à l'aide d'un code de salon.
                </p>
              </motion.button>
            </div>

            {/* Dashboard de Profil & Historique des Matchs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-blue-500/5 blur-2xl rounded-full pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm">
                    🏆
                  </div>
                  <div className="text-left">
                    <h3 className="font-sans font-black text-white text-base tracking-tight leading-none">
                      Mon Profil & Statistiques
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mt-1">
                      Tableau de bord SIPA
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={fetchDashboardData}
                  disabled={isLoadingDashboard}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-350 hover:text-white hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
                  title="Actualiser"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Stats Row */}
              {stats ? (
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                  <div className="bg-black/30 border border-white/5 p-3 rounded-2xl text-center">
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Parties</div>
                    <div className="text-lg md:text-xl font-black text-white">{stats.totalMatches}</div>
                  </div>
                  <div className="bg-black/30 border border-white/5 p-3 rounded-2xl text-center">
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Victoires</div>
                    <div className="text-lg md:text-xl font-black text-emerald-400 flex items-center justify-center gap-1">
                      {stats.wins} <span className="text-xs">🏆</span>
                    </div>
                  </div>
                  <div className="bg-black/30 border border-white/5 p-3 rounded-2xl text-center">
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Ratio</div>
                    <div className="text-lg md:text-xl font-black text-blue-400">{stats.winRate}%</div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-450 font-mono">
                  {isLoadingDashboard ? 'Chargement des statistiques...' : 'Aucune statistique disponible.'}
                </div>
              )}

              {/* Match History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest px-1 text-left">
                  Historique des Matchs
                </h4>
                
                {matches.length === 0 ? (
                  <div className="bg-black/20 border border-dashed border-white/5 p-6 rounded-2xl text-center text-xs text-slate-400">
                    {isLoadingDashboard ? 'Chargement de l\'historique...' : 'Aucun match enregistré à ce jour.'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
                    {matches.map((m) => {
                      const isUserWinner = m.winnerId === playerId;
                      const formattedDate = new Date(m.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      const opponents = m.players.filter((p: any) => p.playerId !== playerId);
                      
                      return (
                        <div
                          key={m.matchId}
                          className={`flex items-center justify-between p-3 rounded-2xl border backdrop-blur-xs transition-all ${
                            isUserWinner 
                              ? 'bg-emerald-450/5 border-emerald-500/15 hover:border-emerald-500/30' 
                              : 'bg-black/30 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] ${
                              isUserWinner 
                                ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' 
                                : 'bg-slate-500/15 border border-slate-500/20 text-slate-400'
                            }`}>
                              {isUserWinner ? 'V' : 'D'}
                            </div>

                            <div className="text-left">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8px] bg-white/5 border border-white/10 px-1 py-0.2 rounded font-mono text-slate-400 font-bold uppercase">
                                  {m.gameMode === 'online' ? '🌐 Ligne' : m.gameMode === 'pass_and_play' ? '📱 Local' : '🤖 IA'}
                                </span>
                                <span className="text-xs font-bold text-white max-w-[130px] truncate">
                                  {opponents.length > 0 
                                    ? `vs ${opponents.map((p: any) => p.name).join(', ')}` 
                                    : 'Match SIPA'
                                  }
                                </span>
                              </div>
                              <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                                {formattedDate}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-slate-200">
                              {(() => {
                                const myScore = m.players.find((p: any) => p.playerId === playerId)?.score || 0;
                                const opponentsScores = opponents.map((p: any) => p.score);
                                const maxOpponentScore = opponentsScores.length > 0 ? Math.max(...opponentsScores) : 0;
                                return `${myScore} - ${maxOpponentScore} pts`;
                              })()}
                            </span>
                            <span className={`text-[8px] block font-bold mt-0.5 uppercase tracking-wider ${
                              isUserWinner ? 'text-emerald-400' : 'text-slate-500'
                            }`}>
                              {isUserWinner ? 'Victoire' : 'Défaite'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* Option 2A: Computer Config */}
        {mode === 'ai_config' && (
          <div className="space-y-6 relative z-10">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" /> Configurer les Adversaires IA
            </h3>
            
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Nombre total de joueurs (incluant vous)
              </span>
              <div className="grid grid-cols-3 gap-3">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => setAiCount(count)}
                    className={`
                      py-3.5 rounded-xl font-bold transition-all duration-200 border cursor-pointer
                      ${aiCount === count 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                        : 'bg-white/5 border-white/10 text-slate-350 hover:text-white hover:border-white/20 hover:bg-white/10'
                      }
                    `}
                  >
                    {count} Joueurs (1 + {count - 1} IA)
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setMode('root')}
                className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition cursor-pointer"
              >
                Retour
              </button>
              <button
                onClick={() => onJoinLocalAI({ pseudo, avatarId: selectedAvatarId, opponentCount: aiCount - 1 })}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl glass-glow-button transition flex items-center justify-center gap-1 cursor-pointer"
              >
                Lancer la Partie <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Option 2B: Pass and Play Config */}
        {mode === 'pass_config' && (
          <div className="space-y-6 relative z-10">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-400" /> Passer & Jouer (Local)
            </h3>
            
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Nombre de participants physiques
              </span>
              <div className="grid grid-cols-3 gap-3">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => setPassCount(count)}
                    className={`
                      py-3.5 rounded-xl font-bold transition-all duration-200 border cursor-pointer
                      ${passCount === count 
                        ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                        : 'bg-white/5 border-white/10 text-slate-350 hover:text-white hover:border-white/20 hover:bg-white/10'
                      }
                    `}
                  >
                    {count} Joueurs
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400 italic bg-white/5 p-3 rounded-lg border border-white/10">
              Note : l'ordinateur masquera votre main pour préserver le secret lors du passage de l'appareil entre chaque coup individuel.
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setMode('root')}
                className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition cursor-pointer"
              >
                Retour
              </button>
              <button
                onClick={() => onJoinPassAndPlay({ pseudo, avatarId: selectedAvatarId, playerCount: passCount })}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                Lancer la Partie <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Option 2C: Online Room Join Form / Create Room */}
        {mode === 'online_join' && (
          <div className="space-y-6 relative z-10">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" /> Salons en Ligne SIPA
            </h3>

            {!isFirebaseConfigured ? (
              <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-2xl text-xs text-red-300 leading-relaxed text-center space-y-4">
                <p>
                  Le mode en ligne nécessite que la base de données soit activée. Nous vous proposons de jouer contre l'IA à la place !
                </p>
                <div>
                  <button
                    onClick={() => setMode('ai_config')}
                    className="px-5 py-2.5 bg-white/10 border border-white/10 hover:border-blue-400/30 font-bold font-mono text-xs rounded-xl text-slate-200 transition"
                  >
                    Jouer contre l'IA à la place
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Error Banner */}
                {onlineError && (
                  <div className="p-3 bg-red-950/30 border border-red-500/20 text-xs text-amber-400 rounded-xl text-center font-mono">
                    {onlineError}
                  </div>
                )}

                {/* Suboptions block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LEFT: Join Lobby */}
                  <form onSubmit={handleOnlineSubmit} className="space-y-3 bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <h4 className="font-bold text-sm text-slate-100">Rejoindre un salon</h4>
                    <p className="text-xs text-slate-400">
                      Entrez le code à 6 chiffres partagé :
                    </p>
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredRoomId}
                      onChange={(e) => setEnteredRoomId(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 583214"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 uppercase text-center font-bold tracking-widest focus:outline-none focus:border-blue-500 text-white font-mono"
                    />
                    <button
                      type="submit"
                      disabled={onlineLoading || !enteredRoomId}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {onlineLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Rejoindre'
                      )}
                    </button>
                  </form>

                  {/* RIGHT: Create Lobby */}
                  <div className="space-y-3 bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">Nouveau salon privé</h4>
                      <p className="text-xs text-slate-400 mt-2">
                        Créer un tout nouveau salon. Vous obtiendrez un code d'invitation à envoyer à vos confrères.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={onlineLoading}
                      onClick={handleCreateOnlineRoom}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl mt-4 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {onlineLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Créer un Salon'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/15 mt-4 flex justify-start">
              <button
                onClick={() => setMode('root')}
                className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition text-xs cursor-pointer"
              >
                Retour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Online Lobby waiting room view
 */
interface OnlineWaitingLobbyProps {
  roomCode: string;
  players: any[];
  myPlayerId: string;
  onStartGame: () => void;
  onLeaveLobby: () => void;
}

export function OnlineWaitingLobby({
  roomCode,
  players,
  myPlayerId,
  onStartGame,
  onLeaveLobby,
}: OnlineWaitingLobbyProps) {
  const [copied, setCopied] = useState(false);
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isHost = myPlayer?.isHost;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-12">
      <div className="glass p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Room Header */}
        <div className="text-center">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
            SALON MULTIJOUEUR EN LIGNE
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Salle d'Attente</h2>
        </div>

        {/* Code display Box */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center space-y-2 relative overflow-hidden backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-mono">CODE DU SALON</div>
          <div className="text-4xl font-mono font-black text-blue-400 tracking-wider">
            {roomCode}
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition border border-white/20 text-xs font-semibold cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copié !
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copier le code
              </>
            )}
          </button>
        </div>

        {/* Player List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 uppercase tracking-wider px-1">
            <span>Participants ({players.length}/4)</span>
            {players.length < 2 && <span className="text-amber-400 animate-pulse font-bold">Minimum 2 requis</span>}
          </div>
          
          <div className="space-y-2">
            {players.map((p) => {
              const avatar = AVATARS.find((av) => av.id === p.avatarId) || AVATARS[0];
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-sans text-sm border ${avatar.color}`}>
                      {avatar.symbol}
                    </div>
                    <div>
                      <span className="font-bold text-slate-100">
                        {p.name}
                      </span>
                      {p.id === myPlayerId && (
                        <span className="ml-1.5 text-[10px] text-blue-400 font-mono font-bold uppercase">
                          (Moi)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.isHost ? (
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                        HÔTE
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">Connecté</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 space-y-2.5">
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={players.length < 2}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-550/20 transition-all duration-200 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Lancer la Partie de SIPA
            </button>
          ) : (
            <div className="text-center text-xs text-slate-300 italic py-3 bg-white/5 border border-dashed border-white/10 rounded-xl">
              En attente du lancement par l'Hôte...
            </div>
          )}

          <button
            onClick={onLeaveLobby}
            className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Quitter le Salon
          </button>
        </div>

      </div>
    </div>
  );
}
