/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { API_BASE_URL } from './backendService';

export type UnlockCondition =
  | { type: 'level'; value: number }
  | { type: 'wins'; value: number }
  | { type: 'matches'; value: number };

export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CosmeticCategory = 'avatar' | 'frame' | 'cardBack' | 'table';

export interface TitleItem {
  id: string;
  name: string;
  description: string;
  category: 'level' | 'wins' | 'matches';
  condition: UnlockCondition;
  unlocked: boolean;
}

export interface CosmeticItem {
  id: string;
  category: CosmeticCategory;
  name: string;
  rarity: CosmeticRarity;
  condition: UnlockCondition;
  unlocked: boolean;
}

export interface NextRewardItem {
  kind: 'title' | 'cosmetic';
  id: string;
  name: string;
  category: string;
  rarity: CosmeticRarity | null;
  condition: UnlockCondition;
}

export interface ProgressionData {
  xp: number;
  level: number;
  isMaxLevel: boolean;
  xpIntoLevel: number;
  xpForNextLevel: number;
  maxLevel: number;
  counters: {
    wins: number;
    matches: number;
  };
  currentTitle: {
    id: string;
    name: string;
  };
  equipped: {
    title: string;
    titleIsAuto: boolean;
    frame: string;
    cardBack: string;
    table: string;
  };
  titles: TitleItem[];
  cosmetics: CosmeticItem[];
  nextRewards: NextRewardItem[];
}

export interface LatestMatchReward {
  matchId: string;
  isWinner: boolean;
  gameMode: string;
  aiCount: number;
  xpGained: number;
  before: {
    level: number;
    xpIntoLevel: number;
    xpForNextLevel: number;
    xp: number;
  };
  after: {
    level: number;
    xpIntoLevel: number;
    xpForNextLevel: number;
    xp: number;
    isMaxLevel: boolean;
  };
  newTitles: Array<{ id: string; name: string }>;
  newCosmetics: Array<{ id: string; name: string; category: CosmeticCategory; rarity: CosmeticRarity }>;
}

// -------------------------------------------------------------
// Visual Styles for Avatar Frames
// -------------------------------------------------------------

export interface FrameStyle {
  id: string;
  ringClass: string;
  badgeClass: string;
  glowClass: string;
}

export const FRAME_STYLES: Record<string, FrameStyle> = {
  frame_none: {
    id: 'frame_none',
    ringClass: 'p-[2px] bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800',
    badgeClass: 'border-slate-500 text-slate-300',
    glowClass: 'shadow-md',
  },
  frame_bronze: {
    id: 'frame_bronze',
    ringClass: 'p-[2.5px] bg-gradient-to-br from-amber-700 via-orange-600 to-yellow-800',
    badgeClass: 'border-amber-600 text-amber-400',
    glowClass: 'shadow-[0_0_16px_rgba(217,119,6,0.35)]',
  },
  frame_silver: {
    id: 'frame_silver',
    ringClass: 'p-[2.5px] bg-gradient-to-br from-slate-200 via-slate-400 to-zinc-200',
    badgeClass: 'border-slate-300 text-slate-100',
    glowClass: 'shadow-[0_0_18px_rgba(226,232,240,0.4)]',
  },
  frame_gold: {
    id: 'frame_gold',
    ringClass: 'p-[2.5px] bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-500',
    badgeClass: 'border-amber-400 text-amber-300',
    glowClass: 'shadow-[0_0_24px_rgba(245,158,11,0.5)]',
  },
  frame_emerald: {
    id: 'frame_emerald',
    ringClass: 'p-[2.5px] bg-gradient-to-br from-emerald-300 via-teal-500 to-green-600',
    badgeClass: 'border-emerald-400 text-emerald-300',
    glowClass: 'shadow-[0_0_24px_rgba(16,185,129,0.5)]',
  },
  frame_victor: {
    id: 'frame_victor',
    ringClass: 'p-[3px] bg-gradient-to-br from-amber-300 via-rose-500 to-purple-600',
    badgeClass: 'border-rose-400 text-rose-300',
    glowClass: 'shadow-[0_0_26px_rgba(244,63,94,0.55)]',
  },
  frame_amethyst: {
    id: 'frame_amethyst',
    ringClass: 'p-[3px] bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600',
    badgeClass: 'border-purple-400 text-purple-300',
    glowClass: 'shadow-[0_0_26px_rgba(168,85,247,0.55)]',
  },
  frame_ruby: {
    id: 'frame_ruby',
    ringClass: 'p-[3px] bg-gradient-to-br from-red-400 via-rose-600 to-amber-500',
    badgeClass: 'border-red-400 text-red-300',
    glowClass: 'shadow-[0_0_28px_rgba(239,68,68,0.6)]',
  },
  frame_legend: {
    id: 'frame_legend',
    ringClass: 'p-[3px] bg-gradient-to-br from-amber-300 via-fuchsia-500 to-cyan-400',
    badgeClass: 'border-amber-300 text-amber-200',
    glowClass: 'shadow-[0_0_32px_rgba(251,191,36,0.65)]',
  },
};

