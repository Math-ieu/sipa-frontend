/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { isFirebaseConfigured } from '../utils/backendService';
import {
  Cpu,
  Smartphone,
  Globe,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface ArenaPageProps {
  onNavigate: (path: string) => void;
}

export function ArenaPage({ onNavigate }: ArenaPageProps) {
  return (
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
            {/* Option 1: AI */}
            <motion.button
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('/arene-de-jeu/ia')}
              className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-blue-500/15 via-slate-900/50 to-slate-950/80 border border-white/10 hover:border-blue-400 text-left transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] h-full relative overflow-hidden"
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
              onClick={() => onNavigate('/arene-de-jeu/local')}
              className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-purple-500/15 via-slate-900/50 to-slate-950/80 border border-white/10 hover:border-purple-400 text-left transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] h-full relative overflow-hidden"
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
              onClick={() => onNavigate('/arene-de-jeu/multijoueur')}
              className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-cyan-500/15 via-slate-900/50 to-slate-950/80 border border-white/10 hover:border-cyan-400 text-left transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_40px_rgba(6,182,212,0.25)] h-full relative overflow-hidden"
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
              <div className="pt-6 mt-auto flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-cyan-450 group-hover:text-cyan-300 w-full border-t border-white/5">
                <span>Multijoueur</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-300" />
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
