/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { registerUser, loginUser } from '../utils/backendService';
import { AVATARS } from './LobbyViews';
import { User, Lock, RefreshCw, Sparkles, Key, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: { id: string; username: string; avatarId: string }, token: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarId, setAvatarId] = useState('av1');
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (authMode === 'register') {
        // Envoi avec le champ Honeypot anti-bot
        const data = await registerUser(username.trim(), password, avatarId, honeypot);
        if (data && data.token && data.user) {
          onLogin(data.user, data.token);
        }
      } else {
        const data = await loginUser(username.trim(), password);
        if (data && data.token && data.user) {
          onLogin(data.user, data.token);
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setError('');
    setUsername('');
    setPassword('');
    setHoneypot('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-mesh text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-blue-500 relative">
      {/* Decorative ambient orbs */}
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Page Container */}
      <div className="w-full max-w-lg relative z-10 space-y-8">
        
        {/* SIPA Branding */}
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 font-mono text-[10px] mb-4 backdrop-blur-md uppercase tracking-wider font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Portail d'Accès Sécurisé
          </motion.div>
          
          <h1 className="text-7xl md:text-8xl font-black font-sans tracking-tighter bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]">
            SIPA
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 font-medium max-w-sm mx-auto leading-relaxed">
            Rejoignez l'arène. Connectez-vous pour commencer à jouer.
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass p-8 md:p-10 shadow-2xl relative overflow-hidden text-left">
          {/* Subtle decoration inside card */}
          <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
          
          {/* Tab buttons */}
          <div className="flex border-b border-white/5 pb-2.5 mb-6 justify-start gap-5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTabChange('login')}
              className={`pb-2.5 text-sm font-mono font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
                authMode === 'login' 
                  ? 'text-blue-400 border-blue-450' 
                  : 'text-slate-450 border-transparent hover:text-slate-200'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTabChange('register')}
              className={`pb-2.5 text-sm font-mono font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
                authMode === 'register' 
                  ? 'text-blue-400 border-blue-450' 
                  : 'text-slate-450 border-transparent hover:text-slate-200'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Errors display */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3 bg-red-950/30 border border-red-500/20 text-xs text-amber-400 rounded-xl text-center font-mono font-medium mb-5"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.substring(0, 16))}
                  placeholder="Pseudo ou Nom de joueur"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition placeholder:text-slate-550"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition placeholder:text-slate-550"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer select-none"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Invisible anti-bot Honeypot field */}
            {authMode === 'register' && (
              <div 
                className="honeypot-container" 
                style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none' }}
                aria-hidden="true"
              >
                <label htmlFor="email_confirm">Ne rien inscrire dans cette case</label>
                <input
                  type="text"
                  id="email_confirm"
                  name="email_confirm"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
            )}

            {/* Sceau Selection (only on Register tab) */}
            {authMode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2.5 overflow-hidden"
              >
                <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest">
                  Sélectionnez votre Sceau
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      disabled={loading}
                      onClick={() => setAvatarId(av.id)}
                      className={`
                        aspect-square rounded-xl text-lg font-bold flex items-center justify-center transition-all border cursor-pointer
                        ${av.color}
                        ${avatarId === av.id 
                          ? 'border-blue-400 ring-2 ring-blue-500/35 scale-105 opacity-100' 
                          : 'opacity-40 hover:opacity-100'
                        }
                      `}
                    >
                      {av.symbol}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-650 hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-blue-500/10"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : authMode === 'login' ? (
                  <>
                    <Key className="w-4 h-4" /> Se connecter
                  </>
                ) : (
                  <>
                    Créer mon compte & Accéder à SIPA
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center font-mono text-[10px] text-slate-500">
          SIPA © 2026 • Accords de Sécurité Chiffrés
        </div>
      </div>
    </div>
  );
}
