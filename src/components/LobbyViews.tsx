/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { isFirebaseConfigured, API_BASE_URL, registerUser, loginUser } from '../utils/backendService';
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
  Sparkles,
  Lock,
  LogOut,
  Key,
  Settings,
  Eye,
  EyeOff,
  Crown,
  Trophy,
  Zap,
  Bot,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';

interface LobbyViewsProps {
  currentUser: { id: string; username: string; avatarId: string } | null;
  onLogin: (user: { id: string; username: string; avatarId: string }, token: string) => void;
  onLogout: () => void;
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
  { id: 'av8', symbol: '◈', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
];

export function LobbyViews({
  currentUser,
  onLogin,
  onLogout,
  onJoinLocalAI,
  onJoinPassAndPlay,
  onCreateOnline,
  onJoinOnline,
}: LobbyViewsProps) {
  const [pseudo, setPseudo] = useState(() => {
    return currentUser?.username || 'Joueur';
  });
  const [selectedAvatarId, setSelectedAvatarId] = useState(() => {
    return currentUser?.avatarId || 'av1';
  });
  const [mode, setMode] = useState<'root' | 'ai_config' | 'pass_config' | 'online_join' | 'profile_edit'>('root');

  // Sync profile when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setPseudo(currentUser.username);
      setSelectedAvatarId(currentUser.avatarId);
    }
  }, [currentUser]);

  // Profile editing state variables
  const [editPseudo, setEditPseudo] = useState(pseudo);
  const [editAvatarId, setEditAvatarId] = useState(selectedAvatarId);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Initialize edit fields when entering edit mode
  useEffect(() => {
    if (mode === 'profile_edit') {
      setEditPseudo(pseudo);
      setEditAvatarId(selectedAvatarId);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setEditError('');
      setEditSuccess('');
    }
  }, [mode, pseudo, selectedAvatarId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    const trimmedPseudo = editPseudo.trim();
    if (!trimmedPseudo) {
      setEditError("Le pseudo ne peut pas être vide.");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setEditError("Veuillez saisir votre mot de passe actuel pour le modifier.");
        return;
      }
      if (newPassword.length < 6) {
        setEditError("Le nouveau mot de passe doit faire au moins 6 caractères.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setEditError("Les nouveaux mots de passe ne correspondent pas.");
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      const token = localStorage.getItem('sipa_auth_token');
      if (!token) {
        setEditError("Session absente. Veuillez vous reconnecter.");
        setIsSavingProfile(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: trimmedPseudo,
          avatarId: editAvatarId,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword ? newPassword : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setEditError(data.error || "Une erreur est survenue lors de la mise à jour.");
      } else {
        setEditSuccess("Profil mis à jour avec succès !");
        onLogin(data.user, data.token);
        
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setEditError("Impossible de contacter le serveur.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Dashboard & Statistics States
  const activePlayerId = currentUser?.id || '';
  const [stats, setStats] = useState<{ totalMatches: number; wins: number; losses: number; winRate: number } | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

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
    if (mode === 'root') {
      fetchDashboardData();
    }
  }, [mode, currentUser]);
  
  // Game count variables
  const [aiCount, setAiCount] = useState<number>(3); // Default 3 (4 players total)
  const [passCount, setPassCount] = useState<number>(3); // Default 3
  
  // Online room state
  const [enteredRoomId, setEnteredRoomId] = useState('');
  const [onlineError, setOnlineError] = useState('');
  const [onlineLoading, setOnlineLoading] = useState(false);

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
    <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-10 relative z-10">
      
      {/* Title Header */}
      <div className="text-center mb-8 md:mb-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 font-mono text-[10px] mb-4 backdrop-blur-md uppercase tracking-wider font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Jeu de Cartes Stratégique
        </motion.div>
        
        <h1 className="text-6xl md:text-8xl font-black font-sans tracking-tighter bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]">
          SIPA
        </h1>
        
      </div>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Profile, Stats & Match History (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Premium Profile Card */}
          <div className="glass p-5 relative overflow-hidden text-left shadow-xl shadow-black/10 border border-white/10">
            {/* Subtle glow orb */}
            <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-blue-500/5 blur-2xl rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {(() => {
                  const myAv = AVATARS.find(av => av.id === selectedAvatarId) || AVATARS[0];
                  return (
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-bold border-2 ring-4 ring-blue-500/10 border-blue-400/50 ${myAv.color} shadow-lg shadow-blue-500/5 transition duration-300 transform hover:scale-105`}>
                      {myAv.symbol}
                    </div>
                  );
                })()}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-extrabold text-white tracking-wide">{pseudo}</span>
                    <span className="bg-blue-550/20 text-blue-300 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[8px] font-black font-mono tracking-widest uppercase shadow-md flex items-center gap-1">
                      Membre SIPA <Crown className="w-2.5 h-2.5 text-amber-400" />
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-450 block uppercase tracking-wider">Compte sécurisé & connecté</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'profile_edit' ? 'root' : 'profile_edit')}
                  className={`flex items-center justify-center p-2.5 rounded-xl border transition duration-200 cursor-pointer shadow-md ${
                    mode === 'profile_edit' 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.35)]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Modifier le profil"
                >
                  <Settings className="w-4 h-4" />
                </button>
                
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-550/15 hover:border-red-500/20 text-slate-400 hover:text-red-300 transition duration-200 cursor-pointer shadow-md"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Stats Dashboard & History */}
          <div className="glass p-6 text-left relative overflow-hidden shadow-xl shadow-black/10 border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-sans font-black text-white text-sm tracking-tight leading-none">
                    Statistiques & Historique
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">
                    Tableau de bord SIPA
                  </span>
                </div>
              </div>
              
              <button
                onClick={fetchDashboardData}
                disabled={isLoadingDashboard}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
                title="Actualiser"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Stats Row */}
            {stats ? (
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-black/35 border border-white/5 p-3 rounded-xl text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/2 opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="text-[9px] font-mono text-slate-450 uppercase tracking-wider mb-1">Parties</div>
                  <div className="text-lg font-black text-white">{stats.totalMatches}</div>
                </div>
                <div className="bg-black/35 border border-white/5 p-3 rounded-xl text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/2 opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="text-[9px] font-mono text-slate-450 uppercase tracking-wider mb-1">Victoires</div>
                  <div className="text-lg font-black text-emerald-450 flex items-center justify-center gap-0.5">
                    <span className="flex items-center justify-center gap-1">
                      {stats.wins} <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  </div>
                </div>
                <div className="bg-black/35 border border-white/5 p-3 rounded-xl text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-purple-500/2 opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="text-[9px] font-mono text-slate-450 uppercase tracking-wider mb-1">Ratio</div>
                  <div className="text-lg font-black text-blue-400">{stats.winRate}%</div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500 font-mono">
                {isLoadingDashboard ? 'Chargement...' : 'Aucune statistique.'}
              </div>
            )}

            {/* Match History List */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-1">
                Matchs Récents
              </h4>
              
              {matches.length === 0 ? (
                <div className="bg-black/20 border border-dashed border-white/5 p-5 rounded-2xl text-center text-xs text-slate-455 font-mono">
                  {isLoadingDashboard ? 'Chargement de l\'historique...' : 'Aucun match enregistré à ce jour.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar">
                  {matches.map((m) => {
                    const isUserWinner = m.winnerId === activePlayerId;
                    const formattedDate = new Date(m.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    const opponents = m.players.filter((p: any) => p.playerId !== activePlayerId);
                    
                    return (
                      <div
                        key={m.matchId}
                        className={`flex items-center justify-between p-2.5 rounded-xl border backdrop-blur-xs transition-all ${
                          isUserWinner 
                            ? 'bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/30 shadow-sm shadow-emerald-500/2' 
                            : 'bg-black/35 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[9px] ${
                            isUserWinner 
                              ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' 
                              : 'bg-slate-500/15 border border-slate-500/20 text-slate-400'
                          }`}>
                            {isUserWinner ? 'V' : 'D'}
                          </div>

                          <div className="text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[7.5px] bg-white/5 border border-white/10 px-1 py-0.5 rounded font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                                {m.gameMode === 'online' ? (
                                  <>
                                    <Globe className="w-2.5 h-2.5 text-cyan-400" />
                                    <span>Ligne</span>
                                  </>
                                ) : m.gameMode === 'pass_and_play' ? (
                                  <>
                                    <Smartphone className="w-2.5 h-2.5 text-purple-400" />
                                    <span>Local</span>
                                  </>
                                ) : (
                                  <>
                                    <Bot className="w-2.5 h-2.5 text-blue-400" />
                                    <span>IA</span>
                                  </>
                                )}
                              </span>
                              <span className="text-xs font-bold text-white max-w-[110px] truncate">
                                {opponents.length > 0 
                                  ? `vs ${opponents.map((p: any) => p.name).join(', ')}` 
                                  : 'Match SIPA'
                                }
                              </span>
                            </div>
                            <span className="text-[8.5px] font-mono text-slate-500 block mt-0.5">
                              {formattedDate}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-slate-200">
                            {(() => {
                              const myScore = m.players.find((p: any) => p.playerId === activePlayerId)?.score || 0;
                              const opponentsScores = opponents.map((p: any) => p.score);
                              const maxOpponentScore = opponentsScores.length > 0 ? Math.max(...opponentsScores) : 0;
                              return `${myScore} - ${maxOpponentScore} pts`;
                            })()}
                          </span>
                          <span className={`text-[7.5px] block font-bold mt-0.5 uppercase tracking-wider ${
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

          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Arena & Configurations (col-span-7) */}
        <div className="lg:col-span-7 h-full">
          
          {/* Main Action card */}
          <div className="glass p-6 md:p-8 shadow-xl border border-white/10 h-full relative overflow-hidden flex flex-col justify-center min-h-[420px]">
            {/* Glow orbs inside this card */}
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/10 blur-[90px] rounded-full pointer-events-none" />
            
            {mode === 'root' && (
              <div className="space-y-6 relative z-10 my-auto">
                <div className="text-left mb-6">
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" /> Choisissez votre Arène
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sélectionnez un mode de jeu ci-dessous pour lancer ou rejoindre une partie.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* AI Option */}
                  <motion.button
                    whileHover={{ scale: 1.015, x: 4 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => setMode('ai_config')}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 text-left transition-all duration-300 group cursor-pointer shadow-md"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition duration-300 flex-shrink-0">
                      <Cpu className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-100 text-sm tracking-wide uppercase">Contre l'ordinateur</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">
                        Défiez nos intelligences artificielles tactiques. Idéal pour s'entraîner et se perfectionner à votre rythme.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors group-hover:translate-x-1 duration-300" />
                  </motion.button>

                  {/* Pass and Play Option */}
                  <motion.button
                    whileHover={{ scale: 1.015, x: 4 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => setMode('pass_config')}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 text-left transition-all duration-300 group cursor-pointer shadow-md"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 transition duration-300 flex-shrink-0">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-100 text-sm tracking-wide uppercase">Passer & Jouer</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">
                        Prenez place avec vos amis autour de la même table et jouez à tour de rôle en passant le même appareil localement.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors group-hover:translate-x-1 duration-300" />
                  </motion.button>

                  {/* Online Option */}
                  <motion.button
                    whileHover={{ scale: 1.015, x: 4 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => setMode('online_join')}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 text-left transition-all duration-300 group cursor-pointer shadow-md"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:scale-110 transition duration-300 flex-shrink-0 relative">
                      <Globe className="w-7 h-7" />
                      {!isFirebaseConfigured && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-100 text-sm tracking-wide uppercase">Multijoueur en Ligne</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">
                        Affrontez vos amis ou d'autres joueurs en temps réel dans des salons de jeux privés sécurisés par codes.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors group-hover:translate-x-1 duration-300" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Config: AI Play */}
            {mode === 'ai_config' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative z-10 text-left my-auto"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base tracking-tight leading-none uppercase">
                      Configuration de l'IA
                    </h3>
                    <span className="text-[9px] font-mono text-slate-450 block mt-1 uppercase tracking-widest">Contre l'ordinateur</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
                    Nombre total de joueurs à la table
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        onClick={() => setAiCount(count)}
                        className={`
                          py-4 rounded-xl font-bold transition-all duration-200 border cursor-pointer text-xs
                          ${aiCount === count 
                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.35)]' 
                            : 'bg-white/5 border-white/10 text-slate-350 hover:text-white hover:border-white/20 hover:bg-white/10'
                          }
                        `}
                      >
                        {count} Joueurs <span className="text-[9.5px] block font-normal text-slate-400 mt-0.5">(1 + {count - 1} IA)</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl text-[11px] text-slate-350 leading-normal flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Entraînez-vous :</strong> Plus vous rajoutez d'IA, plus la dynamique de défausse et la gestion des derniers plis (7 de fin) deviennent stratégiques.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setMode('root')}
                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition cursor-pointer text-xs"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => onJoinLocalAI({ pseudo, avatarId: selectedAvatarId, opponentCount: aiCount - 1 })}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wide"
                  >
                    Lancer l'arène <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Config: Pass & Play */}
            {mode === 'pass_config' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative z-10 text-left my-auto"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base tracking-tight leading-none uppercase">
                      Configuration Locale
                    </h3>
                    <span className="text-[9px] font-mono text-slate-450 block mt-1 uppercase tracking-widest">Passer & Jouer</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
                    Nombre total d'amis à la table
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        onClick={() => setPassCount(count)}
                        className={`
                          py-4 rounded-xl font-bold transition-all duration-200 border cursor-pointer text-xs
                          ${passCount === count 
                            ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]' 
                            : 'bg-white/5 border-white/10 text-slate-350 hover:text-white hover:border-white/20 hover:bg-white/10'
                          }
                        `}
                      >
                        {count} Joueurs
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-2xl text-[11px] text-slate-350 leading-normal flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Masquage automatique :</strong> Le jeu occultera automatiquement votre jeu entre chaque pli individuel pour s'assurer que vos adversaires ne regardent pas vos cartes.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setMode('root')}
                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition cursor-pointer text-xs"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => onJoinPassAndPlay({ pseudo, avatarId: selectedAvatarId, playerCount: passCount })}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-550 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wide"
                  >
                    Démarrer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Config: Online Lobby */}
            {mode === 'online_join' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative z-10 text-left my-auto"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base tracking-tight leading-none uppercase">
                      Salons en ligne
                    </h3>
                    <span className="text-[9px] font-mono text-slate-450 block mt-1 uppercase tracking-widest">Multijoueur en Ligne</span>
                  </div>
                </div>

                {!isFirebaseConfigured ? (
                  <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-2xl text-[11px] text-red-300 leading-relaxed text-center space-y-4">
                    <p>
                      Le mode multijoueur requiert une configuration de base de données en ligne active. Nous vous recommandons de tester vos tactiques face à nos IA intelligentes en attendant !
                    </p>
                    <div>
                      <button
                        onClick={() => setMode('ai_config')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-550 border border-blue-500/20 text-white font-bold font-mono text-[10px] rounded-xl transition shadow-md shadow-blue-500/10 uppercase tracking-wider"
                      >
                        Affronter l'IA à la place
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {onlineError && (
                      <div className="p-3 bg-red-950/30 border border-red-500/20 text-xs text-amber-400 rounded-xl text-center font-mono">
                        {onlineError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Join Room Form */}
                      <form onSubmit={handleOnlineSubmit} className="space-y-3 bg-black/35 border border-white/5 p-4.5 rounded-2xl text-left">
                        <h4 className="font-bold text-xs text-white uppercase tracking-wider">Rejoindre</h4>
                        <p className="text-[10px] text-slate-400">
                          Saisissez le code de salon à 6 chiffres :
                        </p>
                        <input
                          type="text"
                          maxLength={6}
                          value={enteredRoomId}
                          onChange={(e) => setEnteredRoomId(e.target.value.replace(/\D/g, ''))}
                          placeholder="Code salon (ex: 785123)"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-center font-bold tracking-widest focus:outline-none focus:border-cyan-500 text-white font-mono"
                        />
                        <button
                          type="submit"
                          disabled={onlineLoading || !enteredRoomId}
                          className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-550 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider"
                        >
                          {onlineLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Rejoindre'
                          )}
                        </button>
                      </form>

                      {/* Create Room Form */}
                      <div className="space-y-3 bg-black/35 border border-white/5 p-4.5 rounded-2xl text-left flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-white uppercase tracking-wider">Créer un salon</h4>
                          <p className="text-[10px] text-slate-450 mt-1">
                            Créez un nouveau salon de jeu et invitez vos amis en leur partageant le code secret.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={onlineLoading}
                          onClick={handleCreateOnlineRoom}
                          className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-550 disabled:opacity-50 text-white font-bold text-xs rounded-xl mt-4 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider"
                        >
                          {onlineLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Créer le Salon'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5 mt-4 flex justify-start">
                  <button
                    onClick={() => setMode('root')}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    Retour
                  </button>
                </div>
              </motion.div>
            )}

            {/* Config: Profile Edit */}
            {mode === 'profile_edit' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative z-10 text-left my-auto w-full"
              >
                {/* Header */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base tracking-tight leading-none uppercase">
                      Paramètres du Compte
                    </h3>
                    <span className="text-[9px] font-mono text-slate-450 block mt-1 uppercase tracking-widest">
                      Édition du profil & sécurité
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  {editError && (
                    <div className="p-3 bg-red-950/30 border border-red-500/20 text-xs text-amber-400 rounded-xl flex items-center justify-center gap-2 font-mono animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>{editError}</span>
                    </div>
                  )}

                  {editSuccess && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-400 rounded-xl flex items-center justify-center gap-2 font-mono">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{editSuccess}</span>
                    </div>
                  )}

                  {/* 1. Pseudo Section */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
                      Pseudonyme
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        maxLength={16}
                        value={editPseudo}
                        onChange={(e) => setEditPseudo(e.target.value)}
                        placeholder="Nouveau pseudo"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-10 text-sm focus:outline-none focus:border-blue-500 text-white font-bold transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* 2. Avatar Selection Grid */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
                      Sceau de Joueur (Avatar)
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setEditAvatarId(av.id)}
                          className={`
                            w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold border transition duration-300 cursor-pointer
                            ${editAvatarId === av.id 
                              ? 'bg-blue-600/30 border-blue-400 text-white scale-110 shadow-[0_0_12px_rgba(59,130,246,0.3)] ring-2 ring-blue-500/20' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                          }
                          `}
                        >
                          {av.symbol}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Password Section (Optional) */}
                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                        Changer le mot de passe (optionnel)
                      </span>
                    </div>

                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-slate-450 uppercase block">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                          <Key className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Saisissez votre mot de passe actuel"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-10 text-xs focus:outline-none focus:border-blue-500 text-white transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password & Confirm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-slate-450 uppercase block">
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 6 caractères"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3.5 text-xs focus:outline-none focus:border-blue-500 text-white transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-slate-450 uppercase block">
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmer"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3.5 text-xs focus:outline-none focus:border-blue-500 text-white transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setMode('root')}
                      className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition cursor-pointer text-xs"
                      disabled={isSavingProfile}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wide disabled:opacity-50"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>Enregistrer <Check className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </div>

        </div>

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
