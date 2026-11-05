/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BookOpen,
  Sparkles,
  Flame,
  Crown,
  ShieldAlert,
  Bot,
  Users,
  Globe,
  CheckCircle2,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpDrawer({ isOpen, onClose }: HelpDrawerProps) {
  const handleClose = () => {
    sound.playMenuClick();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Right-Side Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md md:max-w-lg bg-slate-950/95 border-l border-white/15 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col text-left overflow-hidden"
          >
            {/* 1. DRAWER STICKY HEADER */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-[1.5px] shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
                  <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-amber-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                      Guide & Règles
                    </h2>
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      SIPA
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    L'Art du Pli & la Puissance des 7
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white transition duration-200 cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. SCROLLABLE RULES CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar text-xs leading-relaxed text-slate-300">
              
              {/* Hero Presentation */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-950 border border-amber-500/25 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px] font-mono">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Présentation du Jeu</span>
                </div>
                <p>
                  <strong>SIPA</strong> est un jeu de cartes rapide, tactique et impitoyable. Il se joue avec un deck de <strong>32 cartes</strong> (du 7 à l'As). Chaque joueur reçoit <strong>5 cartes</strong> et la manche se dispute en <strong>5 plis successifs</strong>.
                </p>
              </div>

              {/* Règle 1: Hiérarchie des cartes */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-bold uppercase text-[11px] font-mono">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>1. Puissance des Cartes</span>
                </div>
                <p>
                  L'ordre de force des cartes dans une même couleur est :
                </p>
                <div className="flex items-center justify-between gap-1 p-2 bg-black/40 rounded-xl border border-white/5 font-mono font-black text-center text-xs text-white">
                  <span className="text-amber-400">A</span>
                  <span className="text-slate-500">&gt;</span>
                  <span>K</span>
                  <span className="text-slate-500">&gt;</span>
                  <span>Q</span>
                  <span className="text-slate-500">&gt;</span>
                  <span>J</span>
                  <span className="text-slate-500">&gt;</span>
                  <span>10</span>
                  <span className="text-slate-500">&gt;</span>
                  <span>9</span>
                  <span className="text-slate-500">&gt;</span>
                  <span>8</span>
                  <span className="text-slate-500">&gt;</span>
                  <span className="text-cyan-400">7</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  L'As est la carte la plus forte, le 7 est la plus basse (sauf au dernier pli !).
                </p>
              </div>

              {/* Règle 2: Obligation de fournir la couleur */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-bold uppercase text-[11px] font-mono">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>2. La Couleur Demandée (Follow Suit)</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Vous avez la couleur demandée :</strong> Vous devez obligatoirement en jouer une (supérieure ou inférieure).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Vous n'avez pas la couleur :</strong> Vous devez « sacrifier » n'importe quelle carte. Une carte sacrifiée est défaussée face cachée et <em>ne peut jamais remporter le pli</em>.
                    </span>
                  </li>
                </ul>
                <p className="text-[11px] text-slate-400 bg-black/30 p-2.5 rounded-xl border border-white/5">
                  Celui qui pose la carte la plus forte de la couleur demandée <strong>remporte le pli</strong> et prend la main pour débuter le pli suivant !
                </p>
              </div>

              {/* Règle 3: Le pouvoir des 7 */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900/60 to-slate-950 border border-amber-500/35 space-y-2.5 shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-[11px] font-mono">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>3. Le Pouvoir Spécial des 7 (Pli 5)</span>
                </div>
                <p>
                  Toute la tension de SIPA réside dans le <strong>5ème et dernier pli</strong> :
                </p>
                <div className="space-y-1.5 p-3 bg-black/40 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Flame className="w-3.5 h-3.5" /> Dernier pli gagné avec un 7
                    </span>
                    <span className="font-mono text-emerald-400 font-black">+2 Pts</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Déclenche une <strong>Série de 7</strong> ! Chaque 7 gagnant successif lors des manches suivantes double la prime (+2, +4, +6...).
                  </p>
                </div>
                <div className="space-y-1.5 p-3 bg-black/40 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>Dernier pli gagné sans 7</span>
                    <span className="font-mono text-slate-300 font-black">+1 Pt</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Score classique forfaitaire si le dernier pli est remporté avec une autre carte (8 à As).
                  </p>
                </div>
              </div>

              {/* Règle 4: Les Modes de Jeu */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-bold uppercase text-[11px] font-mono">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>4. Les 3 Modes de Jeu</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Bot className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Solo contre IA</strong>
                      <span className="text-[11px] text-slate-400">Entraînez-vous à votre rythme contre 1 à 3 robots tactiques.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Passer & Jouer (Local)</strong>
                      <span className="text-[11px] text-slate-400">Passez-vous le même appareil entre amis avec masquage automatique des cartes.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Globe className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Multijoueur en Ligne</strong>
                      <span className="text-[11px] text-slate-400">Créez un salon privé par code à 6 chiffres et jouez en temps réel via WebSockets.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. DRAWER STICKY FOOTER */}
            <div className="p-4 border-t border-white/10 bg-slate-900/60 shrink-0">
              <button
                onClick={handleClose}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>J'ai compris les règles !</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

