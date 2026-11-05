/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import {
  Bot,
  Users,
  Globe,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldAlert,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface ArenaPageProps {
  onNavigate: (path: string) => void;
}

export function ArenaPage({ onNavigate }: ArenaPageProps) {
  const handleSelectMode = (path: string) => {
    sound.playModeSelect();
    onNavigate(path);
  };

  const gameModes = [
    {
      id: 'ai',
      path: '/arene-de-jeu/ia',
      title: 'Solo contre IA',
      tagline: 'Entraînement Tactique',
      badge: 'Instantané',
      badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      icon: Bot,
      accentGradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(59,130,246,0.3)]',
      borderColor: 'border-blue-500/25',
      borderHover: 'group-hover:border-blue-400',
      description:
        'Affrontez des intelligences artificielles aux styles adaptatifs. Aucun temps mort, idéal pour tester vos stratégies.',
      features: [
        '1 à 3 adversaires robots',
        'Partie sans chrono stressant',
        'Parfait pour s’entraîner aux 7',
      ],
      cta: 'Défier l’IA',
    },
    {
      id: 'local',
      path: '/arene-de-jeu/local',
      title: 'Passer & Jouer',
      tagline: 'Table Locale en Soirée',
      badge: 'Même Écran',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      icon: Users,
      accentGradient: 'from-purple-600 via-fuchsia-600 to-pink-500',
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(168,85,247,0.3)]',
      borderColor: 'border-purple-500/25',
      borderHover: 'group-hover:border-purple-400',
      description:
        'Jouez à 2, 3 ou 4 autour d’un seul smartphone ou ordinateur avec le masquage automatique des cartes secrètes.',
      features: [
        'De 2 à 4 joueurs en local',
        'Masque de confidentialité sécurisé',
        'Idéal sur canapé ou en pause',
      ],
      cta: 'Lancer la table locale',
    },
    {
      id: 'online',
      path: '/arene-de-jeu/multijoueur',
      title: 'Arène en Ligne',
      tagline: 'Multijoueur Temps Réel',
      badge: 'En Direct',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: Globe,
      accentGradient: 'from-amber-500 via-orange-600 to-red-500',
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]',
      borderColor: 'border-amber-500/25',
      borderHover: 'group-hover:border-amber-400',
      description:
        'Défiez des joueurs en direct via WebSocket. Créez un salon privé avec un code à 6 chiffres ou rejoignez vos amis.',
      features: [
        'Connexion ultra-rapide par code',
        'Chat textuel en direct dans le salon',
        'Sauvegarde de match & classements',
      ],
      cta: 'Entrer dans l’Arène',
      isLive: true,
    },
  ];

  return (
    <motion.div
      key="arena_hub"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex flex-col justify-between gap-6"
    >
      {/* 1. HERO GAME BANNER */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Ambient lighting meshes */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 font-mono text-[10px] uppercase font-bold tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Saison 1 • L'Arène des 7</span>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase font-sans">
              Choisissez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Arène</span>
            </h2>
            
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Affrontez nos intelligences tactiques, réunissez vos amis autour d'un même écran ou plongez dans le multijoueur en temps réel.
            </p>
          </div>
        </div>
      </div>

      {/* 2. THREE GRAND GAME MODE PORTALS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
        {gameModes.map((mode, index) => {
          const Icon = mode.icon;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              whileHover={{ y: -6, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectMode(mode.path)}
              className={`group relative rounded-3xl p-6 md:p-7 flex flex-col justify-between text-left cursor-pointer transition-all duration-300 select-none overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 border ${mode.borderColor} ${mode.borderHover} ${mode.glowColor} shadow-xl`}
            >
              {/* Hover radial light */}
              <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-white/5 group-hover:bg-white/10 blur-2xl transition-all pointer-events-none" />

              <div className="space-y-5 relative z-10">
                {/* Header of mode card */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.accentGradient} p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-[14px] bg-slate-950/90 flex items-center justify-center text-white">
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {mode.isLive && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${mode.badgeColor}`}>
                      {mode.badge}
                    </span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-semibold">
                    {mode.tagline}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase mt-0.5 group-hover:text-amber-300 transition-colors">
                    {mode.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                  {mode.description}
                </p>

                {/* Feature Bullet Points */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  {mode.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white group-hover:text-amber-400 transition-colors">
                  {mode.cta}
                </span>
                
                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center text-slate-300 transition-all duration-300 shadow-sm">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
