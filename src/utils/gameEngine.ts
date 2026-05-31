/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, Suit, Rank, Player, TrickPlayedCard, TrickResult, RoundResult } from '../types';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_COLORS: Record<Suit, string> = {
  spades: 'text-slate-900 dark:text-slate-100',
  hearts: 'text-red-500',
  diamonds: 'text-blue-500 dark:text-blue-400', // elegantly styled diamonds as modern blue or ruby red. Let's use red or cyan. Slate/Red/Blue/Green creates a rich palette. Let's use red for hearts and diamonds, slate for spades/clubs, or standard colors.
  clubs: 'text-emerald-700 dark:text-emerald-500',
};

export const SUIT_LABELS: Record<Suit, string> = {
  spades: 'Pique',
  hearts: 'Cœur',
  diamonds: 'Carreau',
  clubs: 'Trèfle',
};

export function getRankValue(rank: Rank): number {
  switch (rank) {
    case '7': return 1;
    case '8': return 2;
    case '9': return 3;
    case '10': return 4;
    case 'J': return 5;
    case 'Q': return 6;
    case 'K': return 7;
    case 'A': return 8;
  }
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        value: getRankValue(rank),
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], playersCount: number): { hands: Card[][]; remainingDeck: Card[] } {
  // Fisher-Yates shuffle first
  const shuffled = shuffleDeck(deck);
  
  // Initialize empty hands
  const hands: Card[][] = Array.from({ length: playersCount }, () => []);
  
  let deckIndex = 0;
  
  // Phase 1: Deal 3 cards to each player
  for (let round = 0; round < 3; round++) {
    for (let p = 0; p < playersCount; p++) {
      if (deckIndex < shuffled.length) {
        hands[p].push(shuffled[deckIndex++]);
      }
    }
  }
  
  // Phase 2: Deal 2 more cards to each player (total 5 cards)
  for (let round = 0; round < 2; round++) {
    for (let p = 0; p < playersCount; p++) {
      if (deckIndex < shuffled.length) {
        hands[p].push(shuffled[deckIndex++]);
      }
    }
  }
  
  // Sort cards by suit for elegant display, and within suit by value
  for (let p = 0; p < playersCount; p++) {
    hands[p].sort((a, b) => {
      if (a.suit !== b.suit) {
        return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
      }
      return b.value - a.value; // highest rank first
    });
  }
  
  return {
    hands,
    remainingDeck: shuffled.slice(deckIndex),
  };
}

/**
 * Checks if a player can play a specific card based on current starting suit
 */
export function canPlayCard(card: Card, hand: Card[], leadCard: Card | null): boolean {
  if (!leadCard) {
    return true; // Leader can play any card
  }
  
  const hasMatchingSuit = hand.some(c => c.suit === leadCard.suit);
  if (hasMatchingSuit) {
    return card.suit === leadCard.suit; // Must follow suit
  }
  
  return true; // No matching suit, choose freely (sacrifice)
}

/**
 * Helper to find the current highest played card that follows the starting suit
 */
export function getCurrentWinningPlay(playedCards: TrickPlayedCard[], startingSuit: Suit): TrickPlayedCard | null {
  const matchingPlays = playedCards.filter(p => p.card.suit === startingSuit);
  if (matchingPlays.length === 0) return null;
  
  return matchingPlays.reduce((highest, current) => 
    current.card.value > highest.card.value ? current : highest
  , matchingPlays[0]);
}

/**
 * Rules for winning a trick:
 * The winner is the player who played the HIGHEST card matching the lead card's suit.
 */
export function determineTrickWinner(playedCards: TrickPlayedCard[], startingSuit: Suit): string {
  const winningPlay = getCurrentWinningPlay(playedCards, startingSuit);
  if (!winningPlay) {
    throw new Error('No matching cards found for the starting suit. Impossible state in standard gameplay.');
  }
  return winningPlay.playerId;
}

/**
 * Calculate the scores at the end of a round
 * Look at the sequence of last trick winners and identify if the round winner won trick 5,
 * and calculate successive 7s.
 */