export function getFrameStyle(frameId?: string | null): FrameStyle {
  return FRAME_STYLES[frameId || 'frame_none'] || FRAME_STYLES.frame_none;
}

// -------------------------------------------------------------
// Visual Styles for Card Backs
// -------------------------------------------------------------

export interface CardBackStyle {
  id: string;
  outerBg: string;
  innerBg: string;
  accentText: string;
  orbBorder: string;
  orbDot: string;
  emblem: string;
}

export const CARD_BACK_STYLES: Record<string, CardBackStyle> = {
  back_classic: {
    id: 'back_classic',
    outerBg: 'bg-gradient-to-br from-indigo-950/90 via-slate-950/95 to-purple-950/90 border-indigo-400/30',
    innerBg: 'bg-gradient-to-br from-slate-950/90 to-slate-900/90 border-indigo-400/20 shadow-[inset_0_0_12px_rgba(99,102,241,0.25)]',
    accentText: 'text-indigo-300',
    orbBorder: 'border-indigo-400/40 bg-indigo-500/10 shadow-[0_0_10px_rgba(99,102,241,0.3)]',
    orbDot: 'from-cyan-400 to-indigo-400',
    emblem: '✦',
  },
  back_royal: {
    id: 'back_royal',
    outerBg: 'bg-gradient-to-br from-blue-950/95 via-sky-950/90 to-indigo-950/95 border-sky-400/40',
    innerBg: 'bg-gradient-to-br from-blue-950/90 to-slate-950/90 border-sky-400/30 shadow-[inset_0_0_14px_rgba(56,189,248,0.3)]',
    accentText: 'text-sky-300',
    orbBorder: 'border-sky-400/50 bg-sky-500/15 shadow-[0_0_12px_rgba(56,189,248,0.4)]',
    orbDot: 'from-sky-300 to-blue-500',
    emblem: '♛',
  },
  back_crimson: {
    id: 'back_crimson',
    outerBg: 'bg-gradient-to-br from-rose-950/95 via-red-950/90 to-slate-950/95 border-rose-400/40',
    innerBg: 'bg-gradient-to-br from-red-950/90 to-slate-950/95 border-rose-500/30 shadow-[inset_0_0_14px_rgba(244,63,94,0.35)]',
    accentText: 'text-rose-300',
    orbBorder: 'border-rose-400/50 bg-rose-500/15 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    orbDot: 'from-rose-400 to-amber-400',
    emblem: '❖',
  },
  back_jade: {
    id: 'back_jade',
    outerBg: 'bg-gradient-to-br from-emerald-950/95 via-teal-950/90 to-slate-950/95 border-emerald-400/40',
    innerBg: 'bg-gradient-to-br from-emerald-950/90 to-slate-950/95 border-emerald-400/30 shadow-[inset_0_0_14px_rgba(16,185,129,0.35)]',
    accentText: 'text-emerald-300',
    orbBorder: 'border-emerald-400/50 bg-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    orbDot: 'from-emerald-300 to-teal-400',
    emblem: '❂',
  },
  back_veteran: {
    id: 'back_veteran',
    outerBg: 'bg-gradient-to-br from-purple-950/95 via-fuchsia-950/85 to-indigo-950/95 border-fuchsia-400/45',
    innerBg: 'bg-gradient-to-br from-purple-950/90 to-slate-950/95 border-fuchsia-400/35 shadow-[inset_0_0_16px_rgba(217,70,239,0.35)]',
    accentText: 'text-fuchsia-300',
    orbBorder: 'border-fuchsia-400/50 bg-fuchsia-500/15 shadow-[0_0_12px_rgba(217,70,239,0.45)]',
    orbDot: 'from-fuchsia-300 to-purple-500',
    emblem: '⚔',
  },
  back_obsidian: {
    id: 'back_obsidian',
    outerBg: 'bg-gradient-to-br from-neutral-950 via-stone-950 to-amber-950/80 border-amber-400/50',
    innerBg: 'bg-gradient-to-br from-neutral-950 to-stone-900 border-amber-400/40 shadow-[inset_0_0_16px_rgba(245,158,11,0.35)]',
    accentText: 'text-amber-300',
    orbBorder: 'border-amber-400/60 bg-amber-500/15 shadow-[0_0_14px_rgba(245,158,11,0.45)]',
    orbDot: 'from-amber-300 to-yellow-500',
    emblem: '⚜',
  },
  back_aurora: {
    id: 'back_aurora',
    outerBg: 'bg-gradient-to-br from-cyan-950/95 via-fuchsia-950/85 to-emerald-950/95 border-cyan-300/50',
    innerBg: 'bg-gradient-to-br from-slate-950/90 via-indigo-950/80 to-teal-950/90 border-cyan-300/35 shadow-[inset_0_0_18px_rgba(34,211,238,0.4)]',
    accentText: 'text-cyan-200',
    orbBorder: 'border-cyan-300/60 bg-cyan-400/15 shadow-[0_0_14px_rgba(34,211,238,0.5)]',
    orbDot: 'from-cyan-300 via-fuchsia-400 to-emerald-300',
    emblem: '✺',
  },
  back_legend: {
    id: 'back_legend',
    outerBg: 'bg-gradient-to-br from-amber-900/90 via-fuchsia-950/90 to-indigo-950/95 border-amber-300/65',
    innerBg: 'bg-gradient-to-br from-slate-950/95 via-amber-950/50 to-fuchsia-950/70 border-amber-300/50 shadow-[inset_0_0_20px_rgba(251,191,36,0.5)]',
    accentText: 'text-amber-200',
    orbBorder: 'border-amber-300/70 bg-amber-400/20 shadow-[0_0_16px_rgba(251,191,36,0.6)]',
    orbDot: 'from-amber-200 via-orange-400 to-fuchsia-400',
    emblem: '★',
  },
};

