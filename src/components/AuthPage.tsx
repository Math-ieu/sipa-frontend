/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { registerUser, loginUser } from '../utils/backendService';
import { BASE_AVATARS, AvatarDef } from '../utils/avatars';
import { sound } from '../utils/sound';
import { HelpDrawer } from './HelpDrawer';
import {
  User,
  Lock,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  Shield,
  Crown,
  HelpCircle,
  Volume2,
  VolumeX,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Bot,
} from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: { id: string; username: string; avatarId: string }, token: string) => void;
  onNavigate?: (path: string) => void;
  currentPath?: string;
  redirectNotice?: string;
}

export default function AuthPage({ onLogin, redirectNotice }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarId, setAvatarId] = useState<string>('av1');
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sound.isMuted());
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    localStorage.setItem('sipa_pref_sound', String(!next));
    if (!next) {
      sound.playMenuClick();
    }
  };

  const handleTabChange = (mode: 'login' | 'register') => {
    sound.playMenuClick();
    setAuthMode(mode);
    setError('');
    setShowPassword(false);
  };

  const handleAvatarSelect = (av: AvatarDef) => {
    sound.playMenuClick();
    setAvatarId(av.id);
  };

  const handlePlayOffline = () => {
    sound.playModeSelect();
    const guestPseudo = username.trim() || localStorage.getItem('sipa_player_pseudo') || 'Joueur';
    const guestId = localStorage.getItem('sipa_local_player_id') || ('offline_' + Math.random().toString(36).substring(2, 9));
    const guestUser = {
      id: guestId,
      username: guestPseudo,
      avatarId: avatarId || 'av1',
      isOffline: true,
    };
    localStorage.setItem('sipa_cached_user', JSON.stringify(guestUser));
    localStorage.setItem('sipa_offline_user', JSON.stringify(guestUser));
    localStorage.setItem('sipa_local_player_id', guestId);
    localStorage.setItem('sipa_player_pseudo', guestPseudo);
    onLogin(guestUser, 'offline_token');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (authMode === 'register' && password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (authMode === 'register') {
        const data = await registerUser(cleanUsername, password, avatarId, honeypot);
        if (data && data.token && data.user) {
          sound.playRoundVictory();
          onLogin(data.user, data.token);
        }
      } else {
        const data = await loginUser(cleanUsername, password);
        if (data && data.token && data.user) {
          sound.playMenuClick();
          onLogin(data.user, data.token);
        }
      }
    } catch (err: any) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setError('Vous êtes hors ligne. Vous pouvez lancer directement une partie contre l\'IA ci-dessous.');
      } else {
        setError(err.message || 'Identifiants incorrects ou service indisponible.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedAvatar = BASE_AVATARS.find((av) => av.id === avatarId) || BASE_AVATARS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 relative overflow-x-hidden">
      {/* Background Decorative Ambient Lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />

      {/* 1. TOP MINIMAL GAMING NAV */}
      <header className="relative z-20 w-full px-4 md:px-8 py-3.5 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-slate-950/60">
        <div className="flex items-center gap-3">
          {/* Logo Crest */}
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.35)]">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
                <span className="font-serif font-black text-lg text-amber-400 tracking-tighter">
                  S
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border border-slate-950 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" />
            </div>
          </div>

          <div className="text-left">
            <span className="text-lg font-black tracking-tight text-white font-sans uppercase block">
              SIPA
            </span>
            <p className="text-[10px] font-mono text-slate-400">
              Jeu de cartes en ligne et local
            </p>
          </div>
        </div>

        {/* Quick controls: Rules drawer & Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playMenuClick();
              setShowHelpDrawer(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/15 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Consulter les règles du jeu"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Règles du jeu</span>
          </button>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
              isMuted
                ? 'bg-red-950/20 border-red-500/20 text-red-400 hover:bg-red-900/30'
                : 'bg-white/5 border-white/10 text-emerald-400 hover:bg-white/10'
            }`}
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. CENTERED AUTH FORM */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Brand Crest & Title above Form */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-[2px] shadow-[0_0_24px_rgba(245,158,11,0.35)] mb-1">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
              <span className="font-serif font-black text-2xl text-amber-400 tracking-tighter">
                S
              </span>
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-white uppercase">
              SIPA
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Jeu de cartes en ligne et local
            </p>
          </div>
        </div>

        {/* Authentication Terminal Card */}
        <div className="w-full relative rounded-3xl p-6 sm:p-8 bg-slate-900/85 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/40 text-left">
          {/* Offline notice banner */}
          {!isOnline && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-200 space-y-2 font-sans">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-300">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Mode Hors-Ligne Détecté</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Vous n'êtes pas connecté à Internet. Le mode <strong>Solo contre l'IA</strong> fonctionne sans aucune connexion !
              </p>
              <button
                type="button"
                onClick={handlePlayOffline}
                className="w-full mt-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Bot className="w-4 h-4" />
                <span>Jouer contre l'IA hors ligne</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Redirect notice banner if sent here from a protected page */}
          {redirectNotice && isOnline && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2 font-mono">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{redirectNotice}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="relative flex p-1 bg-black/40 border border-white/10 rounded-2xl mb-6">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTabChange('login')}
              className={`relative flex-1 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 z-10 ${
                authMode === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Connexion</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleTabChange('register')}
              className={`relative flex-1 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 z-10 ${
                authMode === 'register' ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Inscription</span>
            </button>

            {/* Animated active pill */}
            <motion.div
              layoutId="activeAuthTab"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`absolute inset-y-1 rounded-xl shadow-lg pointer-events-none ${
                authMode === 'login'
                  ? 'left-1 w-[calc(50%-4px)] bg-blue-600/35 border border-blue-400/40 shadow-blue-500/20'
                  : 'left-[calc(50%+2px)] w-[calc(50%-4px)] bg-amber-500/25 border border-amber-400/40 shadow-amber-500/20'
              }`}
            />
          </div>

          {/* Error Alert Display */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 bg-red-950/40 border border-red-500/30 text-xs text-red-300 rounded-xl text-left font-mono flex items-center gap-2.5 mb-5 shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="flex-1">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Terminal */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest block">
                  Pseudo
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {username.length}/16
                </span>
              </div>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  disabled={loading}
                  maxLength={16}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: Matio"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-medium focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest block">
                  Mot de passe
                </label>
                {authMode === 'register' && (
                  <span className="text-[10px] font-mono text-slate-500">
                    Min. 6 caractères
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-10 pr-11 text-white text-xs font-medium focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition placeholder:text-slate-600 font-mono"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer select-none"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Invisible Anti-bot Honeypot field */}
            {authMode === 'register' && (
              <div
                className="honeypot-container"
                style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none' }}
                aria-hidden="true"
              >
                <label htmlFor="email_confirm">Ne rien inscrire dans cette case</label>
                <input
                  type="text"
                  id="email_confirm"
                  name="email_confirm"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
            )}

            {/* Avatar Selection (only on Register tab) */}
            {authMode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2.5 pb-1"
              >
                <div className="flex items-center justify-between px-0.5 mb-1">
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest block">
                    Choisissez votre avatar
                  </label>
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    {selectedAvatar.name}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2.5 py-3.5 px-1.5 -mx-1">
                  {BASE_AVATARS.map((av) => {
                    const isSelected = avatarId === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        disabled={loading}
                        onClick={() => handleAvatarSelect(av)}
                        className={`aspect-square rounded-xl text-lg font-bold flex items-center justify-center transition-all duration-200 border cursor-pointer select-none relative ${
                          av.color
                        } ${
                          isSelected
                            ? 'border-amber-400 ring-4 ring-amber-500/35 shadow-[0_0_20px_rgba(245,158,11,0.6),0_0_35px_rgba(245,158,11,0.25)] scale-110 opacity-100 z-10'
                            : 'opacity-55 hover:opacity-100 border-white/10 hover:scale-105 active:scale-95'
                        }`}
                        title={av.name}
                      >
                        {av.symbol}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Submit Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] disabled:opacity-50 ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-indigo-900/40 hover:shadow-indigo-500/30'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/30 hover:shadow-amber-500/50'
                }`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : authMode === 'login' ? (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Créer mon compte</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mode switch helper link */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            {authMode === 'login' ? (
              <p className="text-xs text-slate-400">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleTabChange('register')}
                  className="font-bold text-amber-400 hover:text-amber-300 transition underline underline-offset-4 cursor-pointer"
                >
                  S'inscrire
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Déjà inscrit ?{' '}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleTabChange('login')}
                  className="font-bold text-blue-400 hover:text-blue-300 transition underline underline-offset-4 cursor-pointer"
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>

          {/* Quick Offline AI Game Play */}
          {isOnline && (
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <button
                type="button"
                onClick={handlePlayOffline}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-300 text-xs font-mono font-semibold transition-all cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span>Jouer contre l'IA sans compte</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          )}
        </div>

        {/* Micro security pill */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Connexion sécurisée</span>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="relative z-20 py-4 px-4 text-center border-t border-white/5 font-mono text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>SIPA © 2026</span>
        <span className="hidden sm:inline">•</span>
        <span>Jeu de cartes en ligne et local</span>
      </footer>

      {/* Rules / Help Right Drawer accessible directly from Login Page */}
      <HelpDrawer isOpen={showHelpDrawer} onClose={() => setShowHelpDrawer(false)} />
    </div>
  );
}
