/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../utils/backendService';
import { AVATARS, BASE_AVATARS, EXCLUSIVE_AVATARS } from '../utils/avatars';
import { sound } from '../utils/sound';
import { CardView } from '../components/CardView';
import {
  ProgressionData,
  CosmeticCategory,
  fetchUserProgression,
  equipProgressionItem,
  getFrameStyle,
  getTableThemeStyle,
  RARITY_BADGES,
  formatConditionLabel,
  getConditionProgress,
} from '../utils/cosmetics';
import {
  User,
  Crown,
  Lock,
  Key,
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
  Shield,
  Flame,
  CheckCircle2,
  Trophy,
  Palette,
  Layers,
  Star,
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: { id: string; username: string; avatarId: string };
  onLogin: (user: { id: string; username: string; avatarId: string }, token: string) => void;
  onLogout: () => void;
}

type ProfileSubTab = 'passport' | 'titles' | 'cosmetics' | 'settings' | 'security';

export function ProfilePage({ currentUser, onLogin }: ProfilePageProps) {
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('passport');
  const [cosmeticFilter, setCosmeticFilter] = useState<'all' | CosmeticCategory>('all');
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
  const [equippingId, setEquippingId] = useState<string | null>(null);

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

  // Progression & Stats state
  const [progression, setProgression] = useState<ProgressionData | null>(null);

  useEffect(() => {
    const load = async () => {
      const prog = await fetchUserProgression(currentUser.id);
      if (prog) setProgression(prog);
    };
    load();
  }, [currentUser.id]);

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

  const handleSaveProfile = async (e: React.FormEvent, customAvatarId?: string) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    const avatarToSave = customAvatarId || editAvatarId;
    const trimmedPseudo = editPseudo.trim();
    if (!trimmedPseudo) {
      setEditError('Le pseudo ne peut pas être vide.');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setEditError('Veuillez saisir votre mot de passe actuel pour le modifier.');
        return;
      }
      if (newPassword.length < 6) {
        setEditError('Le nouveau mot de passe doit faire au moins 6 caractères.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setEditError('Les nouveaux mots de passe ne correspondent pas.');
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      const token = localStorage.getItem('sipa_auth_token');
      if (!token) {
        setEditError('Session absente. Veuillez vous reconnecter.');
        setIsSavingProfile(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: trimmedPseudo,
          avatarId: avatarToSave,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword ? newPassword : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setEditError(data.error || 'Une erreur est survenue lors de la mise à jour.');
      } else {
        sound.playRoundVictory();
        setEditSuccess('Passeport mis à jour avec succès !');
        onLogin(data.user, data.token);

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setEditError('Impossible de contacter le serveur.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEquip = async (slot: 'title' | 'frame' | 'cardBack' | 'table', itemId: string | null) => {
    setEquippingId(`${slot}:${itemId ?? 'auto'}`);
    setEditError('');
    setEditSuccess('');
    try {
      const updated = await equipProgressionItem(slot, itemId);
      if (updated) {
        sound.playMenuClick();
        setProgression(updated);
        setEditSuccess('Équipement mis à jour !');
      } else {
        setEditError("Impossible d'équiper cet élément.");
      }
    } finally {
      setEquippingId(null);
    }
  };

  const isAvatarUnlocked = (avId: string) => {
    if (BASE_AVATARS.some((a) => a.id === avId)) return true;
    return !!progression?.cosmetics.some((c) => c.category === 'avatar' && c.id === avId && c.unlocked);
  };

  const winsCount = progression?.counters.wins ?? 0;
  const matchesCount = progression?.counters.matches ?? 0;
  const userLevel = progression?.level ?? 1;
  const rankTitle = progression?.currentTitle.name ?? 'Initié des Cartes';
  const equippedFrameStyle = getFrameStyle(progression?.equipped.frame);
  const xpPercent = progression
    ? progression.isMaxLevel
      ? 100
      : Math.min(100, Math.round((progression.xpIntoLevel / Math.max(1, progression.xpForNextLevel)) * 100))
    : 0;

  const previewAvatar = AVATARS.find((av) => av.id === editAvatarId) || AVATARS[0];

  const unlockedTitlesCount = progression?.titles.filter((t) => t.unlocked).length ?? 1;
  const totalTitlesCount = progression?.titles.length ?? 22;
  const unlockedCosmeticsCount = progression?.cosmetics.filter((c) => c.unlocked).length ?? 3;
  const totalCosmeticsCount = progression?.cosmetics.length ?? 29;

  return (
    <motion.div
      key="profile_tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-5xl mx-auto space-y-6 text-left"
    >
      {/* 1. DUELIST PASSPORT HERO CARD */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/25 shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Glow halo */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Avatar + Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Holographic Avatar Medal with Equipped Frame */}
            <div className="relative group">
              <div
                className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl ${equippedFrameStyle.ringClass} ${equippedFrameStyle.glowClass} shrink-0 transition-all duration-300`}
              >
                <div
                  className={`w-full h-full rounded-[21px] flex items-center justify-center text-4xl md:text-5xl border border-white/20 shadow-inner ${previewAvatar.color}`}
                >
                  {previewAvatar.symbol}
                </div>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-slate-950 border border-amber-400 shadow-lg flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-mono font-black text-amber-300">
                  NIV.{userLevel}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                  {currentUser.username}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('titles')}
                  className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition shadow-sm flex items-center gap-1 cursor-pointer"
                  title="Cliquez pour changer de titre"
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  {rankTitle}
                </button>
              </div>

              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                ID Compte : <span className="text-slate-300 font-bold">{currentUser.id.slice(0, 10)}...</span>
              </p>

              <div className="flex items-center gap-3 pt-1 justify-center sm:justify-start flex-wrap">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {winsCount} Victoire{winsCount > 1 ? 's' : ''}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-xs font-mono text-slate-300">
                  {matchesCount} Partie{matchesCount > 1 ? 's' : ''} terminée{matchesCount > 1 ? 's' : ''}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-xs font-mono text-purple-300">
                  {unlockedTitlesCount}/{totalTitlesCount} Titres
                </span>
              </div>
            </div>
          </div>

          {/* Right: XP & Level Progress Card */}
          <div className="w-full lg:w-[360px] bg-black/35 border border-white/10 rounded-2xl p-4 space-y-2.5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-400">
                  Niveau {userLevel}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  / {progression?.maxLevel ?? 50}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-200">
                {progression?.isMaxLevel
                  ? `${progression.xp} XP (MAX)`
                  : `${progression?.xpIntoLevel ?? 0} / ${progression?.xpForNextLevel ?? 80} XP`}
              </span>
            </div>

            {/* XP Bar */}
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden shadow-inner p-[1px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              />
            </div>

            {/* Next Rewards Preview */}
            {progression && progression.nextRewards.length > 0 && (
              <div className="pt-1 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                <span className="uppercase tracking-wider text-slate-400 shrink-0">Prochain :</span>
                <div className="flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-amber-200 font-bold truncate">
                    {progression.nextRewards[0].name}
                  </span>
                  <span className="text-slate-500 shrink-0">
                    ({formatConditionLabel(progression.nextRewards[0].condition)})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUB-TABS NAVIGATION BAR */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            sound.playMenuClick();
            setActiveSubTab('passport');
          }}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'passport'
              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Identité & Sceau</span>
        </button>

        <button
          onClick={() => {
            sound.playMenuClick();
            setActiveSubTab('titles');
          }}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'titles'
              ? 'bg-orange-500/15 border border-orange-500/30 text-orange-300 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Titres & Exploits</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-200">
            {unlockedTitlesCount}/{totalTitlesCount}
          </span>
        </button>

        <button
          onClick={() => {
            sound.playMenuClick();
            setActiveSubTab('cosmetics');
          }}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'cosmetics'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Récompenses & Cosmétiques</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-200">
            {unlockedCosmeticsCount}/{totalCosmeticsCount}
          </span>
        </button>

        <button
          onClick={() => {
            sound.playMenuClick();
            setActiveSubTab('settings');
          }}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'settings'
              ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Préférences Jeu</span>
        </button>

        <button
          onClick={() => {
            sound.playMenuClick();
            setActiveSubTab('security');
          }}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'security'
              ? 'bg-blue-500/15 border border-blue-500/30 text-blue-300 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Sécurité</span>
        </button>
      </div>

      {/* 3. FEEDBACK ALERTS */}
      {editError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 text-center font-mono flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{editError}</span>
        </motion.div>
      )}

      {editSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 text-center font-mono flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{editSuccess}</span>
        </motion.div>
      )}

      {/* TAB 1: IDENTITY & AVATAR */}
      {activeSubTab === 'passport' && (
        <motion.form
          key="tab_passport"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="rounded-3xl p-6 md:p-8 bg-slate-900/60 border border-white/10 space-y-6 shadow-xl backdrop-blur-md"
        >
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest block">
              Pseudonyme de Duelliste
            </label>
            <div className="relative max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                maxLength={16}
                value={editPseudo}
                onChange={(e) => setEditPseudo(e.target.value)}
                placeholder="Votre pseudo"
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Base Avatars */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest block">
              Sceaux Classiques
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 max-w-2xl">
              {BASE_AVATARS.map((av) => {
                const isSelected = editAvatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playMenuClick();
                      setEditAvatarId(av.id);
                    }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border transition-all duration-200 cursor-pointer select-none hover:scale-105 active:scale-95 ${
                      isSelected
                        ? 'border-amber-400 ring-4 ring-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                        : 'border-white/10 hover:border-white/30 bg-white/5 opacity-80 hover:opacity-100'
                    } ${av.color}`}
                    title={av.name}
                  >
                    {av.symbol}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exclusive Unlockable Avatars */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between max-w-2xl">
              <label className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Sceaux Exclusifs (Progression)</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                Débloqués par vos niveaux et victoires
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-2xl">
              {EXCLUSIVE_AVATARS.map((av) => {
                const unlocked = isAvatarUnlocked(av.id);
                const isSelected = editAvatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      if (!unlocked) return;
                      sound.playMenuClick();
                      setEditAvatarId(av.id);
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-200 relative ${
                      !unlocked
                        ? 'border-white/5 bg-slate-950/60 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'border-amber-400 ring-4 ring-amber-500/25 bg-amber-500/10 cursor-pointer scale-[1.02]'
                        : 'border-white/10 hover:border-amber-400/40 bg-white/5 cursor-pointer hover:scale-[1.02]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border relative ${av.color}`}>
                      {av.symbol}
                      {!unlocked && (
                        <div className="absolute inset-0 rounded-xl bg-slate-950/75 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] font-bold text-white block leading-tight">
                        {av.name}
                      </span>
                      <span className={`text-[9px] font-mono uppercase ${unlocked ? 'text-emerald-400 font-bold' : 'text-amber-300/80'}`}>
                        {unlocked ? 'Débloqué' : av.unlockHint}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSavingProfile ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <span>Sauvegarder l'Identité</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.form>
      )}

      {/* TAB 2: TITLES & EXPLOITS */}
      {activeSubTab === 'titles' && (
        <motion.div
          key="tab_titles"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Explanation + Auto-Title toggle */}
          <div className="rounded-3xl p-5 md:p-6 bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Vos Titres Honorifiques</span>
              </h3>
              <p className="text-xs text-slate-400">
                Débloquez des titres en montant de niveau (1 → 50), en remportant des victoires et en enchaînant les parties.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleEquip('title', null)}
              disabled={progression?.equipped.titleIsAuto || equippingId === 'title:auto'}
              className={`px-4 py-2.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider border transition cursor-pointer shrink-0 ${
                progression?.equipped.titleIsAuto
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 cursor-default'
                  : 'bg-white/5 border-white/15 text-slate-200 hover:bg-white/10'
              }`}
            >
              {progression?.equipped.titleIsAuto ? '✓ Titre Auto (selon niveau)' : 'Activer Titre Auto'}
            </button>
          </div>

          {[
            {
              key: 'level' as const,
              title: 'Paliers de Niveau (1 → 50)',
              subtitle: 'Un titre de rang attribué à chaque grand palier de niveau',
              accent: 'text-amber-400',
            },
            {
              key: 'wins' as const,
              title: 'Exploits de Victoires',
              subtitle: 'Récompense vos triomphes dans l\'Arène',
              accent: 'text-emerald-400',
            },
            {
              key: 'matches' as const,
              title: 'Exploits d\'Assiduité (Parties terminées)',
              subtitle: 'Honore votre fidélité autour de la table SIPA',
              accent: 'text-blue-400',
            },
          ].map((group) => {
            const groupTitles = (progression?.titles || []).filter((t) => t.category === group.key);
            return (
              <div
                key={group.key}
                className="rounded-3xl p-6 bg-slate-900/60 border border-white/10 space-y-4 backdrop-blur-md"
              >
                <div>
                  <h4 className={`text-xs font-mono font-black uppercase tracking-widest ${group.accent}`}>
                    {group.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{group.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groupTitles.map((t) => {
                    const isEquipped = progression?.currentTitle.id === t.id;
                    const prog = getConditionProgress(t.condition, progression);
                    return (
                      <div
                        key={t.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isEquipped
                            ? 'bg-gradient-to-br from-amber-500/15 via-slate-900/80 to-slate-950 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                            : t.unlocked
                            ? 'bg-white/5 border-white/15 hover:border-white/30'
                            : 'bg-slate-950/60 border-white/5 opacity-65'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                              {t.unlocked ? (
                                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              )}
                              <span>{t.name}</span>
                            </span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 shrink-0">
                              {formatConditionLabel(t.condition)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{t.description}</p>
                        </div>

                        {t.unlocked ? (
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Débloqué
                            </span>
                            {isEquipped ? (
                              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300">
                                ★ Actif
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleEquip('title', t.id)}
                                disabled={equippingId === `title:${t.id}`}
                                className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition cursor-pointer"
                              >
                                Équiper
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                              <span>Progression</span>
                              <span>
                                {prog.current} / {prog.target} ({prog.percent}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                                style={{ width: `${prog.percent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* TAB 3: COSMETICS & REWARDS */}
      {activeSubTab === 'cosmetics' && (
        <motion.div
          key="tab_cosmetics"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Category Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/60 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'Tout voir' },
                { id: 'frame', label: 'Cadres d\'Avatar' },
                { id: 'cardBack', label: 'Dos de Cartes' },
                { id: 'table', label: 'Thèmes de Table' },
                { id: 'avatar', label: 'Sceaux Exclusifs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCosmeticFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                    cosmeticFilter === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>XP : En ligne 100% • Avec IA 75% • Solo IA / Local 50%</span>
            </div>
          </div>

          {/* 1. AVATAR FRAMES */}
          {(cosmeticFilter === 'all' || cosmeticFilter === 'frame') && (
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-white/10 space-y-4 backdrop-blur-md">
              <div>
                <h4 className="text-xs font-mono font-black uppercase tracking-widest text-amber-400">
                  Cadres d'Avatar
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Illuminez votre sceau dans l'en-tête, le passeport et autour de la table de jeu
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(progression?.cosmetics || [])
                  .filter((c) => c.category === 'frame')
                  .map((c) => {
                    const fStyle = getFrameStyle(c.id);
                    const rarity = RARITY_BADGES[c.rarity];
                    const isEquipped = progression?.equipped.frame === c.id;
                    const prog = getConditionProgress(c.condition, progression);

                    return (
                      <div
                        key={c.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                          isEquipped
                            ? 'bg-emerald-500/10 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                            : c.unlocked
                            ? 'bg-white/5 border-white/15 hover:border-white/30'
                            : 'bg-slate-950/60 border-white/5 opacity-65'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Live Frame Preview around current avatar */}
                          <div className={`w-14 h-14 rounded-2xl ${fStyle.ringClass} ${fStyle.glowClass} shrink-0 relative`}>
                            <div className={`w-full h-full rounded-[13px] flex items-center justify-center text-2xl font-bold border border-white/15 ${previewAvatar.color}`}>
                              {previewAvatar.symbol}
                            </div>
                            {!c.unlocked && (
                              <div className="absolute inset-0 rounded-2xl bg-slate-950/75 flex items-center justify-center">
                                <Lock className="w-4 h-4 text-slate-300" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-white uppercase">{c.name}</span>
                              <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${rarity.className}`}>
                                {rarity.label}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              Requis : {formatConditionLabel(c.condition)}
                            </span>
                          </div>
                        </div>

                        {c.unlocked ? (
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">Débloqué</span>
                            {isEquipped ? (
                              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                                ★ Équipé
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleEquip('frame', c.id)}
                                disabled={equippingId === `frame:${c.id}`}
                                className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-lg bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white transition cursor-pointer"
                              >
                                Équiper
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>Verrouillé</span>
                              <span>{prog.current}/{prog.target}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${prog.percent}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 2. CARD BACKS */}
          {(cosmeticFilter === 'all' || cosmeticFilter === 'cardBack') && (
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-white/10 space-y-4 backdrop-blur-md">
              <div>
                <h4 className="text-xs font-mono font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Dos de Cartes</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Personnalisez le verso de vos cartes (visible lors des sacrifices et sur le plateau)
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(progression?.cosmetics || [])
                  .filter((c) => c.category === 'cardBack')
                  .map((c) => {
                    const rarity = RARITY_BADGES[c.rarity];
                    const isEquipped = progression?.equipped.cardBack === c.id;
                    const prog = getConditionProgress(c.condition, progression);

                    return (
                      <div
                        key={c.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-between gap-3 text-center ${
                          isEquipped
                            ? 'bg-indigo-500/15 border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                            : c.unlocked
                            ? 'bg-white/5 border-white/15 hover:border-white/30'
                            : 'bg-slate-950/60 border-white/5 opacity-65'
                        }`}
                      >
                        <div className="relative">
                          <CardView
                            card={{ id: `preview_${c.id}`, suit: 'spades', rank: '7', value: 7 }}
                            faceUp={false}
                            size="sm"
                            cardBackId={c.id}
                          />
                          {!c.unlocked && (
                            <div className="absolute inset-0 rounded-lg bg-slate-950/70 flex items-center justify-center">
                              <Lock className="w-4 h-4 text-slate-200" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-black text-white uppercase block">{c.name}</span>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border inline-block ${rarity.className}`}>
                            {rarity.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block">
                            {formatConditionLabel(c.condition)}
                          </span>
                        </div>

                        {c.unlocked ? (
                          isEquipped ? (
                            <span className="w-full text-[10px] font-mono font-black uppercase py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
                              ★ Équipé
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEquip('cardBack', c.id)}
                              disabled={equippingId === `cardBack:${c.id}`}
                              className="w-full text-[10px] font-mono font-bold uppercase py-1.5 rounded-lg bg-white/10 hover:bg-indigo-500 text-white transition cursor-pointer"
                            >
                              Équiper
                            </button>
                          )
                        ) : (
                          <div className="w-full space-y-1">
                            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${prog.percent}%` }} />
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 block">
                              {prog.current}/{prog.target}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 3. TABLE THEMES */}
          {(cosmeticFilter === 'all' || cosmeticFilter === 'table') && (
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-white/10 space-y-4 backdrop-blur-md">
              <div>
                <h4 className="text-xs font-mono font-black uppercase tracking-widest text-cyan-400">
                  Thèmes de Table (Tapis de l'Arène)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Changez l'atmosphère du tapis central lors de vos parties
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(progression?.cosmetics || [])
                  .filter((c) => c.category === 'table')
                  .map((c) => {
                    const tStyle = getTableThemeStyle(c.id);
                    const rarity = RARITY_BADGES[c.rarity];
                    const isEquipped = progression?.equipped.table === c.id;
                    const prog = getConditionProgress(c.condition, progression);

                    return (
                      <div
                        key={c.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isEquipped
                            ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                            : c.unlocked
                            ? 'bg-white/5 border-white/15 hover:border-white/30'
                            : 'bg-slate-950/60 border-white/5 opacity-65'
                        }`}
                      >
                        {/* Mini Table Preview */}
                        <div className={`h-20 rounded-xl border relative overflow-hidden flex items-center justify-center ${tStyle.arenaBg}`}>
                          <div className={`absolute inset-2 rounded-lg border border-dashed ${tStyle.ringBorder} opacity-60`} />
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${tStyle.labelColor}`}>
                            ♠ ♥ SIPA ♦ ♣
                          </span>
                          {!c.unlocked && (
                            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                              <Lock className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-black text-white uppercase block">{c.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Requis : {formatConditionLabel(c.condition)}
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${rarity.className}`}>
                            {rarity.label}
                          </span>
                        </div>

                        {c.unlocked ? (
                          isEquipped ? (
                            <span className="w-full text-center text-[10px] font-mono font-black uppercase py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                              ★ Tapis Actif
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEquip('table', c.id)}
                              disabled={equippingId === `table:${c.id}`}
                              className="w-full text-[10px] font-mono font-bold uppercase py-1.5 rounded-lg bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-white transition cursor-pointer"
                            >
                              Équiper
                            </button>
                          )
                        ) : (
                          <div className="space-y-1">
                            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${prog.percent}%` }} />
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 block text-right">
                              {prog.current}/{prog.target}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 4. EXCLUSIVE AVATARS */}
          {(cosmeticFilter === 'all' || cosmeticFilter === 'avatar') && (
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-white/10 space-y-4 backdrop-blur-md">
              <div>
                <h4 className="text-xs font-mono font-black uppercase tracking-widest text-rose-400">
                  Sceaux Exclusifs de Progression
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Avatars de prestige réservés aux joueurs expérimentés
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {EXCLUSIVE_AVATARS.map((av) => {
                  const cosmeticMeta = progression?.cosmetics.find((c) => c.id === av.id);
                  const unlocked = isAvatarUnlocked(av.id);
                  const isCurrent = currentUser.avatarId === av.id;
                  const rarity = RARITY_BADGES[cosmeticMeta?.rarity || 'rare'];

                  return (
                    <div
                      key={av.id}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-between gap-3 text-center ${
                        isCurrent
                          ? 'bg-amber-500/15 border-amber-400/50'
                          : unlocked
                          ? 'bg-white/5 border-white/15'
                          : 'bg-slate-950/60 border-white/5 opacity-65'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold border relative ${av.color}`}>
                        {av.symbol}
                        {!unlocked && (
                          <div className="absolute inset-0 rounded-2xl bg-slate-950/75 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-black text-white block">{av.name}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border inline-block ${rarity.className}`}>
                          {rarity.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {av.unlockHint}
                        </span>
                      </div>
                      {unlocked ? (
                        isCurrent ? (
                          <span className="w-full text-[10px] font-mono font-black uppercase py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300">
                            ★ Sceau Actif
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              setEditAvatarId(av.id);
                              handleSaveProfile(e, av.id);
                            }}
                            disabled={isSavingProfile}
                            className="w-full text-[10px] font-mono font-bold uppercase py-1.5 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition cursor-pointer"
                          >
                            Utiliser ce Sceau
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Verrouillé</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 4: PREFERENCES */}
      {activeSubTab === 'settings' && (
        <motion.div
          key="tab_settings"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 md:p-8 bg-slate-900/60 border border-white/10 space-y-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl ${prefSound ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {prefSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Effets Sonores & Ambiance</span>
                <span className="text-xs text-slate-400 block">Sons de distribution, claquement de carte et fanfares</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleSound}
              className={`w-12 h-7 rounded-full transition-all duration-200 p-0.5 cursor-pointer flex items-center ${
                prefSound ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <span className="w-6 h-6 bg-white rounded-full shadow" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Animations Fluides des Cartes</span>
                <span className="text-xs text-slate-400 block">Glissements et transitions cinématiques du pli</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAnimations}
              className={`w-12 h-7 rounded-full transition-all duration-200 p-0.5 cursor-pointer flex items-center ${
                prefAnimations ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <span className="w-6 h-6 bg-white rounded-full shadow" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Masque Automatique (Pass & Play)</span>
                <span className="text-xs text-slate-400 block">Masquer les cartes lors du changement de tour en local</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAutoMask}
              className={`w-12 h-7 rounded-full transition-all duration-200 p-0.5 cursor-pointer flex items-center ${
                prefAutoMask ? 'bg-purple-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <span className="w-6 h-6 bg-white rounded-full shadow" />
            </button>
          </div>
        </motion.div>
      )}

      {/* TAB 5: SECURITY */}
      {activeSubTab === 'security' && (
        <motion.form
          key="tab_security"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="rounded-3xl p-6 md:p-8 bg-slate-900/60 border border-white/10 space-y-6 shadow-xl backdrop-blur-md w-full"
        >
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest block">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Votre mot de passe actuel"
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl py-3 px-4 text-xs font-mono text-white focus:outline-none focus:border-blue-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest block">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl py-3 px-4 text-xs font-mono text-white focus:outline-none focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest block">
                Confirmer
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer"
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl py-3 px-4 text-xs font-mono text-white focus:outline-none focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile || !newPassword}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSavingProfile ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Mettre à jour le mot de passe</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
}
