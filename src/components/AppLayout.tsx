/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  User,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';

interface AppLayoutProps {
  activeTab: 'arena' | 'profile' | 'stats';
  onNavigate: (path: string) => void;
  theme?: string;
  onToggleTheme?: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppLayout({
  activeTab,
  onNavigate,
  theme,
  onToggleTheme,
  onLogout,
  children,
}: AppLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

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
              onClick={() => onNavigate('/arene-de-jeu')}
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
              onClick={() => onNavigate('/profil')}
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
              onClick={() => onNavigate('/stats')}
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
          onClick={() => onNavigate('/arene-de-jeu')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition duration-200 cursor-pointer ${activeTab === 'arena' ? 'text-blue-400' : 'text-slate-400'
            }`}
        >
          <Zap className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold font-mono tracking-wide uppercase">Arène</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onNavigate('/profil')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition duration-200 cursor-pointer ${activeTab === 'profile' ? 'text-blue-400' : 'text-slate-400'
            }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold font-mono tracking-wide uppercase">Profil</span>
        </button>

        {/* Stats Tab */}
        <button
          onClick={() => onNavigate('/stats')}
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

      {/* 3. Main Content Container */}
      <div className="flex-1 min-w-0 pb-20 md:pb-0 flex flex-col">
        {children}
      </div>
    </div>
  );
}