export function getCardBackStyle(cardBackId?: string | null): CardBackStyle {
  return CARD_BACK_STYLES[cardBackId || 'back_classic'] || CARD_BACK_STYLES.back_classic;
}

// -------------------------------------------------------------
// Visual Styles for Table Themes
// -------------------------------------------------------------

export interface TableThemeStyle {
  id: string;
  arenaBg: string;
  ringBorder: string;
  ambientGlow: string;
  labelColor: string;
}

export const TABLE_THEME_STYLES: Record<string, TableThemeStyle> = {
  table_cosmos: {
    id: 'table_cosmos',
    arenaBg: 'bg-gradient-to-b from-slate-900/45 via-slate-950/65 to-slate-950/85 border-white/10 shadow-indigo-950/20',
    ringBorder: 'border-white/10',
    ambientGlow: 'bg-blue-500/10',
    labelColor: 'text-slate-400',
  },
  table_felt: {
    id: 'table_felt',
    arenaBg: 'bg-gradient-to-b from-emerald-950/70 via-emerald-950/85 to-slate-950/90 border-emerald-500/30 shadow-emerald-950/40',
    ringBorder: 'border-emerald-400/20',
    ambientGlow: 'bg-emerald-500/15',
    labelColor: 'text-emerald-300/80',
  },
  table_ocean: {
    id: 'table_ocean',
    arenaBg: 'bg-gradient-to-b from-cyan-950/65 via-sky-950/80 to-slate-950/90 border-cyan-500/30 shadow-cyan-950/40',
    ringBorder: 'border-cyan-400/20',
    ambientGlow: 'bg-cyan-500/15',
    labelColor: 'text-cyan-300/80',
  },
  table_ember: {
    id: 'table_ember',
    arenaBg: 'bg-gradient-to-b from-orange-950/65 via-red-950/75 to-slate-950/90 border-orange-500/30 shadow-orange-950/40',
    ringBorder: 'border-orange-400/20',
    ambientGlow: 'bg-orange-500/15',
    labelColor: 'text-orange-300/80',
  },
  table_royal: {
    id: 'table_royal',
    arenaBg: 'bg-gradient-to-b from-purple-950/70 via-indigo-950/80 to-slate-950/90 border-purple-400/35 shadow-purple-950/40',
    ringBorder: 'border-purple-400/25',
    ambientGlow: 'bg-purple-500/15',
    labelColor: 'text-purple-300/80',
  },
  table_void: {
    id: 'table_void',
    arenaBg: 'bg-gradient-to-b from-fuchsia-950/60 via-slate-950/90 to-black/95 border-fuchsia-400/35 shadow-fuchsia-950/40',
    ringBorder: 'border-fuchsia-400/25',
    ambientGlow: 'bg-fuchsia-500/15',
    labelColor: 'text-fuchsia-300/80',
  },
  table_gold: {
    id: 'table_gold',
    arenaBg: 'bg-gradient-to-b from-amber-950/65 via-yellow-950/70 to-slate-950/90 border-amber-400/45 shadow-amber-950/45',
    ringBorder: 'border-amber-400/30',
    ambientGlow: 'bg-amber-500/20',
    labelColor: 'text-amber-300/90',
  },
};

