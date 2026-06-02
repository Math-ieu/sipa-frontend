/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Award,
  Volume2,
  VolumeX,
  Sliders,
  Gamepad2
} from 'lucide-react';

interface LobbyViewsProps {
  currentUser: { id: string; username: string; avatarId: string } | null;
  onLogin: (user: { id: string; username: string; avatarId: string }, token: string) => void;
  onLogout: () => void;
  onJoinLocalAI: (opts: { pseudo: string; avatarId: string; opponentCount: number }) => void;
  onJoinPassAndPlay: (opts: { pseudo: string; avatarId: string; playerCount: number }) => void;
  onCreateOnline: (opts: { pseudo: string; avatarId: string }) => Promise<void> | void;
  onJoinOnline: (roomId: string, opts: { pseudo: string; avatarId: string }) => Promise<void> | void;
  theme?: string;
  onToggleTheme?: () => void;
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
  theme,
  onToggleTheme,
}: LobbyViewsProps) {
  const [activeTab, setActiveTab] = useState<'arena' | 'profile' | 'stats'>('arena');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const [pseudo, setPseudo] = useState(() => {
    return currentUser?.username || 'Joueur';
  });
  const [selectedAvatarId, setSelectedAvatarId] = useState(() => {
    return currentUser?.avatarId || 'av1';
  });
  const [mode, setMode] = useState<'root' | 'ai_config' | 'pass_config' | 'online_join'>('root');

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

  // User game preferences state
  const [prefSound, setPrefSound] = useState(() => {
    const saved = localStorage.getItem('sipa_pref_sound');
    return saved !== null ? saved === 'true' : true;
  });
  const [prefAnimations, setPrefAnimations] = useState(() => {
    const saved = localStorage.getItem('sipa_pref_animations');
    return saved !== null ? saved === 'true' : true;
  });
  const [prefAutoMask, setPrefAutoMask] = useState(() => {
    const saved = localStorage.getItem('sipa_pref_automask');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleSound = () => {
    const next = !prefSound;
    setPrefSound(next);
    localStorage.setItem('sipa_pref_sound', String(next));
    window.dispatchEvent(new CustomEvent('sipa_sound_toggle', { detail: next }));
  };

  const handleToggleAnimations = () => {
    const next = !prefAnimations;
    setPrefAnimations(next);
    localStorage.setItem('sipa_pref_animations', String(next));
  };

  const handleToggleAutoMask = () => {
    const next = !prefAutoMask;
    setPrefAutoMask(next);
    localStorage.setItem('sipa_pref_automask', String(next));
  };

  // Initialize edit fields when switching tabs or when user profile updates
  useEffect(() => {
    setEditPseudo(pseudo);
    setEditAvatarId(selectedAvatarId);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setEditError('');
    setEditSuccess('');
  }, [activeTab, pseudo, selectedAvatarId]);

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

  // Fetch stats when tab changes or on startup
  useEffect(() => {
    if (activePlayerId) {
      fetchDashboardData();
    }
  }, [activePlayerId, activeTab]);

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
    <div className="w-full min-h-screen p-4 md:p-6 relative z-10 flex flex-col md:flex-row gap-6 items-stretch">

      {/* 1. Desktop Sidebar Navigation */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarExpanded ? 260 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col justify-between shrink-0 glass border border-white/10 p-5 rounded-3xl relative overflow-hidden bg-slate-950/40 backdrop-blur-2xl shadow-2xl"
      >
        {/* Glow orb inside sidebar */}
        <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

        <div className="space-y-8 relative z-10">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-sans font-black text-xl shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              S
            </div>
            {isSidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-left"
              >
                <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
                  SIPA
                </h1>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                  Strategic Arena
                </span>
              </motion.div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {/* Arena Tab */}
            <button
              onClick={() => {
                setActiveTab('arena');
                setMode('root');
              }}
              className={`w-full flex items-center gap-3.5 py-3.5 px-4 rounded-xl border font-bold text-xs transition duration-200 cursor-pointer shadow-sm relative group ${activeTab === 'arena'
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 font-extrabold shadow-[inset_0_0_12px_rgba(59,130,246,0.15)]'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              title={!isSidebarExpanded ? "Arène de Jeu" : undefined}
            >
              <Zap className={`w-5 h-5 flex-shrink-0 transition duration-200 ${activeTab === 'arena' ? 'text-blue-400 fill-blue-400/20' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
              {isSidebarExpanded && <span>Arène de Jeu</span>}
              {activeTab === 'arena' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1.5 h-6 bg-blue-500 rounded-r"
                />
              )}
            </button>

            {/* Profile Tab */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3.5 py-3.5 px-4 rounded-xl border font-bold text-xs transition duration-200 cursor-pointer shadow-sm relative group ${activeTab === 'profile'
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 font-extrabold shadow-[inset_0_0_12px_rgba(59,130,246,0.15)]'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              title={!isSidebarExpanded ? "Mon Profil" : undefined}
            >
              <User className={`w-5 h-5 flex-shrink-0 transition duration-200 ${activeTab === 'profile' ? 'text-blue-400 fill-blue-400/20' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
              {isSidebarExpanded && <span>Mon Profil</span>}
              {activeTab === 'profile' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1.5 h-6 bg-blue-500 rounded-r"
                />
              )}
            </button>

            {/* Stats Tab */}
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3.5 py-3.5 px-4 rounded-xl border font-bold text-xs transition duration-200 cursor-pointer shadow-sm relative group ${activeTab === 'stats'
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 font-extrabold shadow-[inset_0_0_12px_rgba(59,130,246,0.15)]'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              title={!isSidebarExpanded ? "Stats & Historique" : undefined}
            >
              <Trophy className={`w-5 h-5 flex-shrink-0 transition duration-200 ${activeTab === 'stats' ? 'text-blue-400 fill-blue-400/20' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
              {isSidebarExpanded && <span>Stats & Historique</span>}
              {activeTab === 'stats' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1.5 h-6 bg-blue-500 rounded-r"
                />
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-4 relative z-10 pt-4 border-t border-white/5">
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition duration-200 cursor-pointer"
          >
            {isSidebarExpanded ? (
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider font-bold">
                <ChevronLeft className="w-4 h-4" /> Réduire
              </div>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Theme Toggler in Sidebar */}
          {onToggleTheme && (
            isSidebarExpanded ? (
              <button
                onClick={onToggleTheme}
                className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition duration-200 cursor-pointer shadow-sm"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span>Mode Clair</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-400" />
                    <span>Mode Sombre</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onToggleTheme}
                className="w-full flex items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition duration-200 cursor-pointer shadow-sm"
                title={theme === 'dark' ? "Passer au mode clair" : "Passer au mode sombre"}
              >
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-300" /> : <Moon className="w-4.5 h-4.5 text-slate-400" />}
              </button>
            )
          )}

          {/* Quick Logout Button */}
          {isSidebarExpanded ? (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-red-950/20 border border-red-500/20 hover:bg-red-550/15 hover:border-red-500/30 text-red-300 font-bold text-xs transition duration-200 cursor-pointer shadow-md"
            >
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-3 rounded-xl bg-red-950/20 border border-red-500/20 hover:bg-red-550/15 text-red-300 transition duration-200 cursor-pointer shadow-md"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Copyrights inside sidebar */}
          {isSidebarExpanded && (
            <div className="text-[8.5px] font-mono text-slate-500 text-center uppercase tracking-widest pt-1">
              SIPA © 2026 • Joach27
            </div>
          )}
        </div>
      </motion.aside>

      {/* 2. Mobile Bottom Navigation Bar (Sticky layout for phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-t border-white/10 flex justify-around items-center py-2 px-3 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        {/* Arena Tab */}
        <button
          onClick={() => {
            setActiveTab('arena');
            setMode('root');
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition duration-200 cursor-pointer ${activeTab === 'arena' ? 'text-blue-400' : 'text-slate-400'
            }`}
        >
          <Zap className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold font-mono tracking-wide uppercase">Arène</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition duration-200 cursor-pointer ${activeTab === 'profile' ? 'text-blue-400' : 'text-slate-400'
            }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold font-mono tracking-wide uppercase">Profil</span>
        </button>

        {/* Stats Tab */}
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition duration-200 cursor-pointer ${activeTab === 'stats' ? 'text-blue-400' : 'text-slate-400'
            }`}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold font-mono tracking-wide uppercase">Stats</span>
        </button>

        {/* Theme Toggle Button on Mobile */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="flex flex-col items-center justify-center p-2 rounded-xl transition duration-200 cursor-pointer text-slate-455 hover:text-slate-200"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 mb-0.5 text-amber-300" /> : <Moon className="w-5 h-5 mb-0.5 text-slate-400" />}
            <span className="text-[9px] font-bold font-mono tracking-wide uppercase">Thème</span>
          </button>
        )}
      </div>

      {/* 3. Main Content Container (Dynamic Page Swap) */}
      <div className="flex-1 min-w-0 pb-20 md:pb-0 flex flex-col">

        {/* Active Page with AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === 'arena' && (
            <motion.div
              key="arena_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col"
            >
              <div className="glass p-6 md:p-8 shadow-2xl border border-white/10 rounded-3xl h-full flex flex-col justify-center relative overflow-hidden min-h-[460px]">
                {/* Glowing orbs inside the card */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />

                <div className="space-y-8 relative z-10 my-auto">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5 gap-4 text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/5">
                        <Zap className="w-6 h-6 animate-pulse text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                          Arène de Combat
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Choisissez votre destin. Sélectionnez une arène ci-dessous pour lancer une partie.
                        </p>
                      </div>
                    </div>

                    {mode !== 'root' && (
                      <button
                        onClick={() => setMode('root')}
                        className="self-start sm:self-center px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-350 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                      >
                        Retour
                      </button>
                    )}
                  </div>

                  {mode === 'root' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
                      {/* Option 1: AI */}
                      <motion.button
                        whileHover={{ y: -6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMode('ai_config')}
                        className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-blue-500/10 via-slate-900/50 to-slate-950/80 border border-white/10 hover:border-blue-500/40 text-left transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] h-full relative overflow-hidden"
                      >
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 blur-xl rounded-full pointer-events-none" />
                        <div className="space-y-4">
                          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-450 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition duration-300 shadow-inner">
                            <Cpu className="w-7 h-7" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-sans font-black text-white text-base tracking-wide uppercase flex items-center gap-1.5">
                              L'Ordinateur <span className="text-[8px] bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded-full text-blue-300 font-mono tracking-widest font-normal uppercase">IA</span>
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Défiez nos intelligences artificielles tactiques. Idéal pour s'entraîner et se perfectionner à votre rythme.
                            </p>
                          </div>
                        </div>
                        <div className="pt-6 mt-auto flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-blue-450 group-hover:text-blue-300 w-full border-t border-white/5">
                          <span>S'entraîner</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-300" />
                        </div>
                      </motion.button>

                      {/* Option 2: Pass and Play */}
                      <motion.button
                        whileHover={{ y: -6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMode('pass_config')}
                        className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-purple-500/10 via-slate-900/50 to-slate-950/80 border border-white/10 hover:border-purple-500/40 text-left transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] h-full relative overflow-hidden"
                      >
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/5 blur-xl rounded-full pointer-events-none" />
                        <div className="space-y-4">
                          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-405 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 transition duration-300 shadow-inner">
                            <Smartphone className="w-7 h-7" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-sans font-black text-white text-base tracking-wide uppercase flex items-center gap-1.5">
                              Passer & Jouer <span className="text-[8px] bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full text-purple-300 font-mono tracking-widest font-normal uppercase">Local</span>
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Prenez place avec vos amis autour de la même table et jouez à tour de rôle en passant le même appareil localement.
                            </p>
                          </div>
                        </div>
                        <div className="pt-6 mt-auto flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-purple-450 group-hover:text-purple-300 w-full border-t border-white/5">
                          <span>Table locale</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-300" />
                        </div>
                      </motion.button>

                      {/* Option 3: Online */}
                      <motion.button
                        whileHover={{ y: -6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMode('online_join')}
                        className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-cyan-500/10 via-slate-900/50 to-slate-950/80 border border-white/10 hover:border-cyan-500/40 text-left transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] h-full relative overflow-hidden"
                      >
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 blur-xl rounded-full pointer-events-none" />
                        <div className="space-y-4">
                          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-405 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:scale-110 transition duration-300 flex-shrink-0 relative shadow-inner">
                            <Globe className="w-7 h-7" />
                            {!isFirebaseConfigured && (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-sans font-black text-white text-base tracking-wide uppercase flex items-center gap-1.5">
                              En Ligne <span className="text-[8px] bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded-full text-cyan-300 font-mono tracking-widest font-normal uppercase">Web</span>
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Affrontez vos amis ou d'autres joueurs en temps réel dans des salons de jeux privés sécurisés par codes.
                            </p>
                          </div>
                        </div>
                        <div className="pt-6 mt-auto flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-cyan-455 group-hover:text-cyan-300 w-full border-t border-white/5">
                          <span>Multijoueur</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-300" />
                        </div>
                      </motion.button>
                    </div>
                  ) : (
                    <div className="relative z-10 text-left w-full max-w-2xl mx-auto">

                      {/* AI Config Panel */}
                      {mode === 'ai_config' && (
                        <motion.div
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6"
                        >
                          <div className="space-y-4">
                            <label className="text-xs font-mono font-black text-slate-350 uppercase tracking-widest block">
                              Nombre total de tacticiens à la table
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                              {[2, 3, 4].map((count) => (
                                <button
                                  key={count}
                                  onClick={() => setAiCount(count)}
                                  className={`
                                      py-5 rounded-2xl font-black transition-all duration-300 border cursor-pointer flex flex-col items-center justify-center gap-1.5 text-xs
                                      ${aiCount === count
                                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] scale-105 ring-4 ring-blue-500/10'
                                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10'
                                    }
                                    `}
                                >
                                  <span className="text-2xl font-mono">{count}</span>
                                  <span className="text-[9px] uppercase tracking-widest font-bold">Joueurs</span>
                                  <span className="text-[8px] font-mono font-normal text-slate-500 mt-0.5">(1 + {count - 1} IA)</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl text-[11px] text-slate-350 leading-relaxed flex items-start gap-3 shadow-inner">
                            <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p>
                              <strong>Conseil tactique :</strong> Plus la table compte de participants, plus la gestion du pli de fin (le « 7 de fin ») et les dynamiques d'évitement des plis négatifs deviennent complexes et compétitives.
                            </p>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button
                              onClick={() => setMode('root')}
                              className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition cursor-pointer text-xs uppercase tracking-wider"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => onJoinLocalAI({ pseudo, avatarId: selectedAvatarId, opponentCount: aiCount - 1 })}
                              className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-550 hover:to-indigo-550 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-widest"
                            >
                              Lancer l'Arène <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Pass & Play Config Panel */}
                      {mode === 'pass_config' && (
                        <motion.div
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6"
                        >
                          <div className="space-y-4">
                            <label className="text-xs font-mono font-black text-slate-350 uppercase tracking-widest block">
                              Nombre d'amis assis autour de la table
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                              {[2, 3, 4].map((count) => (
                                <button
                                  key={count}
                                  onClick={() => setPassCount(count)}
                                  className={`
                                      py-5 rounded-2xl font-black transition-all duration-300 border cursor-pointer flex flex-col items-center justify-center gap-1.5 text-xs
                                      ${passCount === count
                                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] scale-105 ring-4 ring-purple-500/10'
                                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10'
                                    }
                                    `}
                                >
                                  <span className="text-2xl font-mono">{count}</span>
                                  <span className="text-[9px] uppercase tracking-widest font-bold">Joueurs</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-purple-500/5 border border-purple-500/10 p-5 rounded-2xl text-[11px] text-slate-350 leading-relaxed flex items-start gap-3 shadow-inner">
                            <Smartphone className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <p>
                              <strong>Masquage des mains :</strong> Pour préserver le secret tactique, SIPA occultera l'écran entre les tours individuels. Vous pourrez passer l'appareil en toute sérénité.
                            </p>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button
                              onClick={() => setMode('root')}
                              className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition cursor-pointer text-xs uppercase tracking-wider"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => onJoinPassAndPlay({ pseudo, avatarId: selectedAvatarId, playerCount: passCount })}
                              className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-550 hover:to-pink-550 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 transition flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-widest"
                            >
                              Lancer la Table <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Online Config Panel */}
                      {mode === 'online_join' && (
                        <motion.div
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6"
                        >
                          {!isFirebaseConfigured ? (
                            <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-2xl text-[11.5px] text-red-300 leading-relaxed text-center space-y-4 shadow-inner">
                              <p>
                                Le serveur multijoueur requiert une base de données connectée. Nous vous invitons à tester vos théories et votre agilité stratégique face à nos IA tactiques en attendant !
                              </p>
                              <div>
                                <button
                                  onClick={() => setMode('ai_config')}
                                  className="px-6 py-3 bg-blue-600 hover:bg-blue-550 border border-blue-500/20 text-white font-bold font-mono text-[10px] rounded-xl transition shadow-md shadow-blue-500/10 uppercase tracking-widest cursor-pointer"
                                >
                                  Rejoindre l'Arène IA
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {onlineError && (
                                <div className="p-3 bg-red-950/30 border border-red-500/20 text-xs text-amber-400 rounded-xl text-center font-mono">
                                  {onlineError}
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Form Join */}
                                <form onSubmit={handleOnlineSubmit} className="space-y-4 bg-black/45 border border-white/10 p-5 rounded-3xl text-left shadow-lg">
                                  <h4 className="font-black text-xs text-cyan-400 uppercase tracking-widest block border-b border-white/5 pb-2">Rejoindre Salon</h4>
                                  <p className="text-[10px] text-slate-400">
                                    Saisissez le code de salon à 6 chiffres :
                                  </p>
                                  <input
                                    type="text"
                                    maxLength={6}
                                    value={enteredRoomId}
                                    onChange={(e) => setEnteredRoomId(e.target.value.replace(/\D/g, ''))}
                                    placeholder="CODE SECRET"
                                    className="w-full bg-slate-950/70 border border-white/10 rounded-2xl py-3 px-4 text-base text-center font-bold tracking-[0.2em] focus:outline-none focus:border-cyan-550 text-white font-mono shadow-inner transition duration-200 focus:ring-2 focus:ring-cyan-500/20"
                                  />
                                  <button
                                    type="submit"
                                    disabled={onlineLoading || !enteredRoomId}
                                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-550 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider"
                                  >
                                    {onlineLoading ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      'Rejoindre'
                                    )}
                                  </button>
                                </form>

                                {/* Form Create */}
                                <div className="space-y-4 bg-black/45 border border-white/10 p-5 rounded-3xl text-left flex flex-col justify-between shadow-lg">
                                  <div>
                                    <h4 className="font-bold text-xs text-cyan-400 uppercase tracking-widest block border-b border-white/5 pb-2">Créer un salon</h4>
                                    <p className="text-[10px] text-slate-450 mt-2 leading-relaxed">
                                      Créez instantanément une nouvelle table de jeu privée en ligne et invitez vos amis en leur transmettant le code de salon unique.
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    disabled={onlineLoading}
                                    onClick={handleCreateOnlineRoom}
                                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-550 hover:to-blue-550 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider mt-4"
                                  >
                                    {onlineLoading ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      'Créer la Table'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-white/5 mb-6 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/5">
                    <User className="w-6 h-6 text-blue-450" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                      Mon Profil
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gérez vos informations de compte, avatar, et sécurité
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
                  
                  {/* Left Column: Visual Card, Badges & Preferences (lg:col-span-5) */}
                  <div className="lg:col-span-5 flex flex-col gap-6 w-full">
                    {/* Left Column: Visual Profile Card (Compact Horizontal Banner) */}
                    <div className="w-full glass p-4 rounded-2xl text-left shadow-lg border border-white/10 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md">
                      <div className="flex items-center gap-4">
                        {(() => {
                          const myAv = AVATARS.find(av => av.id === selectedAvatarId) || AVATARS[0];
                          return (
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl font-bold border border-white/15 ${myAv.color} shadow-lg transform hover:scale-[1.03] transition-all duration-300 relative`}>
                              {myAv.symbol}
                            </div>
                          );
                        })()}
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold text-white tracking-tight">{pseudo}</span>
                            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                              Membre SIPA <Crown className="w-3 h-3 text-amber-500" />
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                            Joueur enregistré
                          </span>
                        </div>
                      </div>

                      {/* Right Column: Profile Stats and Logout */}
                      <div className="flex items-center gap-4 w-full sm:w-auto lg:w-full xl:w-auto justify-between sm:justify-end lg:justify-between xl:justify-end">
                        {/* Compact Stats */}
                        <div className="flex gap-4 bg-white/5 border border-white/5 py-1.5 px-3 rounded-xl text-xs">
                          <div className="text-center px-1">
                            <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Statut</span>
                            <span className="text-slate-100 font-semibold text-xs">Actif</span>
                          </div>
                          <div className="text-center border-l border-white/5 pl-3 pr-1">
                            <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Victoires</span>
                            <span className="text-emerald-450 font-bold text-xs">{stats?.wins || 0} V</span>
                          </div>
                        </div>

                        <button
                          onClick={onLogout}
                          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400 font-bold text-[10px] transition duration-200 cursor-pointer shadow-sm uppercase tracking-wider"
                          title="Déconnexion"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Déconnexion</span>
                        </button>
                      </div>
                    </div>

                    {/* Badge Trophies & Achievements Section */}
                    <div className="w-full glass p-6 rounded-2xl text-left shadow-lg border border-white/10 bg-slate-900/40 backdrop-blur-md">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5 font-mono border-b border-white/5 pb-2.5 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500 animate-bounce" /> Distinctions & Trophées
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Trophy 1: Champion */}
                        <div className="flex flex-col items-center justify-between p-3.5 bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-2xl text-center transition group relative shadow-inner">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-md group-hover:scale-110 transition duration-300">
                            <Crown className="w-5.5 h-5.5 fill-amber-500/20" />
                          </div>
                          <span className="text-xs font-bold text-slate-200 mt-2">Champion SIPA</span>
                          <span className="text-[9px] text-emerald-450 font-mono mt-0.5 uppercase tracking-wide">Débloqué</span>
                        </div>

                        {/* Trophy 2: Tacticien */}
                        <div className="flex flex-col items-center justify-between p-3.5 bg-white/5 border border-white/10 hover:border-blue-500/30 rounded-2xl text-center transition group relative shadow-inner">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-450 shadow-md group-hover:scale-110 transition duration-300">
                            <Zap className="w-5.5 h-5.5 fill-blue-500/20" />
                          </div>
                          <span className="text-xs font-bold text-slate-200 mt-2">Fin Tacticien</span>
                          <div className="w-full mt-2.5 space-y-1">
                            <div className="flex justify-between text-[8px] font-mono text-slate-400 leading-none">
                              <span>Parties</span>
                              <span>3/5</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1">
                              <div className="bg-blue-500 h-1 rounded-full" style={{ width: '60%' }} />
                            </div>
                          </div>
                        </div>

                        {/* Trophy 3: Explorateur */}
                        <div className="flex flex-col items-center justify-between p-3.5 bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-2xl text-center transition group relative shadow-inner">
                          <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-405 shadow-md group-hover:scale-110 transition duration-300">
                            <Globe className="w-5.5 h-5.5 fill-cyan-500/20" />
                          </div>
                          <span className="text-xs font-bold text-slate-200 mt-2">Explorateur Web</span>
                          <span className="text-[9px] text-emerald-450 font-mono mt-0.5 uppercase tracking-wide">Débloqué</span>
                        </div>

                        {/* Trophy 4: Invincible */}
                        <div className="flex flex-col items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-2xl text-center relative opacity-50 shadow-inner group">
                          <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500 relative">
                            <Lock className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 mt-2">Invincible</span>
                          <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase tracking-wide">10 Victoires</span>
                        </div>
                      </div>
                    </div>

                    {/* User Game Preferences Customization Section */}
                    <div className="w-full glass p-6 rounded-2xl text-left shadow-lg border border-white/10 bg-slate-900/40 backdrop-blur-md">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5 font-mono border-b border-white/5 pb-2.5 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-purple-500" /> Préférences & Réglages de Jeu
                      </h3>

                      <div className="space-y-4">
                        {/* Pref 1: Sounds */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${prefSound ? 'bg-emerald-500/10 text-emerald-450' : 'bg-red-500/10 text-red-400'}`}>
                              {prefSound ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-200 block">Effets Sonores & Musiques</span>
                              <span className="text-[10px] text-slate-455 block">Activer les signaux sonores en jeu</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleToggleSound}
                            className={`w-11 h-6 rounded-full transition-all duration-200 focus:outline-none flex items-center p-0.5 cursor-pointer ${
                              prefSound ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                            }`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow" />
                          </button>
                        </div>

                        {/* Pref 2: Animations */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                              <Gamepad2 className="w-4.5 h-4.5" />
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-200 block">Animations 3D Complexes</span>
                              <span className="text-[10px] text-slate-455 block">Activer les mouvements fluides des cartes</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleToggleAnimations}
                            className={`w-11 h-6 rounded-full transition-all duration-200 focus:outline-none flex items-center p-0.5 cursor-pointer ${
                              prefAnimations ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                            }`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow" />
                          </button>
                        </div>

                        {/* Pref 3: Pass and Play Auto Mask */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                              <Smartphone className="w-4.5 h-4.5" />
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-200 block">Auto-masquage Local (Pass & Play)</span>
                              <span className="text-[10px] text-slate-455 block">Masquer les cartes lors du changement de joueur</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleToggleAutoMask}
                            className={`w-11 h-6 rounded-full transition-all duration-200 focus:outline-none flex items-center p-0.5 cursor-pointer ${
                              prefAutoMask ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                            }`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Profile Form Editor (lg:col-span-7) */}
                  <div className="lg:col-span-7 w-full flex flex-col gap-6">
                    <div className="w-full glass p-6 rounded-2xl text-left shadow-lg border border-white/10 bg-slate-900/40 backdrop-blur-md">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-6 font-mono border-b border-white/5 pb-2.5 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-blue-500" /> Paramètres d'identité & sécurité
                      </h3>

                      <form onSubmit={handleSaveProfile} className="space-y-5">
                        {editError && (
                          <div className="p-3 bg-red-950/20 border border-red-500/20 text-xs text-amber-400 rounded-xl flex items-center justify-center gap-2 font-mono">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span>{editError}</span>
                          </div>
                        )}

                        {editSuccess && (
                          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-450 rounded-xl flex items-center justify-center gap-2 font-mono">
                            <Sparkles className="w-4 h-4 text-emerald-450" />
                            <span>{editSuccess}</span>
                          </div>
                        )}

                        {/* Pseudo Section */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                            Pseudonyme
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                              <User className="w-4.5 h-4.5" />
                            </span>
                            <input
                              type="text"
                              maxLength={16}
                              value={editPseudo}
                              onChange={(e) => setEditPseudo(e.target.value)}
                              placeholder="Nouveau pseudo"
                              className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-10 text-sm focus:outline-none focus:border-blue-500 text-slate-100 font-semibold transition-all duration-200 shadow-sm focus:ring-1 focus:ring-blue-500/20"
                              required
                            />
                          </div>
                        </div>

                        {/* Avatar Grid */}
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                            Sceau de Joueur (Avatar)
                          </label>
                          <div className="flex flex-wrap gap-2.5">
                            {AVATARS.map((av) => (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() => setEditAvatarId(av.id)}
                                className={`
                                  w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95
                                  ${editAvatarId === av.id
                                    ? 'bg-blue-600/10 border-blue-500 text-white ring-2 ring-blue-500/25 shadow-sm'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                  }
                                `}
                              >
                                {av.symbol}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Password Section */}
                        <div className="pt-5 border-t border-white/5 space-y-4">
                          <div className="flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                              Changer le mot de passe (optionnel)
                            </span>
                          </div>

                          {/* Current Password */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-mono text-slate-455 uppercase block">
                              Mot de passe actuel
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                                <Key className="w-4 h-4" />
                              </span>
                              <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Saisissez votre mot de passe actuel"
                                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-10 text-xs focus:outline-none focus:border-blue-500 text-slate-100 transition-all duration-200 font-mono shadow-sm focus:ring-1 focus:ring-blue-500/20"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-550 hover:text-slate-350 cursor-pointer"
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* New Password & Confirm */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-mono text-slate-455 uppercase block">
                                Nouveau mot de passe
                              </label>
                              <div className="relative">
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="Min. 6 caractères"
                                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-blue-500 text-slate-100 transition-all duration-200 font-mono shadow-sm focus:ring-1 focus:ring-blue-500/20"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-550 hover:text-slate-350 cursor-pointer"
                                >
                                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-mono text-slate-455 uppercase block">
                                Confirmer le mot de passe
                              </label>
                              <div className="relative">
                                <input
                                  type={showConfirmPassword ? "text" : "password"}
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="Confirmer"
                                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-blue-500 text-slate-100 transition-all duration-200 font-mono shadow-sm focus:ring-1 focus:ring-blue-500/20"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-550 hover:text-slate-350 cursor-pointer"
                                >
                                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Save Controls */}
                        <div className="flex gap-4 pt-5 border-t border-white/5 mt-5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditPseudo(pseudo);
                              setEditAvatarId(selectedAvatarId);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                              setEditError('');
                              setEditSuccess('');
                            }}
                            className="flex-1 py-3 px-4 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-slate-300 font-bold transition duration-200 cursor-pointer text-xs uppercase tracking-wider shadow-sm"
                            disabled={isSavingProfile}
                          >
                            Réinitialiser
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 px-4 bg-blue-650 hover:bg-blue-600 border border-blue-500/30 text-white font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-widest disabled:opacity-50 shadow-md"
                            disabled={isSavingProfile}
                          >
                            {isSavingProfile ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>Enregistrer <Check className="w-4 h-4" /></>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: STATS & HISTORIQUE */}
          {activeTab === 'stats' && (
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
                      <div className="text-[10px] font-mono text-blue-300 uppercase tracking-widest mb-1.5 font-bold">Parties Jouées</div>
                      <div className="text-4xl font-black text-white tracking-tight font-sans">{stats.totalMatches}</div>
                      <span className="text-[9px] font-mono text-slate-500 block mt-2.5 uppercase font-bold">Historique complet</span>
                    </div>

                    {/* Emerald green win panel */}
                    <div className="bg-gradient-to-br from-emerald-900/10 via-slate-900/55 to-slate-950/85 glass border border-emerald-500/20 p-5 rounded-2xl text-left relative overflow-hidden group hover:border-emerald-500/40 transition duration-300">
                      <div className="absolute inset-0 bg-emerald-500/2 opacity-0 group-hover:opacity-100 transition duration-300" />
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
                            className={`match-history-card flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 gap-4 bg-gradient-to-r from-slate-900/50 to-slate-950/80 hover:border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${isUserWinner
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
          )}
        </AnimatePresence>
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