export function calculateRoundResult(tricks: TrickResult[], roundNumber: number): RoundResult {
  if (tricks.length < 5) {
    throw new Error('A round must have exactly 5 tricks to be calculated.');
  }
  
  // The winner of the final trick is the round winner because it emptied their hand
  const lastTrickIdx = tricks.length - 1;
  const winnerId = tricks[lastTrickIdx].winnerId;
  const lastWinningCard = tricks[lastTrickIdx].winningCard;
  
  let pointsGained = 0;
  let winningStreak_7s = 0;
  let reason = '';
  
  if (lastWinningCard.rank === '7') {
    // Round won with a 7! Count continuous successive won tricks ending in trick 5 with a '7'
    winningStreak_7s = 1;
    
    for (let t = lastTrickIdx - 1; t >= 0; t--) {
      const trick = tricks[t];
      if (trick.winnerId === winnerId && trick.winningCard.rank === '7') {
        winningStreak_7s++;
      } else {
        break; // streak is broken
      }
    }
    
    pointsGained = winningStreak_7s * 2;
    reason = `Victoire avec ${winningStreak_7s} dernier(s) 7 gagnant(s) successif(s) (+${pointsGained} points)`;
  } else {
    // Round won with a non-7
    pointsGained = 1;
    reason = `Victoire avec un dernier pli non-7 (${lastWinningCard.rank} de ${SUIT_LABELS[lastWinningCard.suit]}) (+1 point)`;
  }
  
  return {
    roundNumber,
    winnerId,
    pointsGained,
    winningStreak: winningStreak_7s,
    reason,
  };
}

/**
 * Deep implementation of Smart AI Strategy:
 * Generates the best card to play from the AI's hand given the trick context.
 */
export function selectAICard(hand: Card[], currentTrickCards: TrickPlayedCard[], leadCard: Card | null): Card {
  if (hand.length === 0) {
    throw new Error('AI cannot play: hand is empty');
  }

  // 1. AI is leading the trick (no card played yet)
  if (!leadCard) {
    // If AI has highly powerful cards (like A of any suit), they might want to lead with it to win the trick.
    // If they have 7s, they want to save them for the end (tricks 4 or 5) where they can win huge points!
    // So:
    // - In early tricks (1, 2, 3): lead with medium cards or lowest non-7, unless they only have high cards or 7s.
    // - In late tricks (4, 5): if they have 7s, they want to see if they can win with it. Or play high cards.
    
    const non7Cards = hand.filter(c => c.rank !== '7');
    
    if (hand.length <= 2) {
      // In last 2 tricks, AI wants to secure a win if they can, or play their 7s.
      // If AI has a 7, and it's the highest value card they can play to win, they play it.
      // Otherwise choose the highest card to secure winning.
      const highestCard = hand.reduce((max, card) => card.value > max.value ? card : max, hand[0]);
      return highestCard;
    }
    
    // Early tricks: flush out high cards
    if (non7Cards.length > 0) {
      // Return lowest non-7 card to preserve high cards and save 7s.
      return non7Cards.reduce((min, card) => card.value < min.value ? card : min, non7Cards[0]);
    } else {
      // Only 7s left! Play the 7
      return hand.reduce((min, card) => card.value < min.value ? card : min, hand[0]);
    }
  }

  // 2. AI is responding (leadCard exists)
  const startingSuit = leadCard.suit;
  const matchingCards = hand.filter(c => c.suit === startingSuit);
  const currentWinningPlay = getCurrentWinningPlay(currentTrickCards, startingSuit);
  const targetValue = currentWinningPlay ? currentWinningPlay.card.value : leadCard.value;

  // Case A: AI possesses cards of the starting suit
  if (matchingCards.length > 0) {
    // Cards that can beat the current winning card
    const winningCards = matchingCards.filter(c => c.value > targetValue);
    
    if (winningCards.length > 0) {
      // Smart: play the LOWEST card that beats the current winning card!
      // This increases efficiency (saving higher cards for later).
      return winningCards.reduce((min, card) => card.value < min.value ? card : min, winningCards[0]);
    } else {
      // AI cannot win the trick.
      // Smart: play the LOWEST card of that suit (sacrifice it since we can't win anyway).
      return matchingCards.reduce((min, card) => card.value < min.value ? card : min, matchingCards[0]);
    }
  }

  // Case B: AI does NOT have cards of the starting suit (sacrifice)
  // They can play anything.
  // Smart: Play the lowest value card overall.
  // Special: Don't sacrifice a 7 if they have other useless non-7 cards, save the 7 for end of round points possibly.
  const non7Cards = hand.filter(c => c.rank !== '7');
  if (non7Cards.length > 0) {
    // Sacrifice lowest non-7
    return non7Cards.reduce((min, card) => card.value < min.value ? card : min, non7Cards[0]);
  } else {
    // No choice, sacrifice lowest overall (which is a 7)
    return hand.reduce((min, card) => card.value < min.value ? card : min, hand[0]);
  }
}
