/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bot,
  ArrowRight,
  Lightbulb,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface AIConfigPageProps {
  currentUser: { id: string; username: string; avatarId: string };
  onJoinLocalAI: (opts: { pseudo: string; avatarId: string; opponentCount: number }) => void;
  onNavigate: (path: string) => void;
}

export function AIConfigPage({ currentUser, onJoinLocalAI, onNavigate }: AIConfigPageProps) {
  const [aiCount, setAiCount] = useState<number>(3);

  const handleBack = () => {
    sound.playMenuClick();
    onNavigate('/arene-de-jeu');
  };

  const handleStart = () => {
    sound.playModeSelect();
    onJoinLocalAI({
      pseudo: currentUser.username,
      avatarId: currentUser.avatarId,
      opponentCount: aiCount - 1,
    });
  };

  return (
    <motion.div
      key="ai_config"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-3xl mx-auto flex flex-col justify-center my-auto py-4"
    >
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 border border-blue-500/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden text-left">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1.5px] shadow-[0_0_20px_rgba(59,130,246,0.35)] shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-blue-400">
                <Bot className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
                  Configuration Solo
                </h2>
                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
                  IA Tactique
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Réglez la configuration de votre table d'entraînement.
              </p>
            </div>
          </div>

          <button
            onClick={handleBack}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Retour</span>
          </button>
        </div>

        {/* Configuration content */}
        <div className="space-y-6 pt-6">
          <div className="space-y-3">
            <label className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest block">
              Format de la Table (Joueurs totaux)
            </label>
            
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[2, 3, 4].map((count) => {
                const isSelected = aiCount === count;
                return (
                  <button
                    key={count}
                    onClick={() => {
                      sound.playMenuClick();
                      setAiCount(count);
                    }}
                    className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer select-none relative overflow-hidden ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-400 text-white shadow-[0_0_24px_rgba(59,130,246,0.35)] scale-[1.02] ring-2 ring-blue-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-3xl font-mono font-black tracking-tight">{count}</span>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold">Joueurs</span>
                    <span className="text-[9px] font-mono text-slate-400">
                      (Vous + {count - 1} IA)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tactical Advice Box */}
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Conseil de jeu :</strong> À 4 joueurs, les défausses et sacrifices de cartes deviennent critiques. Sauvegardez vos 7 maîtres pour le dernier pli pour maximiser vos points de série !
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleBack}
              className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={handleStart}
              className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lancer la Partie</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
