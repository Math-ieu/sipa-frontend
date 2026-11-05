/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AvatarDef {
  id: string;
  symbol: string;
  color: string;
  name?: string;
  exclusive?: boolean;
  unlockHint?: string;
}

export const BASE_AVATARS: AvatarDef[] = [
  { id: 'av1', symbol: '❂', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', name: 'Émeraude Solaire' },
  { id: 'av2', symbol: '❈', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', name: 'Cristal de Glace' },
  { id: 'av3', symbol: '✾', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30', name: 'Lotus Rose' },
  { id: 'av4', symbol: '✙', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', name: 'Croix Astrale' },
  { id: 'av5', symbol: '✺', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', name: 'Nova Dorée' },
  { id: 'av6', symbol: '✿', color: 'bg-red-500/20 text-red-300 border-red-500/30', name: 'Fleur Écarlate' },
  { id: 'av8', symbol: '◈', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', name: 'Prisme Saphir' },
];

export const EXCLUSIVE_AVATARS: AvatarDef[] = [
  {
    id: 'av9',
    symbol: '♛',
    color: 'bg-amber-500/25 text-amber-200 border-amber-400/50 shadow-[inset_0_0_12px_rgba(245,158,11,0.3)]',
    name: 'Couronne Souveraine',
    exclusive: true,
    unlockHint: 'Niveau 7',
  },
  {
    id: 'av10',
    symbol: '✪',
    color: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/50 shadow-[inset_0_0_12px_rgba(99,102,241,0.35)]',
    name: 'Soleil Noir',
    exclusive: true,
    unlockHint: 'Niveau 14',
  },
  {
    id: 'av11',
    symbol: '⚜',
    color: 'bg-purple-500/25 text-purple-200 border-purple-400/50 shadow-[inset_0_0_12px_rgba(168,85,247,0.35)]',
    name: 'Fleur de Lys Royale',
    exclusive: true,
    unlockHint: 'Niveau 25',
  },
  {
    id: 'av12',
    symbol: '♞',
    color: 'bg-rose-500/25 text-rose-200 border-rose-400/50 shadow-[inset_0_0_12px_rgba(244,63,94,0.35)]',
    name: 'Cavalier de l\'Arène',
    exclusive: true,
    unlockHint: '50 Victoires',
  },
  {
    id: 'av13',
    symbol: '✦',
    color: 'bg-gradient-to-br from-amber-500/30 via-fuchsia-500/25 to-cyan-500/30 text-amber-100 border-amber-300/60 shadow-[inset_0_0_16px_rgba(251,191,36,0.45)]',
    name: 'Étoile Légendaire',
    exclusive: true,
    unlockHint: 'Niveau 50',
  },
];

export const AVATARS: AvatarDef[] = [...BASE_AVATARS, ...EXCLUSIVE_AVATARS];
