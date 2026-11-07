/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Swords,
  User,
  Trophy,
  LogOut,
  Volume2,
  VolumeX,
  Sparkles,
  Shield,
  ChevronDown,
  HelpCircle,
  Download,
  WifiOff,
  X,
  Smartphone,
  Share,
} from 'lucide-react';
import { AVATARS } from '../utils/avatars';
import { sound } from '../utils/sound';
import { HelpDrawer } from './HelpDrawer';
import {
  fetchUserProgression,
  getCachedEquipped,
  getFrameStyle,
  ProgressionData,
} from '../utils/cosmetics';
import {
  isRunningStandalone,
  isIosDevice,
  canTriggerNativeInstall,
  triggerPwaInstall,
} from '../utils/pwa';

interface AppLayoutProps {
  activeTab: 'arena' | 'profile' | 'stats';
  onNavigate: (path: string) => void;
  currentUser?: { id: string; username: string; avatarId: string } | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppLayout({
  activeTab,
  onNavigate,
  currentUser,
  onLogout,
  children,
}: AppLayoutProps) {
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [cachedEquipped, setCachedEquipped] = useState(() => getCachedEquipped());
  const [isStandalone, setIsStandalone] = useState(() => isRunningStandalone());
  const [hasInstallPrompt, setHasInstallPrompt] = useState(() => canTriggerNativeInstall());
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleSoundToggle = (e: any) => {
      setIsMuted(!e.detail);
    };
    const handleProgressionUpdate = (e: any) => {
      if (e.detail) {
        setProgression(e.detail);
      }
      setCachedEquipped(getCachedEquipped());
    };
    const handlePwaState = () => {
      setIsStandalone(isRunningStandalone());
      setHasInstallPrompt(canTriggerNativeInstall());
    };
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('sipa_sound_toggle', handleSoundToggle);
    window.addEventListener('sipa_progression_updated', handleProgressionUpdate);
    window.addEventListener('sipa_pwa_state_change', handlePwaState);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('sipa_sound_toggle', handleSoundToggle);
      window.removeEventListener('sipa_progression_updated', handleProgressionUpdate);
      window.removeEventListener('sipa_pwa_state_change', handlePwaState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    sound.playMenuClick();
    if (canTriggerNativeInstall()) {
      const outcome = await triggerPwaInstall();
      if (outcome === 'manual') {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserProgression(currentUser.id).then((data) => {
        if (data) setProgression(data);
      });
    }
  }, [currentUser?.id]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    localStorage.setItem('sipa_pref_sound', String(!next));
    if (!next) {
      sound.playMenuClick();
    }
  };

  const handleNav = (path: string) => {
    sound.playMenuClick();
    onNavigate(path);
  };

  const avatar = currentUser 
    ? (AVATARS.find((av) => av.id === currentUser.avatarId) || AVATARS[0])
    : AVATARS[0];

  const navItems = [
    {
      id: 'arena',
      label: 'Arène de Jeu',
      shortLabel: 'Arène',
      path: '/arene-de-jeu',
      icon: Swords,
      color: 'from-amber-400 to-orange-500',
      activeColor: 'text-amber-400',
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      shortLabel: 'Profil',
      path: '/profil',
      icon: Shield,
      color: 'from-blue-400 to-indigo-500',
      activeColor: 'text-blue-400',
    },
    {
      id: 'stats',
      label: 'Panthéon & Stats',
      shortLabel: 'Panthéon',
      path: '/stats',
      icon: Trophy,
      color: 'from-emerald-400 to-teal-500',
      activeColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col relative z-10 selection:bg-amber-500/30">
      
      {/* 1. TOP GAME HUD HEADER (Desktop & Tablet) */}
      <header className="sticky top-0 z-40 w-full px-3 md:px-6 py-2.5 backdrop-blur-xl bg-slate-950/75 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* BRAND CREST & TITLE */}
          <div 
            onClick={() => handleNav('/arene-de-jeu')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Animated Game Crest */}
            <div className="relative">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.35)] group-hover:shadow-[0_0_28px_rgba(245,158,11,0.6)] transition-all duration-300">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
                  {/* Subtle inner card suit glyphs */}
                  <span className="font-serif font-black text-lg md:text-xl text-amber-400 tracking-tighter group-hover:scale-110 transition-transform duration-300">
                    S
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
                </div>
              </div>
              {/* Crown gem pin */}
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border border-slate-950 flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" />
              </div>
            </div>

            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white font-sans uppercase">
                  SIPA
                </h1>
                <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 tracking-wider">
                  ARENA
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase flex items-center gap-1">
                <span>♠</span><span>♥</span><span>♦</span><span>♣</span>
                <span className="text-slate-500 ml-1">L'Art du Pli</span>
              </p>
            </div>
          </div>

          {/* CENTER DOCK NAVIGATION (Pills) */}
          <nav className="hidden md:flex items-center bg-slate-900/80 border border-white/10 rounded-full p-1.5 shadow-[inset_0_1px_3px_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`relative px-5 py-2 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer select-none ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {/* Floating active pill highlight */}
                  {isActive && (
                    <motion.div
                      layoutId="activeGameDock"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/10 to-white/5 border border-white/20 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.15)] pointer-events-none"
                    />
                  )}

                  <Icon className={`w-4 h-4 transition-transform duration-300 ${
                    isActive ? `${item.activeColor} scale-110` : 'text-slate-400'
                  }`} />
                  
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT PLAYER CHIP & QUICK CONTROLS */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Offline Status Badge */}
            {!isOnline && (
              <div
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider"
                title="Mode hors-ligne : les modes Solo contre l'IA et Pass & Play restent disponibles"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden lg:inline">Hors-ligne</span>
              </div>
            )}

            {/* PWA Install Button (hidden once installed in standalone mode) */}
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className={`p-2 md:px-3 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5 ${
                  hasInstallPrompt
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/50 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 shadow-amber-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-emerald-500/15 hover:border-emerald-400/40 text-slate-300 hover:text-emerald-300'
                }`}
                title="Installer l'application SIPA (PWA) sur votre appareil"
              >
                <Download className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden sm:inline text-[11px] font-mono font-bold uppercase tracking-wider">
                  Installer
                </span>
              </button>
            )}

            {/* Help & Rules Button */}
            <button
              onClick={() => {
                sound.playMenuClick();
                setIsHelpOpen(true);
              }}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/15 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5"
              title="Règles du jeu & Aide"
            >
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                Règles
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm ${
                isMuted
                  ? 'bg-red-950/20 border-red-500/20 text-red-400 hover:bg-red-900/30'
                  : 'bg-white/5 border-white/10 text-emerald-400 hover:bg-white/10'
              }`}
              title={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* User Identity Chip */}
            {currentUser && (() => {
              const userLevel = progression?.level ?? cachedEquipped.level ?? 1;
              const userTitle = progression?.currentTitle?.name ?? cachedEquipped.titleName ?? 'Initié des Cartes';
              const frameStyle = getFrameStyle(progression?.equipped?.frame ?? cachedEquipped.frame);
              const xpPercent = progression
                ? progression.isMaxLevel
                  ? 100
                  : Math.min(100, Math.round((progression.xpIntoLevel / Math.max(1, progression.xpForNextLevel)) * 100))
                : 0;

              return (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 p-1.5 md:pr-3.5 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/15 hover:border-amber-400/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 cursor-pointer select-none group"
                  >
                    {/* Avatar with Equipped Frame & Level Badge */}
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl ${frameStyle.ringClass} ${frameStyle.glowClass} relative shrink-0`}>
                      <div className={`w-full h-full rounded-[9px] flex items-center justify-center font-bold text-sm border border-white/15 shadow-inner ${avatar.color}`}>
                        {avatar.symbol}
                      </div>
                      <span className="absolute -bottom-1 -right-1 px-1 py-0.2 min-w-[16px] h-4 rounded-full bg-slate-950 border border-amber-400/80 text-[8px] font-mono font-black text-amber-300 flex items-center justify-center shadow">
                        {userLevel}
                      </span>
                    </div>

                    <div className="text-left hidden sm:block leading-tight">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors block max-w-[100px] truncate">
                          {currentUser.username}
                        </span>
                        <span className="text-[8px] font-mono font-black px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase">
                          Niv.{userLevel}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-amber-400/90 font-extrabold uppercase tracking-wider block max-w-[130px] truncate">
                        {userTitle}
                      </span>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform hidden sm:block" />
                  </button>

                  {/* Dropdown Popover */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-slate-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl p-2 z-40 space-y-1 text-left"
                        >
                          <div className="px-3 py-2.5 border-b border-white/10 mb-1 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-white truncate">
                                {currentUser.username}
                              </p>
                              <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/35 text-amber-300 shrink-0">
                                Niveau {userLevel}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-amber-400 font-bold truncate">
                              ★ {userTitle}
                            </p>
                            {progression && (
                              <div className="space-y-1 pt-0.5">
                                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-500"
                                    style={{ width: `${xpPercent}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                                  <span>{progression.xp} XP total</span>
                                  <span>
                                    {progression.isMaxLevel
                                      ? 'NIVEAU MAX'
                                      : `${progression.xpIntoLevel}/${progression.xpForNextLevel} XP`}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleNav('/profil');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span>Mon Profil</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleNav('/stats');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                          >
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span>Stats & Historique</span>
                          </button>

                          <div className="border-t border-white/10 my-1" />

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              sound.playMenuClick();
                              onLogout();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-red-400" />
                            <span>Se déconnecter</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()}

            {/* Logout shortcut if no menu dropdown */}
            {!currentUser && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-red-950/20 border border-red-500/20 hover:bg-red-900/30 text-red-400 transition cursor-pointer"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN GAMING CANVAS */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 md:p-6 pb-24 md:pb-8 flex flex-col">
        {children}
      </main>

      {/* 3. MOBILE FLOATING BOTTOM DOCK */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50">
        <nav className="bg-slate-950/90 border border-white/15 rounded-2xl px-2 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer relative ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveDock"
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                  />
                )}
                <Icon className={`w-5 h-5 mb-0.5 relative z-10 ${
                  isActive ? item.activeColor : 'text-slate-400'
                }`} />
                <span className="text-[9px] font-bold font-mono uppercase tracking-wider relative z-10">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. HELP & RULES RIGHT SIDE DRAWER */}
      <HelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* 5. PWA INSTALL GUIDE MODAL */}
      <AnimatePresence>
        {showInstallGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstallGuide(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                className="w-full max-w-md rounded-3xl bg-slate-950/95 border border-amber-500/30 p-6 shadow-2xl space-y-5 text-left pointer-events-auto relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">
                        Installer SIPA Arena
                      </h3>
                      <p className="text-xs font-mono text-amber-300">
                        Application Web Progressive (PWA)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInstallGuide(false)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Installez <strong className="text-white">SIPA Arena</strong> sur votre appareil pour y accéder en plein écran comme une application native, avec lancement instantané et jeu hors-ligne (Solo IA & Pass & Play).
                </p>

                {isIosDevice() ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-slate-200">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                      Sur iPhone / iPad (Safari) :
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                      <span>Appuyez sur le bouton <strong className="text-white">Partager</strong> <Share className="w-3.5 h-3.5 inline text-blue-400 mx-0.5" /> dans la barre Safari.</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                      <span>Choisissez <strong className="text-white">« Sur l'écran d'accueil »</strong> puis validez.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-slate-200">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                      Sur Ordinateur ou Android (Chrome / Edge / Brave) :
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                      <span>Cliquez sur l'icône <strong className="text-white">Installer</strong> <Download className="w-3.5 h-3.5 inline text-amber-400 mx-0.5" /> à droite de la barre d'adresse (ou dans le menu ⋮ du navigateur).</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                      <span>Confirmez avec <strong className="text-white">« Installer »</strong> pour ajouter SIPA à vos applications.</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowInstallGuide(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs uppercase tracking-widest cursor-pointer"
                >
                  Compris
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