export function getTableThemeStyle(tableId?: string | null): TableThemeStyle {
  return TABLE_THEME_STYLES[tableId || 'table_cosmos'] || TABLE_THEME_STYLES.table_cosmos;
}

// -------------------------------------------------------------
// Rarity & Condition Formatting Helpers
// -------------------------------------------------------------

export const RARITY_BADGES: Record<CosmeticRarity, { label: string; className: string }> = {
  common: {
    label: 'Commun',
    className: 'bg-slate-500/15 border-slate-400/25 text-slate-300',
  },
  rare: {
    label: 'Rare',
    className: 'bg-blue-500/15 border-blue-400/30 text-blue-300',
  },
  epic: {
    label: 'Épique',
    className: 'bg-purple-500/15 border-purple-400/35 text-purple-300',
  },
  legendary: {
    label: 'Légendaire',
    className: 'bg-amber-500/20 border-amber-400/45 text-amber-300',
  },
};

export function formatConditionLabel(c: UnlockCondition): string {
  if (c.type === 'level') return `Niveau ${c.value}`;
  if (c.type === 'wins') return `${c.value} victoire${c.value > 1 ? 's' : ''}`;
  return `${c.value} partie${c.value > 1 ? 's' : ''} terminée${c.value > 1 ? 's' : ''}`;
}

export function getConditionProgress(
  c: UnlockCondition,
  progression: ProgressionData | null
): { current: number; target: number; percent: number } {
  const target = c.value;
  if (!progression) return { current: 0, target, percent: 0 };
  const current =
    c.type === 'level'
      ? progression.level
      : c.type === 'wins'
      ? progression.counters.wins
      : progression.counters.matches;
  const percent = Math.min(100, Math.round((current / Math.max(1, target)) * 100));
  return { current: Math.min(current, target), target, percent };
}

// -------------------------------------------------------------
// Client-side progression sync & equipped state cache
// -------------------------------------------------------------

const EQUIPPED_STORAGE_KEY = 'sipa_equipped_cosmetics';

export interface CachedEquipped {
  titleName: string;
  level: number;
  frame: string;
  cardBack: string;
  table: string;
}

const DEFAULT_CACHED: CachedEquipped = {
  titleName: 'Initié des Cartes',
  level: 1,
  frame: 'frame_none',
  cardBack: 'back_classic',
  table: 'table_cosmos',
};

export function getCachedEquipped(): CachedEquipped {
  try {
    const raw = localStorage.getItem(EQUIPPED_STORAGE_KEY);
    if (!raw) return DEFAULT_CACHED;
    return { ...DEFAULT_CACHED, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CACHED;
  }
}

export function cacheProgression(data: ProgressionData): void {
  try {
    const cached: CachedEquipped = {
      titleName: data.currentTitle?.name || 'Initié des Cartes',
      level: data.level || 1,
      frame: data.equipped?.frame || 'frame_none',
      cardBack: data.equipped?.cardBack || 'back_classic',
      table: data.equipped?.table || 'table_cosmos',
    };
    localStorage.setItem(EQUIPPED_STORAGE_KEY, JSON.stringify(cached));
    if (data.userId) {
      localStorage.setItem(`sipa_full_progression_${data.userId}`, JSON.stringify(data));
    }
    window.dispatchEvent(new CustomEvent('sipa_progression_updated', { detail: data }));
  } catch {
    // ignore storage errors
  }
}

export async function fetchUserProgression(playerId: string): Promise<ProgressionData | null> {
  if (!playerId) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${playerId}/progression`);
    if (res.ok) {
      const data: ProgressionData = await res.json();
      cacheProgression(data);
      return data;
    }
  } catch (err) {
    console.warn('Mode hors-ligne ou erreur réseau (progression):', err);
  }

  // Fallback to locally cached progression when offline
  try {
    const raw = localStorage.getItem(`sipa_full_progression_${playerId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return null;
}

export async function equipProgressionItem(
  slot: 'title' | 'frame' | 'cardBack' | 'table',
  itemId: string | null
): Promise<ProgressionData | null> {
  const token = localStorage.getItem('sipa_auth_token');
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me/equip`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slot, itemId }),
    });
    if (!res.ok) return null;
    const data: ProgressionData = await res.json();
    cacheProgression(data);
    return data;
  } catch (err) {
    console.error('Error equipping item:', err);
    return null;
  }
}

