/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AVATARS } from '../utils/avatars';
import {
  Copy,
  Check,
  Link,
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
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?room=${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-12">
      <div className="glass p-6 md:p-8 shadow-2xl space-y-6">

        {/* Room Header */}
        <div className="text-center">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
            SALON MULTIJOUEUR EN LIGNE
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Salle d'Attente</h2>
        </div>

        {/* Code display Box */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center space-y-3 relative overflow-hidden backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-mono">CODE DU SALON</div>
          <div className="text-4xl font-mono font-black text-blue-400 tracking-wider">
            {roomCode}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition border border-white/20 text-xs font-semibold cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copié !
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copier le code
                </>
              )}
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/35 transition border border-blue-500/30 text-xs font-semibold cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Lien copié !
                </>
              ) : (
                <>
                  <Link className="w-3.5 h-3.5" /> Copier le lien
                </>
              )}
            </button>
          </div>
        </div>

        {/* Player List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 uppercase tracking-wider px-1">
            <span>Participants ({players.length}/4)</span>
            {players.length < 2 && <span className="text-amber-400 animate-pulse font-bold">Minimum 2 requis</span>}
          </div>

          <div className="space-y-2">
            {players.map((p) => {
              const avatar = AVATARS.find((av) => av.id === p.avatarId) || AVATARS[0];
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-sans text-sm border ${avatar.color}`}>
                      {avatar.symbol}
                    </div>
                    <div>
                      <span className="font-bold text-slate-100">
                        {p.name}
                      </span>
                      {p.id === myPlayerId && (
                        <span className="ml-1.5 text-[10px] text-blue-400 font-mono font-bold uppercase">
                          (Moi)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.isHost ? (
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                        HÔTE
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">Connecté</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 space-y-2.5">
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={players.length < 2}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-550/20 transition-all duration-200 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Lancer la Partie de SIPA
            </button>
          ) : (
            <div className="text-center text-xs text-slate-300 italic py-3 bg-white/5 border border-dashed border-white/10 rounded-xl">
              En attente du lancement par l'Hôte...
            </div>
          )}

          <button
            onClick={onLeaveLobby}
            className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Quitter le Salon
          </button>
        </div>

      </div>
    </div>
  );
}
