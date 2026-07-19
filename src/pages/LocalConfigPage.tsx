/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface LocalConfigPageProps {
  currentUser: { id: string; username: string; avatarId: string };
  onJoinPassAndPlay: (opts: { pseudo: string; avatarId: string; playerCount: number }) => void;
  onNavigate: (path: string) => void;
}

export function LocalConfigPage({ currentUser, onJoinPassAndPlay, onNavigate }: LocalConfigPageProps) {
  const [passCount, setPassCount] = useState<number>(3);

  return (
    <motion.div
      key="local_config"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full flex flex-col"
    >
      <div className="glass p-6 md:p-8 shadow-2xl border border-white/10 rounded-3xl h-full flex flex-col justify-center relative overflow-hidden min-h-[460px]">
        {/* Glowing orbs */}
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
                  Configurez votre partie locale Pass & Play.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/arene-de-jeu')}
              className="self-start sm:self-center px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-350 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Retour
            </button>
          </div>

          {/* Pass & Play Config Panel */}
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
                onClick={() => onNavigate('/arene-de-jeu')}
                className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition cursor-pointer text-xs uppercase tracking-wider"
              >
                Annuler
              </button>
              <button
                onClick={() => onJoinPassAndPlay({ pseudo: currentUser.username, avatarId: currentUser.avatarId, playerCount: passCount })}
                className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-550 hover:to-pink-550 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 transition flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-widest"
              >
                Lancer la Table <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
