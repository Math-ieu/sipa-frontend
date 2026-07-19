/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { isFirebaseConfigured } from '../utils/backendService';
import {
  Globe,
  Zap,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface OnlineConfigPageProps {
  currentUser: { id: string; username: string; avatarId: string };
  onCreateOnline: (opts: { pseudo: string; avatarId: string }) => Promise<void> | void;
  onJoinOnline: (roomId: string, opts: { pseudo: string; avatarId: string }) => Promise<void> | void;
  onNavigate: (path: string) => void;
  initialRoomId?: string;
}

export function OnlineConfigPage({ currentUser, onCreateOnline, onJoinOnline, onNavigate, initialRoomId }: OnlineConfigPageProps) {
  const [enteredRoomId, setEnteredRoomId] = useState(initialRoomId || '');
  const [onlineError, setOnlineError] = useState('');
  const [onlineLoading, setOnlineLoading] = useState(false);

  const handleOnlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredRoomId.trim()) return;

    setOnlineLoading(true);
    setOnlineError('');
    try {
      await onJoinOnline(enteredRoomId.trim(), { pseudo: currentUser.username, avatarId: currentUser.avatarId });
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
      await onCreateOnline({ pseudo: currentUser.username, avatarId: currentUser.avatarId });
    } catch (err: any) {
      setOnlineError(err.message || "Erreur de création du salon.");
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
                  Rejoignez ou créez un salon multijoueur en ligne.
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

          {/* Online Config Panel */}
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
                    onClick={() => onNavigate('/arene-de-jeu/ia')}
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
        </div>
      </div>
    </motion.div>
  );
}
