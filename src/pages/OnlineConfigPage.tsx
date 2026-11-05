/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Globe,
  ArrowRight,
  ArrowLeft,
  Key,
  PlusCircle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface OnlineConfigPageProps {
  currentUser: { id: string; username: string; avatarId: string };
  onCreateOnline: (opts: { pseudo: string; avatarId: string }) => Promise<void> | void;
  onJoinOnline: (roomId: string, opts: { pseudo: string; avatarId: string }) => Promise<void> | void;
  onNavigate: (path: string) => void;
  initialRoomId?: string;
}

export function OnlineConfigPage({
  currentUser,
  onCreateOnline,
  onJoinOnline,
  onNavigate,
  initialRoomId,
}: OnlineConfigPageProps) {
  const [enteredRoomId, setEnteredRoomId] = useState(initialRoomId || '');
  const [onlineError, setOnlineError] = useState('');
  const [onlineLoading, setOnlineLoading] = useState(false);

  const handleBack = () => {
    sound.playMenuClick();
    onNavigate('/arene-de-jeu');
  };

  const handleOnlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredRoomId.trim()) return;

    sound.playModeSelect();
    setOnlineLoading(true);
    setOnlineError('');
    try {
      await onJoinOnline(enteredRoomId.trim(), {
        pseudo: currentUser.username,
        avatarId: currentUser.avatarId,
      });
    } catch (err: any) {
      sound.playSacrifice();
      setOnlineError(err.message || 'Impossible de rejoindre le salon.');
    } finally {
      setOnlineLoading(false);
    }
  };

  const handleCreateOnlineRoom = async () => {
    sound.playModeSelect();
    setOnlineLoading(true);
    setOnlineError('');
    try {
      await onCreateOnline({
        pseudo: currentUser.username,
        avatarId: currentUser.avatarId,
      });
    } catch (err: any) {
      sound.playSacrifice();
      setOnlineError(err.message || 'Erreur lors de la création du salon.');
    } finally {
      setOnlineLoading(false);
    }
  };

  return (
    <motion.div
      key="online_config"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-4xl mx-auto flex flex-col justify-center my-auto py-4"
    >
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 border border-amber-500/25 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden text-left">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-400">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
                  Arène Multijoueur
                </h2>
                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  En Direct
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rejoignez une table avec un code ou créez votre propre salon privé.
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

        {/* Online Content Grid */}
        <div className="space-y-6 pt-6">
          {onlineError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-center font-mono flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{onlineError}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            
            {/* 1. REJOIN D'UN SALON PAR CODE */}
            <form
              onSubmit={handleOnlineSubmit}
              className="rounded-2xl p-6 bg-slate-900/60 border border-white/10 flex flex-col justify-between gap-5 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    Rejoindre un Salon
                  </h3>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">
                  Entrez le code secret à 6 chiffres partagé par l'hôte de la partie :
                </p>

                <div className="pt-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredRoomId}
                    onChange={(e) => setEnteredRoomId(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl py-3 px-4 text-center font-mono text-xl tracking-[0.3em] font-black text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={onlineLoading || enteredRoomId.length < 4}
                className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {onlineLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Rejoindre la Table</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* 2. CRÉATION D'UN NOUVEAU SALON */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-950 border border-amber-500/20 flex flex-col justify-between gap-5 relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    Créer un Salon Privé
                  </h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Générez une nouvelle table sécurisée. Vous obtiendrez un code d'invitation à envoyer à vos amis.
                </p>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fonctionnalités Hôte</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Vous décidez du moment du lancement dès que 2 à 4 joueurs sont prêts.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={onlineLoading}
                onClick={handleCreateOnlineRoom}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {onlineLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>Créer le Salon</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
