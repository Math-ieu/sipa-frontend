/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AVATARS } from '../utils/avatars';
import { sound } from '../utils/sound';
import {
  Copy,
  Check,
  Link,
  Crown,
  Users,
  Play,
  LogOut,
  Sparkles,
  UserPlus,
} from 'lucide-react';

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
  const [copiedLink, setCopiedLink] = useState(false);
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isHost = myPlayer?.isHost;

  const handleCopy = () => {
    sound.playMenuClick();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    sound.playMenuClick();
    const link = `${window.location.origin}/?room=${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStart = () => {
    sound.playModeSelect();
    onStartGame();
  };

  const handleLeave = () => {
    sound.playMenuClick();
    onLeaveLobby();
  };

  // 4 table slots
  const slots = [0, 1, 2, 3];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto px-4 py-8 text-left space-y-6"
    >
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 border border-amber-500/25 shadow-[0_12px_45px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

        {/* 1. HEADER & CODE */}
        <div className="text-center space-y-2 pb-6 border-b border-white/10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Salon Multijoueur Privé</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Salle d'Attente de la Table
          </h2>

          {/* CODE BADGE */}
          <div className="pt-2">
            <div className="inline-flex flex-col items-center p-3 px-6 rounded-2xl bg-black/50 border border-white/15 shadow-inner">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                Code Secret du Salon
              </span>
              <span className="text-3xl md:text-4xl font-mono font-black text-cyan-300 tracking-[0.25em] py-1 select-all">
                {roomCode}
              </span>
              
              <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/35 text-cyan-300 font-mono text-xs font-bold transition border border-cyan-500/30 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Lien copié !</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-3.5 h-3.5" />
                      <span>Lien d'invitation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. TABLE SLOTS GRID (4 Duellists) */}
        <div className="py-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5 font-bold">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Joueurs Assis ({players.length}/4)</span>
            </span>
            {players.length < 2 && (
              <span className="text-amber-400 font-bold animate-pulse text-[11px]">
                En attente d'au moins 1 autre duelliste...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slots.map((index) => {
              const player = players[index];
              if (player) {
                const avatar = AVATARS.find((av) => av.id === player.avatarId) || AVATARS[0];
                const isMe = player.id === myPlayerId;

                return (
                  <div
                    key={player.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      isMe
                        ? 'bg-blue-600/15 border-blue-400/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg border relative ${avatar.color}`}>
                        {avatar.symbol}
                        {player.isHost && (
                          <div className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-slate-950 border border-amber-400 shadow">
                            <Crown className="w-3 h-3 text-amber-400" />
                          </div>
                        )}
                      </div>

                      <div className="leading-tight">
                        <div className="font-bold text-sm text-white flex items-center gap-1">
                          <span>{player.name}</span>
                          {isMe && (
                            <span className="text-[10px] font-mono text-blue-400 font-bold">
                              (Vous)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                          Prêt à jouer
                        </span>
                      </div>
                    </div>

                    {player.isHost && (
                      <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
                        Hôte
                      </span>
                    )}
                  </div>
                );
              }

              // Empty Slot
              return (
                <div
                  key={`empty-${index}`}
                  className="p-3.5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl border border-dashed border-white/15 flex items-center justify-center text-slate-500">
                      <UserPlus className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Place libre #{index + 1}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    En attente...
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. ACTION CONTROLS */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {isHost ? (
            <button
              onClick={handleStart}
              disabled={players.length < 2}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Lancer la Partie de SIPA ({players.length}/4 Joueurs)</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-slate-300 font-mono flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>En attente du lancement par l'Hôte de la table...</span>
            </div>
          )}

          <button
            onClick={handleLeave}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Quitter le Salon</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}
