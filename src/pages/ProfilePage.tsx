/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../utils/backendService';
import { AVATARS } from '../utils/avatars';
import {
  User,
  Crown,
  Zap,
  Globe,
  Lock,
  LogOut,
  Key,
  Settings,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  Award,
  RefreshCw,
  Check,
  Volume2,
  VolumeX,
  Smartphone,
  Gamepad2,
  Sliders,
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: { id: string; username: string; avatarId: string };
  onLogin: (user: { id: string; username: string; avatarId: string }, token: string) => void;
  onLogout: () => void;
}

export function ProfilePage({ currentUser, onLogin, onLogout }: ProfilePageProps) {
  const [editPseudo, setEditPseudo] = useState(currentUser.username);
  const [editAvatarId, setEditAvatarId] = useState(currentUser.avatarId);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // User game preferences state
  const [prefSound, setPrefSound] = useState(() => {
    const saved = localStorage.getItem('sipa_pref_sound');
    return saved !== null ? saved === 'true' : true;
  });
  const [prefAnimations, setPrefAnimations] = useState(() => {
    const saved = localStorage.getItem('sipa_pref_animations');
    return saved !== null ? saved === 'true' : true;
  });
  const [prefAutoMask, setPrefAutoMask] = useState(() => {
    const saved = localStorage.getItem('sipa_pref_automask');
    return saved !== null ? saved === 'true' : true;
  });

  // Stats for the compact profile card
  const [stats, setStats] = useState<{ wins: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching profile stats:', err);
      }
    };
    fetchStats();
  }, [currentUser.id]);

  // Sync edit fields when user profile updates
  useEffect(() => {
    setEditPseudo(currentUser.username);
    setEditAvatarId(currentUser.avatarId);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setEditError('');
    setEditSuccess('');
  }, [currentUser.username, currentUser.avatarId]);

  const handleToggleSound = () => {
    const next = !prefSound;
    setPrefSound(next);
    localStorage.setItem('sipa_pref_sound', String(next));
    window.dispatchEvent(new CustomEvent('sipa_sound_toggle', { detail: next }));
  };

  const handleToggleAnimations = () => {
    const next = !prefAnimations;
    setPrefAnimations(next);
    localStorage.setItem('sipa_pref_animations', String(next));
  };

  const handleToggleAutoMask = () => {
    const next = !prefAutoMask;
    setPrefAutoMask(next);
    localStorage.setItem('sipa_pref_automask', String(next));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    const trimmedPseudo = editPseudo.trim();
    if (!trimmedPseudo) {
      setEditError("Le pseudo ne peut pas être vide.");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setEditError("Veuillez saisir votre mot de passe actuel pour le modifier.");
        return;
      }
      if (newPassword.length < 6) {
        setEditError("Le nouveau mot de passe doit faire au moins 6 caractères.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setEditError("Les nouveaux mots de passe ne correspondent pas.");
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      const token = localStorage.getItem('sipa_auth_token');
      if (!token) {
        setEditError("Session absente. Veuillez vous reconnecter.");
        setIsSavingProfile(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: trimmedPseudo,
          avatarId: editAvatarId,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword ? newPassword : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setEditError(data.error || "Une erreur est survenue lors de la mise à jour.");
      } else {
        setEditSuccess("Profil mis à jour avec succès !");
        onLogin(data.user, data.token);

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setEditError("Impossible de contacter le serveur.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const pseudo = currentUser.username;
  const selectedAvatarId = currentUser.avatarId;

  return (
    <motion.div
      key="profile_tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-white/5 mb-6 text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/5">
            <User className="w-6 h-6 text-blue-450" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              Mon Profil
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gérez vos informations de compte, avatar, et sécurité
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          
          {/* Left Column: Visual Card, Badges & Preferences (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            {/* Left Column: Visual Profile Card (Compact Horizontal Banner) */}
            <div className="w-full glass p-4 rounded-2xl text-left shadow-lg border border-white/10 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md">
              <div className="flex items-center gap-4">
                {(() => {
                  const myAv = AVATARS.find(av => av.id === selectedAvatarId) || AVATARS[0];
                  return (
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl font-bold border border-white/15 ${myAv.color} shadow-lg transform hover:scale-[1.03] transition-all duration-300 relative`}>
                      {myAv.symbol}
                    </div>
                  );
                })()}
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-white tracking-tight">{pseudo}</span>
                    <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                      Membre SIPA <Crown className="w-3 h-3 text-amber-500" />
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                    Joueur enregistré
                  </span>
                </div>
              </div>

              {/* Right Column: Profile Stats and Logout */}
              <div className="flex items-center gap-4 w-full sm:w-auto lg:w-full xl:w-auto justify-between sm:justify-end lg:justify-between xl:justify-end">
                {/* Compact Stats */}
                <div className="flex gap-4 bg-white/5 border border-white/5 py-1.5 px-3 rounded-xl text-xs">
                  <div className="text-center px-1">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Statut</span>
                    <span className="text-slate-100 font-semibold text-xs">Actif</span>
                  </div>
                  <div className="text-center border-l border-white/5 pl-3 pr-1">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Victoires</span>
                    <span className="text-emerald-450 font-bold text-xs">{stats?.wins || 0} V</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400 font-bold text-[10px] transition duration-200 cursor-pointer shadow-sm uppercase tracking-wider"
                  title="Déconnexion"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>

            {/* Badge Trophies & Achievements Section */}
            <div className="w-full glass p-6 rounded-2xl text-left shadow-lg border border-white/10 bg-slate-900/40 backdrop-blur-md">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5 font-mono border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 animate-bounce" /> Distinctions & Trophées
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Trophy 1: Champion */}
                <div className="flex flex-col items-center justify-between p-3.5 bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-2xl text-center transition group relative shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-md group-hover:scale-110 transition duration-300">
                    <Crown className="w-5.5 h-5.5 fill-amber-500/20" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-2">Champion SIPA</span>
                  <span className="text-[9px] text-emerald-450 font-mono mt-0.5 uppercase tracking-wide">Débloqué</span>
                </div>

                {/* Trophy 2: Tacticien */}
                <div className="flex flex-col items-center justify-between p-3.5 bg-white/5 border border-white/10 hover:border-blue-500/30 rounded-2xl text-center transition group relative shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-450 shadow-md group-hover:scale-110 transition duration-300">
                    <Zap className="w-5.5 h-5.5 fill-blue-500/20" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-2">Fin Tacticien</span>
                  <div className="w-full mt-2.5 space-y-1">
                    <div className="flex justify-between text-[8px] font-mono text-slate-400 leading-none">
                      <span>Parties</span>
                      <span>3/5</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>

                {/* Trophy 3: Explorateur */}
                <div className="flex flex-col items-center justify-between p-3.5 bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-2xl text-center transition group relative shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-405 shadow-md group-hover:scale-110 transition duration-300">
                    <Globe className="w-5.5 h-5.5 fill-cyan-500/20" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-2">Explorateur Web</span>
                  <span className="text-[9px] text-emerald-450 font-mono mt-0.5 uppercase tracking-wide">Débloqué</span>
                </div>

                {/* Trophy 4: Invincible */}
                <div className="flex flex-col items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-2xl text-center relative opacity-50 shadow-inner group">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500 relative">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-2">Invincible</span>
                  <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase tracking-wide">10 Victoires</span>
                </div>
              </div>
            </div>

            {/* User Game Preferences Customization Section */}
            <div className="w-full glass p-6 rounded-2xl text-left shadow-lg border border-white/10 bg-slate-900/40 backdrop-blur-md">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5 font-mono border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-500" /> Préférences & Réglages de Jeu
              </h3>

              <div className="space-y-4">
                {/* Pref 1: Sounds */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${prefSound ? 'bg-emerald-500/10 text-emerald-450' : 'bg-red-500/10 text-red-400'}`}>
                      {prefSound ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-200 block">Effets Sonores & Musiques</span>
                      <span className="text-[10px] text-slate-455 block">Activer les signaux sonores en jeu</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`w-11 h-6 rounded-full transition-all duration-200 focus:outline-none flex items-center p-0.5 cursor-pointer ${
                      prefSound ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 bg-white rounded-full shadow" />
                  </button>
                </div>

                {/* Pref 2: Animations */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Gamepad2 className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-200 block">Animations 3D Complexes</span>
                      <span className="text-[10px] text-slate-455 block">Activer les mouvements fluides des cartes</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAnimations}
                    className={`w-11 h-6 rounded-full transition-all duration-200 focus:outline-none flex items-center p-0.5 cursor-pointer ${
                      prefAnimations ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 bg-white rounded-full shadow" />
                  </button>
                </div>

                {/* Pref 3: Pass and Play Auto Mask */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <Smartphone className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-200 block">Auto-masquage Local (Pass & Play)</span>
                      <span className="text-[10px] text-slate-455 block">Masquer les cartes lors du changement de joueur</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutoMask}
                    className={`w-11 h-6 rounded-full transition-all duration-200 focus:outline-none flex items-center p-0.5 cursor-pointer ${
                      prefAutoMask ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Form Editor (lg:col-span-7) */}
          <div className="lg:col-span-7 w-full flex flex-col gap-6">
            <div className="w-full glass p-6 rounded-2xl text-left shadow-lg border border-white/10 bg-slate-900/40 backdrop-blur-md">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-6 font-mono border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-500" /> Paramètres d'identité & sécurité
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {editError && (
                  <div className="p-3 bg-red-950/20 border border-red-500/20 text-xs text-amber-400 rounded-xl flex items-center justify-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>{editError}</span>
                  </div>
                )}

                {editSuccess && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-450 rounded-xl flex items-center justify-center gap-2 font-mono">
                    <Sparkles className="w-4 h-4 text-emerald-450" />
                    <span>{editSuccess}</span>
                  </div>
                )}

                {/* Pseudo Section */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Pseudonyme
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <User className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      maxLength={16}
                      value={editPseudo}
                      onChange={(e) => setEditPseudo(e.target.value)}
                      placeholder="Nouveau pseudo"
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-10 text-sm focus:outline-none focus:border-blue-500 text-slate-100 font-semibold transition-all duration-200 shadow-sm focus:ring-1 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Avatar Grid */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Sceau de Joueur (Avatar)
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatarId(av.id)}
                        className={`
                          w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95
                          ${editAvatarId === av.id
                            ? 'bg-blue-600/10 border-blue-500 text-white ring-2 ring-blue-500/25 shadow-sm'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                          }
                        `}
                      >
                        {av.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password Section */}
                <div className="pt-5 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Changer le mot de passe (optionnel)
                    </span>
                  </div>

                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-slate-455 uppercase block">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                        <Key className="w-4 h-4" />
                      </span>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Saisissez votre mot de passe actuel"
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-10 text-xs focus:outline-none focus:border-blue-500 text-slate-100 transition-all duration-200 font-mono shadow-sm focus:ring-1 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-550 hover:text-slate-350 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-slate-455 uppercase block">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 caractères"
                          className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-blue-500 text-slate-100 transition-all duration-200 font-mono shadow-sm focus:ring-1 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-550 hover:text-slate-350 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-slate-455 uppercase block">
                        Confirmer le mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmer"
                          className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-blue-500 text-slate-100 transition-all duration-200 font-mono shadow-sm focus:ring-1 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-550 hover:text-slate-350 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Controls */}
                <div className="flex gap-4 pt-5 border-t border-white/5 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditPseudo(currentUser.username);
                      setEditAvatarId(currentUser.avatarId);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setEditError('');
                      setEditSuccess('');
                    }}
                    className="flex-1 py-3 px-4 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-slate-300 font-bold transition duration-200 cursor-pointer text-xs uppercase tracking-wider shadow-sm"
                    disabled={isSavingProfile}
                  >
                    Réinitialiser
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-blue-650 hover:bg-blue-600 border border-blue-500/30 text-white font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-widest disabled:opacity-50 shadow-md"
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Enregistrer <Check className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
