/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GameState, 
  Card, 
  Player, 
  TrickPlayedCard, 
  TrickResult, 
  RoundResult,
  Suit,
  ActiveVote
} from './types';
import { 
  createDeck, 
  dealCards, 
  canPlayCard, 
  determineTrickWinner, 
  calculateRoundResult,
  selectAICard,
  getCurrentWinningPlay,
  SUIT_SYMBOLS,
  SUIT_COLORS,
  SUIT_LABELS,
  SUIT_SYMBOLS as SUIT_TEXT_SYMBOLS
} from './utils/gameEngine';
import { 
  isFirebaseConfigured, 
  ensureAuthenticated, 
  createRoom, 
  joinRoom, 
  startOnlineGame, 
  playOnlineCard, 
  dealNextOnlineRound, 
  resetOnlineScores,
  subscribeToRoom,
  subscribeToPrivateHand,
  API_BASE_URL,
  getMe,
  logoutUser,
  initiateOnlineVote,
  castOnlineVote
} from './utils/backendService';
import { CardView } from './components/CardView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { LobbyViews, OnlineWaitingLobby, AVATARS } from './components/LobbyViews';
import { ChatPanel } from './components/ChatPanel';
import AuthPage from './components/AuthPage';
import { sound } from './utils/sound';
import { 
  Info, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  RotateCcw, 
  Home, 
  History, 
  Trophy, 
  User, 
  UserCheck, 
  Sparkles,
  Award,
  Crown,
  Bot,
  Smartphone,
  Globe,
  XCircle,
  Square,
  Pause,
  Play,
  Check,
  X,
  AlertTriangle,
  Flag,
  Sun,
  Moon
} from 'lucide-react';

const LOCAL_AI_BOT_INFOS = [
  { name: 'SipaBot-Vega', avatarId: 'av2' },
  { name: 'SipaBot-Sirius', avatarId: 'av4' },
  { name: 'SipaBot-Orion', avatarId: 'av5' },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    roomId: null,
    players: [],
    deck: [],
    currentRound: 1,
    currentTrickIndex: 0,
    currentTrickCards: [],
    activePlayerIndex: 0,
    currentLeaderId: '',
    tricksHistory: [],
    status: 'lobby',
    winnerId: null,
    lastRoundResult: null,
    dealerId: '',
    gameMode: 'ai',
  });

  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [onlinePrivateHand, setOnlinePrivateHand] = useState<Card[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; avatarId: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Authentication callbacks
  const handleLogin = (user: { id: string; username: string; avatarId: string }, token: string) => {
    localStorage.setItem('sipa_auth_token', token);
    localStorage.setItem('sipa_local_player_id', user.id);
    localStorage.setItem('sipa_player_pseudo', user.username);
    setMyPlayerId(user.id);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('sipa_auth_token');
    if (token) {
      await logoutUser(token);
    }
    localStorage.removeItem('sipa_auth_token');
    localStorage.removeItem('sipa_local_player_id');
    localStorage.removeItem('sipa_player_pseudo');
    localStorage.removeItem('sipa_guest_player_id');
    setCurrentUser(null);
  };
  
  // UI states
  const [isMuted, setIsMuted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'solarized'>('dark');
  
  // Pass & Play Specific State
  const [showPassOverlay, setShowPassOverlay] = useState(false);
  const [hiddenHands, setHiddenHands] = useState<string[]>([]); // player IDs whose hands are hidden

  // Modals
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Vote / Game control state (for local AI and P&P modes)
  const [localVote, setLocalVote] = useState<ActiveVote | null>(null);
  const [showGameControlConfirm, setShowGameControlConfirm] = useState<{ action: 'cancel' | 'end' | 'pause' | 'resume' } | null>(null);

  // References to handle async loops cleanly
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Sync volume state to sound engine
  useEffect(() => {
    sound.setMuted(isMuted);
  }, [isMuted]);

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('sipa_theme') as 'dark' | 'solarized' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === 'solarized') {
      document.documentElement.classList.add('solarized-light');
    } else {
      document.documentElement.classList.remove('solarized-light');
    }
    localStorage.setItem('sipa_theme', theme);
  }, [theme]);

  // Load / Setup unique player identities and sessions
  useEffect(() => {
    const setupIdentity = async () => {
      const token = localStorage.getItem('sipa_auth_token');
      if (token) {
        try {
          const data = await getMe(token);
          if (data && data.user) {
            setCurrentUser(data.user);
            setMyPlayerId(data.user.id);
            localStorage.setItem('sipa_local_player_id', data.user.id);
            localStorage.setItem('sipa_player_pseudo', data.user.username);
            setIsAuthLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to restore session:", err);
          localStorage.removeItem('sipa_auth_token');
        }
      }

      setCurrentUser(null);
      setIsAuthLoading(false);
    };
    setupIdentity();
  }, []);

  // Online multiplayer WebSocket subscription
  useEffect(() => {
    if (gameState.gameMode !== 'online' || !gameState.roomId) {
      return;
    }

    // Subscribe to Room in-memory state changes via WS
    const unsubRoom = subscribeToRoom(gameState.roomId, (data) => {
      setGameState(prev => ({
        ...prev,
        ...data,
        gameMode: 'online',
      }));
    });

    // Subscribe to my private hand real-time updates via WS
    const unsubHand = subscribeToPrivateHand(gameState.roomId, myPlayerId, (cards) => {
      setOnlinePrivateHand(cards || []);
    });

    return () => {
      unsubRoom();
      unsubHand();
    };
  }, [gameState.roomId, gameState.gameMode, myPlayerId]);

  // AI execution trigger loop in local AI game
  useEffect(() => {
    if (gameState.status !== 'playing' || gameState.gameMode !== 'ai') return;
    
    // Don't trigger AI if the trick is already complete (waiting for resolution)
    if (gameState.currentTrickCards.length >= gameState.players.length) return;

    // Fetch active player
    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (!activePlayer || !activePlayer.isAI) return;

    // Ensure active player has cards in hand
    if (!activePlayer.hand || activePlayer.hand.length === 0) return;

    // Trigger AI play after short responsive delay
    const delay = setTimeout(() => {
      executeAIMove(activePlayer.id);
    }, 750);

    return () => clearTimeout(delay);
  }, [
    gameState.status, 
    gameState.activePlayerIndex, 
    gameState.gameMode, 
    gameState.currentTrickIndex, 
    gameState.currentTrickCards.length,
    gameState.players.length
  ]);


  // Synchronise le profil du joueur dans la base de données
  const syncUserProfile = async (id: string, name: string, avId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: id, playerName: name, avatarId: avId })
      });
    } catch (err) {
      console.error('Erreur de synchronisation du profil :', err);
    }
  };

  // Initialize a fresh Local AI Game Engine
  const startLocalAIGame = (opts: { pseudo: string; avatarId: string; opponentCount: number }) => {
    if (myPlayerId) {
      syncUserProfile(myPlayerId, opts.pseudo, opts.avatarId);
    }
    const p1: Player = {
      id: 'human_id',
      name: opts.pseudo,
      score: 0,
      hand: [],
      isAI: false,
      isHost: true,
      avatarId: opts.avatarId,
    };

    // Bots list
    const players: Player[] = [p1];
    for (let i = 0; i < opts.opponentCount; i++) {
      players.push({
        id: `ai_${i}`,
        name: LOCAL_AI_BOT_INFOS[i].name,
        score: 0,
        hand: [],
        isAI: true,
        avatarId: LOCAL_AI_BOT_INFOS[i].avatarId,
      });
    }

    // Generate, Shuffle, Deal
    const { hands } = dealCards(createDeck(), players.length);
    for (let i = 0; i < players.length; i++) {
      players[i].hand = hands[i];
    }

    setGameState({
      roomId: null,
      players,
      deck: [],
      currentRound: 1,
      currentTrickIndex: 0,
      currentTrickCards: [],
      activePlayerIndex: 0, // Human leads round 1
      currentLeaderId: 'human_id',
      tricksHistory: [],
      status: 'playing',
      winnerId: null,
      lastRoundResult: null,
      dealerId: 'human_id',
      gameMode: 'ai',
    });
    
    setMyPlayerId('human_id');
    sound.playCardSlide();
  };

  // Initialize a fresh Pass & Play Local Game Engine
  const startPassAndPlayGame = (opts: { pseudo: string; avatarId: string; playerCount: number }) => {
    if (myPlayerId) {
      syncUserProfile(myPlayerId, opts.pseudo, opts.avatarId);
    }
    const players: Player[] = [];
    
    // First player is configured
    players.push({
      id: 'pass_p1',
      name: opts.pseudo,
      score: 0,
      hand: [],
      isAI: false,
      isHost: true,
      avatarId: opts.avatarId,
    });

    // Create other local human players
    for (let i = 2; i <= opts.playerCount; i++) {
      players.push({
        id: `pass_p${i}`,
        name: `Joueur ${i}`,
        score: 0,
        hand: [],
        isAI: false,
        avatarId: AVATARS[(i - 1) % AVATARS.length].id,
      });
    }

    const { hands } = dealCards(createDeck(), players.length);
    for (let i = 0; i < players.length; i++) {
      players[i].hand = hands[i];
    }

    setGameState({
      roomId: null,
      players,
      deck: [],
      currentRound: 1,
      currentTrickIndex: 0,
      currentTrickCards: [],
      activePlayerIndex: 0,
      currentLeaderId: 'pass_p1',
      tricksHistory: [],
      status: 'playing',
      winnerId: null,
      lastRoundResult: null,
      dealerId: 'pass_p1',
      gameMode: 'pass_and_play',
    });

    // Mask hands except player 1
    const masked = players.slice(1).map(p => p.id);
    setHiddenHands(masked);
    setMyPlayerId('pass_p1');
    sound.playCardSlide();
  };

  // Connect to Online lobby creation
  const handleCreateOnlineRoom = async (opts: { pseudo: string; avatarId: string }) => {
    const pid = await ensureAuthenticated();
    setMyPlayerId(pid);
    await syncUserProfile(pid, opts.pseudo, opts.avatarId);
    const code = await createRoom(opts.pseudo, opts.avatarId);
    // Connect WebSocket and register the host in the room on the server!
    const roomState = await joinRoom(code, opts.pseudo, opts.avatarId);
    setGameState(roomState);
  };

  // Join online room
  const handleJoinOnlineRoom = async (roomId: string, opts: { pseudo: string; avatarId: string }) => {
    const pid = await ensureAuthenticated();
    setMyPlayerId(pid);
    await syncUserProfile(pid, opts.pseudo, opts.avatarId);
    const roomState = await joinRoom(roomId, opts.pseudo, opts.avatarId);
    setGameState(roomState);
  };

  // Start online room game directly (Only Host can call)
  const handleStartOnlineGame = async () => {
    if (!gameState.roomId) return;
    await startOnlineGame(gameState.roomId);
  };

  // Human plays card in current turn
  const playHumanCard = async (card: Card) => {
    if (gameState.status !== 'playing') return;
    if (gameState.currentTrickCards.length >= gameState.players.length) return;

    const me = gameState.players[gameState.activePlayerIndex];
    if (!me || me.isAI) return;

    // Validate turn rules under local play constraints
    if (gameState.gameMode === 'pass_and_play' && me.id !== myPlayerId) {
      // In Pass and play, wait for the actual active player
      return;
    }

    // Verify rules: follow suit if possible
    const leadPlay = gameState.currentTrickCards[0];
    const leadCard = leadPlay ? leadPlay.card : null;
    const hand = gameState.gameMode === 'online' ? onlinePrivateHand : me.hand;

    if (!canPlayCard(card, hand, leadCard)) {
      return; // Force follow suite
    }

    sound.playCardSlide();

    if (gameState.gameMode === 'online') {
      // Execute through online service update
      if (!gameState.roomId) return;
      await playOnlineCard(gameState.roomId, myPlayerId, card, me.name);
    } else {
      // Execute through local offline engine
      executeCardPlayOffline(me.id, card, me.name);
    }
  };

  // Execute AI action based on current board state
  const executeAIMove = (botId: string) => {
    const latestState = stateRef.current;
    if (latestState.currentTrickCards.length >= latestState.players.length) return;

    const botIdx = latestState.players.findIndex(p => p.id === botId);
    const bot = latestState.players[botIdx];
    if (!bot || !bot.hand || bot.hand.length === 0) return;

    const leadPlay = latestState.currentTrickCards[0];
    const leadCard = leadPlay ? leadPlay.card : null;

    try {
      const selectedAICardPayload = selectAICard(bot.hand, latestState.currentTrickCards, leadCard);
      
      // Check if sacrifice
      if (leadPlay && selectedAICardPayload.suit !== leadPlay.card.suit) {
        sound.playSacrifice();
      } else {
        sound.playCardSlide();
      }

      executeCardPlayOffline(botId, selectedAICardPayload, bot.name);
    } catch (err) {
      console.error("AI failed to play card securely:", err);
    }
  };

  // Core offline gameplay state transition engine
  const executeCardPlayOffline = (playerId: string, card: Card, playerName: string) => {
    const latestState = stateRef.current;
    if (latestState.currentTrickCards.length >= latestState.players.length) return;

    const players = latestState.players.map((p) => {
      if (p.id === playerId) {
        return {
          ...p,
          hand: p.hand.filter((c) => c.id !== card.id),
        };
      }
      return p;
    });

    const currentTrickCards = [...latestState.currentTrickCards, { playerId, card, playerName }];
    const totalPlayersCount = players.length;

    // 1. Did everyone play their card in this trick?
    if (currentTrickCards.length < totalPlayersCount) {
      // Advance active turn index
      const nextActiveIdx = (latestState.activePlayerIndex + 1) % totalPlayersCount;
      
      // Update P&P masking requirements for next transition
      let nextHidden = [...hiddenHands];
      if (latestState.gameMode === 'pass_and_play') {
        const nextPlayer = players[nextActiveIdx];
        // Autohide previous player
        if (!nextHidden.includes(playerId)) {
          nextHidden.push(playerId);
        }
        // Force pop mask overlay for next player
        setShowPassOverlay(true);
        setMyPlayerId(nextPlayer.id);
      }

      setGameState(prev => ({
        ...prev,
        players,
        currentTrickCards,
        activePlayerIndex: nextActiveIdx,
      }));
      setHiddenHands(nextHidden);
    } else {
      // Trick complete! Process results
      setGameState(prev => ({ ...prev, players, currentTrickCards }));

      // Find leading card parameters
      const firstPlay = currentTrickCards[0];
      const startingSuit = firstPlay.card.suit;
      
      // Determine trick winner
      const trickWinnerId = determineTrickWinner(currentTrickCards, startingSuit);
      const winnerPlayIdx = currentTrickCards.findIndex(p => p.playerId === trickWinnerId);
      const winningCard = currentTrickCards[winnerPlayIdx].card;

      const newTrickResult: TrickResult = {
        trickIndex: latestState.currentTrickIndex,
        leadPlayerId: latestState.currentLeaderId,
        winnerId: trickWinnerId,
        winningCard,
        playedCards: currentTrickCards,
      };

      const updatedTricksHistory = [...latestState.tricksHistory, newTrickResult];

      // Highlight winner instantly, then advance trick or end round
      sound.playTrickWon();

      // Check if that was the final trick (Trick index 4 = 5th trick)
      const isRoundEnd = latestState.currentTrickIndex >= 4;

      setTimeout(() => {
        if (isRoundEnd) {
          // Calculate round end points
          const roundResult = calculateRoundResult(updatedTricksHistory, latestState.currentRound);
          
          // Add points to winner's score
          const updatedPlayersWithNewScore = players.map((p) => {
            if (p.id === roundResult.winnerId) {
              return { ...p, score: p.score + roundResult.pointsGained };
            }
            return p;
          });

          // Play winner celebration sound
          sound.playRoundVictory();

          // Vérification de la victoire finale à 11 points en local
          const matchWinner = updatedPlayersWithNewScore.find(p => p.score >= 11);
          let finalWinnerId: string | null = null;
          if (matchWinner) {
            finalWinnerId = matchWinner.id;
            
            // Sauvegarder automatiquement en base de données le match local fini
            if (latestState.gameMode === 'ai') {
              fetch(`${API_BASE_URL}/api/matches/end-local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roomId: 'local_ai',
                  gameMode: 'ai',
                  players: updatedPlayersWithNewScore.map(p => ({
                    id: p.id === 'human_id' ? myPlayerId : p.id,
                    name: p.name,
                    score: p.score,
                    isHost: p.id === 'human_id',
                    isAI: p.isAI,
                    avatarId: p.avatarId
                  })),
                  winnerId: finalWinnerId === 'human_id' ? myPlayerId : finalWinnerId
                })
              }).catch(err => console.error('Erreur de sauvegarde DB match local IA :', err));
            } else if (latestState.gameMode === 'pass_and_play') {
              fetch(`${API_BASE_URL}/api/matches/end-local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roomId: 'local_pass',
                  gameMode: 'pass_and_play',
                  players: updatedPlayersWithNewScore.map(p => ({
                    id: p.id === 'pass_p1' ? myPlayerId : p.id,
                    name: p.name,
                    score: p.score,
                    isHost: p.id === 'pass_p1',
                    isAI: p.isAI,
                    avatarId: p.avatarId
                  })),
                  winnerId: finalWinnerId === 'pass_p1' ? myPlayerId : finalWinnerId
                })
              }).catch(err => console.error('Erreur de sauvegarde DB match local Pass & Play :', err));
            }
          }

          setGameState(prev => ({
            ...prev,
            players: updatedPlayersWithNewScore,
            currentTrickCards: [],
            tricksHistory: updatedTricksHistory,
            lastRoundResult: roundResult,
            status: 'round_end',
            winnerId: finalWinnerId,
          }));
          
          setShowRoundSummary(true);
        } else {
          // Next trick setup
          const nextLeaderIdx = players.findIndex(p => p.id === trickWinnerId);
          
          // Pass & play masking management
          let nextHidden = [...hiddenHands];
          if (latestState.gameMode === 'pass_and_play') {
            const nextL = players[nextLeaderIdx];
            setShowPassOverlay(true);
            setMyPlayerId(nextL.id);
          }

          setGameState(prev => ({
            ...prev,
            currentTrickCards: [],
            currentTrickIndex: prev.currentTrickIndex + 1,
            currentLeaderId: trickWinnerId,
            activePlayerIndex: nextLeaderIdx,
            tricksHistory: updatedTricksHistory,
          }));
          setHiddenHands(nextHidden);
        }
      }, 1400); // Allow player to visually inspect completed trick winner for 1.4s
    }
  };

  // Start next round (Offline / local)
  const dealNextLocalRound = () => {
    const nextRoundNum = gameState.currentRound + 1;
    const playersCount = gameState.players.length;

    const { hands } = dealCards(createDeck(), playersCount);
    
    // Previous Round Winner starts the new Round
    const prevWinnerId = gameState.lastRoundResult?.winnerId || gameState.players[0].id;
    const startingLeaderIndex = gameState.players.findIndex(p => p.id === prevWinnerId);

    const updatedPlayers = gameState.players.map((p, idx) => ({
      ...p,
      hand: hands[idx],
    }));

    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      currentRound: nextRoundNum,
      currentTrickIndex: 0,
      currentTrickCards: [],
      activePlayerIndex: startingLeaderIndex >= 0 ? startingLeaderIndex : 0,
      currentLeaderId: prevWinnerId,
      tricksHistory: [],
      status: 'playing',
      lastRoundResult: null,
    }));

    setShowRoundSummary(false);
    
    if (gameState.gameMode === 'pass_and_play') {
      const activeP = updatedPlayers[startingLeaderIndex >= 0 ? startingLeaderIndex : 0];
      setMyPlayerId(activeP.id);
      // Mask all other hands immediately
      const masked = updatedPlayers.filter(p => p.id !== activeP.id).map(p => p.id);
      setHiddenHands(masked);
      setShowPassOverlay(true);
    }

    sound.playCardSlide();
  };

  // Deal next online round (Firebase writes)
  const handleOnlineNextRoundDeal = async () => {
    if (!gameState.roomId) return;
    await dealNextOnlineRound(gameState.roomId);
    setShowRoundSummary(false);
  };

  // Reset scores to 0
  const resetScoresAndRestart = async () => {
    sound.playCardSlide();
    if (gameState.gameMode === 'online') {
      if (!gameState.roomId) return;
      await resetOnlineScores(gameState.roomId);
    } else {
      const resetPlayers = gameState.players.map((p) => ({ ...p, score: 0 }));
      setGameState(prev => ({ ...prev, players: resetPlayers }));
    }
    // Dismiss summary if open
    setShowRoundSummary(false);
  };

  // Return to core Welcome Menu
  const handleExitToLobby = () => {
    setGameState({
      roomId: null,
      players: [],
      deck: [],
      currentRound: 1,
      currentTrickIndex: 0,
      currentTrickCards: [],
      activePlayerIndex: 0,
      currentLeaderId: '',
      tricksHistory: [],
      status: 'lobby',
      winnerId: null,
      lastRoundResult: null,
      dealerId: '',
      gameMode: 'ai',
    });
    setHiddenHands([]);
    setShowPassOverlay(false);
    setShowRoundSummary(false);
    setLocalVote(null);
    setShowGameControlConfirm(null);
  };

  // ─── GAME CONTROL ACTIONS ─────────────────────────────────
  const handleGameAction = (action: 'cancel' | 'end' | 'pause' | 'resume') => {
    if (gameState.gameMode === 'ai') {
      // AI Mode: Direct confirmation (no vote needed)
      setShowGameControlConfirm({ action });
    } else if (gameState.gameMode === 'pass_and_play') {
      // P&P Mode: Start local vote
      const me = gameState.players.find(p => p.id === myPlayerId);
      if (!me) return;
      const votes: Record<string, boolean> = {};
      votes[myPlayerId] = true; // initiator votes yes
      setLocalVote({
        initiatorId: myPlayerId,
        initiatorName: me.name,
        action,
        votes,
        expiresAt: Date.now() + 60000,
      });
    } else if (gameState.gameMode === 'online') {
      // Online Mode: Send vote through WebSocket
      if (gameState.roomId) {
        initiateOnlineVote(gameState.roomId, action);
      }
    }
  };

  // Handle local vote cast (P&P mode)
  const handleLocalVoteCast = (playerId: string, vote: boolean) => {
    if (!localVote) return;
    const updatedVotes = { ...localVote.votes, [playerId]: vote };
    const totalPlayers = gameState.players.length;
    const totalVotes = Object.keys(updatedVotes).length;
    
    if (totalVotes >= totalPlayers) {
      // All voted - resolve
      const yesCount = Object.values(updatedVotes).filter(v => v).length;
      const majority = Math.ceil(totalPlayers / 2);
      
      if (yesCount >= majority) {
        executeGameAction(localVote.action);
      }
      setLocalVote(null);
    } else {
      setLocalVote({ ...localVote, votes: updatedVotes });
    }
  };

  // Handle online vote cast
  const handleOnlineVoteCast = (vote: boolean) => {
    if (!gameState.roomId || !gameState.activeVote) return;
    castOnlineVote(gameState.roomId, vote);
  };

  // Execute game action directly (after confirmation or vote approval)
  const executeGameAction = async (action: 'cancel' | 'end' | 'pause' | 'resume') => {
    if (action === 'cancel') {
      // Save canceled match to DB for traceability
      const matchPlayers = gameState.players.map(p => ({
        id: p.id === 'human_id' ? myPlayerId : (p.id === 'pass_p1' ? myPlayerId : p.id),
        name: p.name,
        score: p.score,
        isHost: p.isHost || false,
        isAI: p.isAI,
        avatarId: p.avatarId,
      }));
      fetch(`${API_BASE_URL}/api/matches/cancel-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: gameState.gameMode === 'ai' ? 'local_ai' : 'local_pass',
          gameMode: gameState.gameMode,
          players: matchPlayers,
        }),
      }).catch(err => console.error('Erreur sauvegarde match annulé:', err));
      handleExitToLobby();
    } else if (action === 'end') {
      // End match prematurely, highest scorer wins
      let highestScorePlayer = gameState.players[0];
      gameState.players.forEach(p => {
        if (p.score > highestScorePlayer.score) highestScorePlayer = p;
      });
      const winnerId = highestScorePlayer && highestScorePlayer.score > 0 ? highestScorePlayer.id : null;
      
      const matchPlayers = gameState.players.map(p => ({
        id: p.id === 'human_id' ? myPlayerId : (p.id === 'pass_p1' ? myPlayerId : p.id),
        name: p.name,
        score: p.score,
        isHost: p.isHost || false,
        isAI: p.isAI,
        avatarId: p.avatarId,
      }));
      fetch(`${API_BASE_URL}/api/matches/end-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: gameState.gameMode === 'ai' ? 'local_ai' : 'local_pass',
          gameMode: gameState.gameMode,
          players: matchPlayers,
          winnerId: winnerId === 'human_id' ? myPlayerId : (winnerId === 'pass_p1' ? myPlayerId : winnerId),
        }),
      }).catch(err => console.error('Erreur sauvegarde match terminé:', err));
      
      setGameState(prev => ({ ...prev, status: 'game_over', winnerId }));
    } else if (action === 'pause') {
      setGameState(prev => ({ ...prev, status: 'paused' }));
    } else if (action === 'resume') {
      setGameState(prev => ({ ...prev, status: 'playing' }));
    }
    setShowGameControlConfirm(null);
  };

  // Handle AI mode confirmation
  const handleConfirmGameAction = () => {
    if (!showGameControlConfirm) return;
    executeGameAction(showGameControlConfirm.action);
  };
  // ─── END GAME CONTROL ACTIONS ──────────────────────────────

  // Copy lobby code for inviting friends
  const [inviteCopied, setInviteCopied] = useState(false);
  const copyLobbyLink = () => {
    if (!gameState.roomId) return;
    navigator.clipboard.writeText(gameState.roomId);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  // Pass and Play: Unmask user's cards
  const unmaskLocalHand = (playerId: string) => {
    setHiddenHands(prev => prev.filter(id => id !== playerId));
    setShowPassOverlay(false);
  };

  // Render current plays in the center playground
  const renderCentralZone = () => {
    const leadPlay = gameState.currentTrickCards[0];
    const startingSuit = leadPlay ? leadPlay.card.suit : null;
    const currentWinningPlay = leadPlay ? getCurrentWinningPlay(gameState.currentTrickCards, startingSuit as Suit) : null;

    return (
      <div className="relative w-full max-w-xl mx-auto h-[180px] md:h-[280px] bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center gap-1.5 md:gap-3 overflow-hidden shadow-2xl">
        {/* Glow accent orb inside table */}
        <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full pointer-events-none" />

        {/* Dynamic Glowing Halo indicating starting play suit */}
        {startingSuit && (
          <div className="absolute top-2 left-3 md:top-3 md:left-4 flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-black/40 border border-white/10 backdrop-blur-sm rounded-full text-[10px] md:text-xs text-slate-200 font-mono select-none z-10">
            Sorte demandée :{' '}
            <span className={`${SUIT_COLORS[startingSuit as Suit]} font-bold`}>
              {SUIT_TEXT_SYMBOLS[startingSuit as Suit]} {SUIT_LABELS[startingSuit as Suit]}
            </span>
          </div>
        )}

        {/* Current Trick Cards row */}
        {gameState.currentTrickCards.length === 0 ? (
          <div className="text-center font-sans space-y-1 relative z-10">
            <span className="text-slate-400 text-xs tracking-wider uppercase font-mono block">Plateau de Table</span>
            <p className="text-sm font-bold text-white max-w-sm px-6">
              {gameState.players[gameState.activePlayerIndex]?.name} doit entamer le pli !
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center gap-2 md:gap-5 px-2 relative z-10">
            {gameState.currentTrickCards.map((play, idx) => {
              const isWinnerNow = currentWinningPlay?.playerId === play.playerId;
              const isLead = play.playerId === gameState.currentLeaderId;
              
              const isHandSymbolMatched = startingSuit ? play.card.suit === startingSuit : true;

              return (
                <motion.div
                  key={play.playerId}
                  initial={{ scale: 0.8, y: 15, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="text-[10px] md:text-xs font-bold text-slate-250 max-w-[80px] truncate">
                    {play.playerName}
                  </span>
                  
                  <CardView 
                    card={play.card} 
                    canPlay={true} 
                    isWinning={isWinnerNow}
                    size="sm"
                    faceUp={isHandSymbolMatched}
                  />
                  
                  {/* Prise de main indicator */}
                  {isWinnerNow ? (
                    <span className="bg-amber-400 text-slate-900 shadow-[0_0_8px_rgba(251,191,36,0.5)] font-mono text-[8px] md:text-[9px] px-1.5 py-0.5 font-bold rounded animate-pulse flex items-center gap-1">
                      Mène le pli <Crown className="w-2.5 h-2.5" />
                    </span>
                  ) : !isHandSymbolMatched ? (
                    <span className="bg-red-950/40 border border-red-500/20 text-red-300 font-mono text-[8px] px-1 rounded">
                      Sacrifiée
                    </span>
                  ) : (
                    <span className="h-3 w-1" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 1. Loading Splash Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-mesh text-slate-100 flex flex-col items-center justify-center selection:bg-blue-500 relative">
        <div className="absolute top-[30%] left-[30%] w-[250px] h-[250px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="glass p-8 max-w-xs w-full text-center space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          <div className="text-4xl font-black font-sans tracking-tighter text-white animate-pulse">SIPA</div>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" /> Chargement de la session...
          </div>
        </div>
      </div>
    );
  }

  // 2. Mandatory Authentication Gate
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // Handle welcome lobby
  if (gameState.status === 'lobby') {
    if (gameState.gameMode === 'online' && gameState.roomId) {
      return (
        <div className="min-h-screen bg-mesh text-slate-100 flex flex-col justify-between selection:bg-blue-500 relative">
          <OnlineWaitingLobby
            roomCode={gameState.roomId}
            players={gameState.players}
            myPlayerId={myPlayerId}
            onStartGame={handleStartOnlineGame}
            onLeaveLobby={handleExitToLobby}
          />
          <ChatPanel 
            roomId={gameState.roomId} 
            myPlayerId={myPlayerId} 
            players={gameState.players} 
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-mesh text-slate-150 flex flex-col justify-between selection:bg-blue-500 relative">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'solarized' : 'dark')}
            className="p-2 rounded-lg bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition shadow-lg backdrop-blur-md flex items-center justify-center cursor-pointer"
            title={`Passer au mode ${theme === 'dark' ? 'Clair Solarized' : 'Sombre'} (SIPA)`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-200" /> : <Moon className="w-5 h-5 text-slate-300" />}
          </button>
        </div>
        <LobbyViews
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onJoinLocalAI={startLocalAIGame}
          onJoinPassAndPlay={startPassAndPlayGame}
          onCreateOnline={handleCreateOnlineRoom}
          onJoinOnline={handleJoinOnlineRoom}
        />
        {/* Footer */}
        <div className="py-4 text-center border-t border-white/5 text-slate-500 text-xs font-mono backdrop-blur-md relative z-10">
          SIPA © 2026 • Design by Joach27
        </div>
      </div>
    );
  }

  // Active game play screen parameters
  const activeRound = gameState.currentRound;
  const activeTrick = gameState.currentTrickIndex + 1;
  const activePlayer = gameState.players[gameState.activePlayerIndex];
  
  // Hand reference depends on online vs local mode
  const currentHumanHand = gameState.gameMode === 'online' 
    ? onlinePrivateHand 
    : (gameState.players.find(p => p.id === myPlayerId)?.hand || []);

  const leadPlayCard = gameState.currentTrickCards[0]?.card || null;

  return (
    <div className="min-h-screen bg-mesh text-slate-100 font-sans flex flex-col selection:bg-blue-500 relative">
      
      {/* 1. Header Toolbar */}
      <header className="bg-white/5 border-b border-white/10 px-2 py-1.5 md:px-4 md:py-3 sticky top-0 z-30 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-1.5 md:gap-3">
          <button
            onClick={handleExitToLobby}
            className="p-1 md:px-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white text-xs transition-all flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" /> <span className="hidden xs:inline">Accueil</span>
          </button>
          
          <div className="h-4 w-[1px] bg-white/10" />

          <div className="text-slate-300 text-[10px] md:text-xs font-mono">
            <span className="hidden sm:inline">Mode : </span>
            <span className="text-blue-400 font-black uppercase tracking-wider inline-flex items-center gap-1">
              {gameState.gameMode === 'ai' && <Bot className="w-3.5 h-3.5" />}
              {gameState.gameMode === 'pass_and_play' && <Smartphone className="w-3.5 h-3.5" />}
              {gameState.gameMode === 'online' && <Globe className="w-3.5 h-3.5" />}
              {gameState.gameMode === 'ai' 
                ? 'IA' 
                : gameState.gameMode === 'pass_and_play' 
                  ? 'Local' 
                  : 'Ligne'
              }
            </span>
          </div>
        </div>

        {/* Center Round metrics */}
        <div className="flex items-center gap-1.5 md:gap-3 bg-white/10 border border-white/15 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold font-sans shadow-lg">
          <span className="text-blue-400">Rnd {activeRound}</span>
          <span className="text-white/20">•</span>
          <span className="text-slate-200">Pli {activeTrick}/5</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Game Control Buttons */}
          {(gameState.status === 'playing' || gameState.status === 'round_end' || gameState.status === 'paused') && (
            <>
              <button
                onClick={() => handleGameAction('cancel')}
                className="p-1.5 md:p-2 rounded-lg bg-red-950/40 border border-red-500/20 hover:bg-red-900/50 hover:border-red-500/40 text-red-400 hover:text-red-300 transition cursor-pointer"
                title="Annuler la partie"
                disabled={!!gameState.activeVote || !!localVote}
              >
                <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
              {gameState.status === 'paused' ? (
                <button
                  onClick={() => handleGameAction('resume')}
                  className="p-1.5 md:p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 hover:bg-emerald-900/50 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                  title="Reprendre la partie"
                  disabled={!!gameState.activeVote || !!localVote}
                >
                  <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleGameAction('pause')}
                  className="p-1.5 md:p-2 rounded-lg bg-amber-950/40 border border-amber-500/20 hover:bg-amber-900/50 hover:border-amber-500/40 text-amber-400 hover:text-amber-300 transition cursor-pointer"
                  title="Mettre en pause"
                  disabled={!!gameState.activeVote || !!localVote || gameState.status === 'round_end'}
                >
                  <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              )}
              <button
                onClick={() => handleGameAction('end')}
                className="p-1.5 md:p-2 rounded-lg bg-orange-950/40 border border-orange-500/20 hover:bg-orange-900/50 hover:border-orange-500/40 text-orange-400 hover:text-orange-300 transition cursor-pointer"
                title="Terminer la partie"
                disabled={!!gameState.activeVote || !!localVote}
              >
                <Flag className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
              <div className="h-4 w-[1px] bg-white/10" />
            </>
          )}
          <button
            onClick={() => setShowRuleModal(true)}
            className="p-1.5 md:p-2 rounded-lg bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition cursor-pointer"
            title="Règles du jeu"
          >
            <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-1.5 md:p-2 rounded-lg bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-semibold cursor-pointer"
            title="Voir toutes les cartes jouées"
          >
            <History className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Historique</span>
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 md:p-2 rounded-lg bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition cursor-pointer"
            title={isMuted ? 'Réactiver le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-450" />}
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'solarized' : 'dark')}
            className="p-1.5 md:p-2 rounded-lg bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition cursor-pointer"
            title={`Passer au mode ${theme === 'dark' ? 'Clair Solarized' : 'Sombre'} (SIPA)`}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-200" /> : <Moon className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300" />}
          </button>
        </div>
      </header>

      {/* 2. Main Space Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 md:p-4 flex flex-col justify-between gap-3 md:gap-6 overflow-hidden relative z-10">
        
        {/* Opponents Layout Bento list */}
        <div className="grid grid-cols-3 gap-1.5 md:gap-4 items-stretch">
          {gameState.players.map((player) => {
            if (player.id === myPlayerId) return null; // skip self here
            
            const avatar = AVATARS.find(av => av.id === player.avatarId) || AVATARS[0];
            const isPlayerActive = player.id === activePlayer?.id;
            
            // Get previous cards played by this specific player during this round with sacrifice flag
            const previousTricksPlayedByThisGuy = gameState.tricksHistory.map((trick) => {
              const play = trick.playedCards.find((p) => p.playerId === player.id);
              if (!play) return null;
              const leadPlay = trick.playedCards.find((p) => p.playerId === trick.leadPlayerId);
              const isSacrifice = leadPlay ? play.card.suit !== leadPlay.card.suit : false;
              return { card: play.card, isSacrifice };
            }).filter(Boolean) as { card: Card; isSacrifice: boolean }[];

            const handSize = gameState.gameMode === 'online' ? (player as any).handCount : player.hand.length;

            return (
              <div
                key={player.id}
                className={`
                  p-1.5 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border backdrop-blur-md transition-all duration-300 flex flex-col md:flex-row items-center md:items-stretch justify-between relative text-center md:text-left gap-1 md:gap-4
                  ${isPlayerActive 
                    ? 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 md:ring-2 ring-amber-400/10' 
                    : 'border-white/10'
                  }
                `}
              >
                <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-3">
                  <div className={`w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-bold text-xs md:text-lg border relative ${avatar.color}`}>
                    {avatar.symbol}
                    
                    {/* Glowing active status tracker */}
                    {isPlayerActive && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 md:h-2.5 md:w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-amber-400"></span>
                      </span>
                    )}
                  </div>

                  <div className="leading-tight">
                    <div className="font-bold text-[10px] md:text-sm text-slate-100 flex items-center justify-center md:justify-start gap-1 max-w-[65px] md:max-w-[120px] truncate">
                      {player.name}
                    </div>
                    <div className="text-[10px] md:text-xs text-amber-400 font-bold">
                      {player.score} pts
                    </div>
                  </div>
                </div>

                {/* Hand cards counts & history cards */}
                <div className="flex flex-col items-center md:items-end justify-between leading-none gap-1">
                  <div className="text-[9px] md:text-xs font-mono text-slate-300 uppercase tracking-tight font-medium">
                    <span className="md:inline hidden">Cartes : </span>{handSize} <span className="md:inline hidden">restant</span><span className="inline md:hidden">🎴</span>
                  </div>

                  {/* Previous played cards row for counting */}
                  {previousTricksPlayedByThisGuy.length > 0 && (
                    <div className="flex gap-0.5 md:gap-1 justify-center md:justify-end flex-wrap max-w-[70px] md:max-w-none">
                      {previousTricksPlayedByThisGuy.map((item, i) => {
                        const { card, isSacrifice } = item;
                        if (isSacrifice) {
                          return (
                            <div 
                              key={i} 
                              className="px-[3px] py-[2px] rounded bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-400/40 text-[7px] md:text-[9px] font-mono leading-none flex items-center justify-center relative shadow-[0_1px_3px_rgba(0,0,0,0.3)] h-4.5 w-3.5 md:h-5 md:w-4"
                              title="Carte défaussée / sacrifiée (montrée de dos)"
                            >
                              <span className="text-indigo-300 font-sans font-black select-none text-[8px] md:text-[10px]">✦</span>
                            </div>
                          );
                        }

                        const isRedCard = card.suit === 'hearts' || card.suit === 'diamonds';
                        return (
                          <div 
                            key={i} 
                            className={`px-0.5 md:px-1 text-[8px] md:text-[10px] rounded bg-white border border-slate-350 font-mono font-extrabold leading-tight flex items-center justify-center ${
                              isRedCard ? 'text-red-600' : 'text-neutral-950'
                            }`}
                            title={`${SUIT_LABELS[card.suit]} ${card.rank}`}
                          >
                            <span>{SUIT_SYMBOLS[card.suit]}</span>
                            <span className="text-[7.5px] md:text-[9.5px] ml-0.5">{card.rank}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* CENTRAL TRICK AREA */}
        {renderCentralZone()}

        {/* HUMAN BASE ZONE (Self HUD and Playable cards) */}
        {(() => {
          const me = gameState.players.find(p => p.id === myPlayerId);
          if (!me) return null;

          const avatar = AVATARS.find(av => av.id === me.avatarId) || AVATARS[0];
          const isMyActiveTurn = activePlayer?.id === myPlayerId && gameState.currentTrickCards.length < gameState.players.length;

          // Previously played cards row
          const previousTricksPlayedByMe = gameState.tricksHistory.map((trick) => {
            const play = trick.playedCards.find((p) => p.playerId === myPlayerId);
            return play ? play.card : null;
          }).filter(Boolean) as Card[];

          return (
            <div className="space-y-4">
              
              {/* My Status header HUD - Frosted Glass box */}
              <div className="p-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex items-center justify-between gap-4 max-w-2xl mx-auto shadow-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base border ${avatar.color}`}>
                    {avatar.symbol}
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">
                      {me.name} (Vous)
                    </span>
                    <span className="text-xs text-amber-400 font-bold block">
                      Votre Score : {me.score} points
                    </span>
                  </div>
                </div>

                {isMyActiveTurn ? (
                  <div className="animate-pulse bg-blue-500/15 border border-blue-400/35 text-blue-300 font-mono text-xs font-bold px-3 py-1.5 rounded-lg shadow-inner">
                    À votre tour de jouer !
                  </div>
                ) : (
                  <div className="bg-black/40 text-slate-400 font-mono text-xs px-3 py-1.5 rounded-lg border border-white/10">
                    En attente des autres...
                  </div>
                )}

                {/* Previous played cards row */}
                {previousTricksPlayedByMe.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-black">Historique :</span>
                    <div className="flex gap-1">
                      {previousTricksPlayedByMe.map((c, i) => {
                        const isRedCard = c.suit === 'hearts' || c.suit === 'diamonds';
                        return (
                          <div 
                            key={i} 
                            className={`px-1.5 py-0.5 text-xs rounded bg-white border border-slate-350 font-mono font-extrabold flex items-center justify-center ${
                              isRedCard ? 'text-red-600' : 'text-neutral-950'
                            }`}
                            title={`${SUIT_LABELS[c.suit]} ${c.rank}`}
                          >
                            <span>{SUIT_SYMBOLS[c.suit]}</span>
                            <span className="ml-0.5">{c.rank}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* HAND DISPLAY SCREEN */}
              <div className="relative">
                {/* Mask overlay for Pass and play to maintain cards security - Extra glass blurred overlay */}
                {gameState.gameMode === 'pass_and_play' && showPassOverlay && (
                  <div className="absolute inset-0 bg-slate-950/85 border border-white/15 z-20 rounded-2xl flex flex-col items-center justify-center gap-4 p-8 text-center backdrop-blur-xl shadow-2xl">
                    <User className="w-10 h-10 text-purple-400 animate-bounce" />
                    <div>
                      <h3 className="font-sans font-bold text-xl text-white">
                        C'est au tour de Révéler la main !
                      </h3>
                      <p className="text-xs text-slate-300 max-w-sm mt-1 leading-normal">
                        Partagez l'appareil à la personne suivante : <strong className="text-purple-300 font-black">{me.name}</strong>. Les autres joueurs doivent détourner le regard !
                      </p>
                    </div>
                    <button
                      onClick={() => unmaskLocalHand(myPlayerId)}
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 border border-white/10 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg"
                    >
                      <UserCheck className="w-4 h-4 inline mr-1" /> Afficher mes cartes
                    </button>
                  </div>
                )}

                {/* Render Cards Hand row */}
                {currentHumanHand.length === 0 ? (
                  <div className="py-12 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center text-slate-400 text-xs font-mono backdrop-blur-sm">
                    Plus aucune carte en main
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-3 py-2 max-w-4xl mx-auto">
                    {currentHumanHand.map((card) => {
                      const isValidToPlayByRules = isMyActiveTurn && canPlayCard(card, currentHumanHand, leadPlayCard);
                      
                      return (
                        <CardView
                          key={card.id}
                          card={card}
                          faceUp={true}
                          canPlay={isValidToPlayByRules}
                          onClick={() => playHumanCard(card)}
                          size="md"
                        />
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          );
        })()}

      </main>

      {/* 3. Rule / Help Modal */}
      <AnimatePresence>
        {showRuleModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRuleModal(false)}
              className="fixed inset-0 bg-black/60 z-40 cursor-pointer backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-4 max-w-lg mx-auto bg-slate-950/40 border border-white/15 backdrop-blur-2xl rounded-3xl z-50 p-6 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 bg-transparent text-blue-400">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-base font-sans tracking-tight text-white">Règles Stratégiques SIPA</h3>
                </div>
                <button
                  onClick={() => setShowRuleModal(false)}
                  className="p-1 px-2.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold font-mono transition"
                >
                  Fermer
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 text-xs text-slate-200 space-y-4 leading-relaxed">
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <h4 className="font-black text-white text-sm mb-1.5 uppercase tracking-wider font-mono">1. Prise de Main (Force)</h4>
                  <p>
                    Le meneur joue sa carte. Les autres doivent répondre avec la <strong>MÊME SORTE</strong> (Pique ♠, Coeur ♥, Carreau ♦, Trèfle ♣) s'ils en possèdent.
                  </p>
                  <p className="mt-1">
                    La hiérarchie des puissances est : <strong>A &gt; K &gt; Q &gt; J &gt; 10 &gt; 9 &gt; 8 &gt; 7</strong>.
                  </p>
                  <p className="mt-1">
                    Le joueur qui pose la carte de la même sorte la plus forte à la fin du tour d'enchère <strong>remporte le pli (Prend la main)</strong> et entamera le tour suivant !
                  </p>
                </div>

                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <h4 className="font-black text-white text-sm mb-1.5 uppercase tracking-wider font-mono">2. Contraintes de jeu</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Vous avez la sorte demandée :</strong> Vous ÊTES OBLIGÉ d'en jouer une (supérieure ou inférieure de votre choix).</li>
                    <li><strong>Vous n'avez pas la sorte demandée :</strong> Vous devez sacrifier n'importe quelle carte de votre choix. Une carte sacrifiée ne peut jamais remporter le pli !</li>
                  </ul>
                </div>

                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <h4 className="font-black text-white text-sm mb-1.5 uppercase tracking-wider font-mono">3. Les Barèmes Spécifiques</h4>
                  <p>La manche s'arrête brutalement dès que toutes les cartes ont été jouées (pli 5).</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>Si votre dernier pli d'étape est emporté avec un 7 :</strong> Vous gagnez <strong>2 points par dernier 7 gagnants successifs</strong> (+2 pour un, +4 pour deux, etc.).</li>
                    <li><strong>Si votre dernier pli est un non-7 :</strong> Vous gagnez <strong>+1 point</strong> forfaitaire unique.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-4 text-center">
                <button
                  onClick={() => setShowRuleModal(false)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-xs transition shadow-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  Compris ! Let's play !
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Round summaries popup modal */}
      <AnimatePresence>
        {gameState.status === 'round_end' && gameState.lastRoundResult && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="w-full max-w-lg bg-slate-950/45 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-6"
              >
                {/* Glowing neon top outline */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500" />

                {/* Trophy Badge */}
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Award className="w-10 h-10 animate-pulse" />
                </div>

                {(() => {
                  const matchWinner = gameState.players.find(p => p.score >= 11);
                  if (matchWinner) {
                    return (
                      <div className="space-y-1">
                        <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest animate-pulse flex items-center justify-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span>VICTOIRE FINALE DU MATCH</span>
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        </span>
                        <h3 className="text-3xl font-black text-white leading-none">
                          Champion Suprême
                        </h3>
                        <p className="text-2xl font-black text-amber-400 mt-2 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.2)]">
                          {matchWinner.name} !
                        </p>
                        <p className="text-xs text-slate-350 italic mt-1 font-medium">
                          Le score cible de 11 points a été atteint. Le match est terminé !
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="space-y-1">
                        <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-widest">
                          FIN DE MANCHE COMPLÈTE
                        </span>
                        <h3 className="text-3xl font-black text-white leading-none">
                          Vainqueur de la Manche
                        </h3>
                        <p className="text-2xl font-black text-amber-400 mt-2 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.2)]">
                          {gameState.players.find(p => p.id === gameState.lastRoundResult?.winnerId)?.name} !
                        </p>
                      </div>
                    );
                  }
                })()}

                {/* Score Summary math */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-xs text-slate-200 leading-normal max-w-sm mx-auto font-medium">
                    {gameState.lastRoundResult.reason}
                  </div>
                  
                  {/* Cards evaluation visual details */}
                  <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-slate-400 flex justify-center gap-3">
                    <span>Multiplicateur : x2 par 7</span>
                    <span>•</span>
                    <span>Consécutifs : {gameState.lastRoundResult.winningStreak}</span>
                  </div>
                </div>

                {/* All players score summary leaderboard table */}
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-1 font-bold">CLASSEMENT DES SCORES</span>
                  <div className="divide-y divide-white/10 bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                    {gameState.players.map((p) => {
                      const isWinnerOfThisRound = p.id === gameState.lastRoundResult?.winnerId;
                      const avatar = AVATARS.find(av => av.id === p.avatarId) || AVATARS[0];
                      return (
                        <div key={p.id} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs border ${avatar.color}`}>
                              {avatar.symbol}
                            </span>
                            <span className={`text-xs font-bold ${isWinnerOfThisRound ? 'text-amber-400 font-black' : 'text-slate-200'}`}>
                              {p.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                            <span>{p.score} pts</span>
                            {isWinnerOfThisRound && (
                              <span className="text-emerald-300 text-[10px] bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                +{gameState.lastRoundResult?.pointsGained}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action footer */}
                <div className="pt-4 flex flex-col sm:flex-row gap-2">
                  {gameState.players.some(p => p.score >= 11) ? (
                    <button
                      onClick={handleExitToLobby}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Enregistrer & Retourner à l'Accueil
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={async () => {
                          if (gameState.gameMode === 'online') {
                            await handleOnlineNextRoundDeal();
                          } else {
                            dealNextLocalRound();
                          }
                        }}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" /> Prochaine Manche
                      </button>
                      <button
                        onClick={resetScoresAndRestart}
                        className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Recommencer
                      </button>
                    </>
                  )}
                </div>

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 4b. Game Over Modal (premature end via vote) */}
      <AnimatePresence>
        {gameState.status === 'game_over' && !gameState.lastRoundResult && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="w-full max-w-lg bg-slate-950/45 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-6"
              >
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                
                <div className="mx-auto w-16 h-16 rounded-full bg-orange-400/10 border border-orange-400/30 flex items-center justify-center text-orange-400">
                  <Flag className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-orange-400 font-bold uppercase tracking-widest">
                    Partie Terminée Prématurément
                  </span>
                  <h3 className="text-3xl font-black text-white leading-none">
                    Fin de Partie
                  </h3>
                  {gameState.winnerId && (
                    <p className="text-2xl font-black text-amber-400 mt-2">
                      {gameState.players.find(p => p.id === gameState.winnerId)?.name} en tête !
                    </p>
                  )}
                </div>

                {/* Scores */}
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-1 font-bold">Scores Finaux</span>
                  <div className="divide-y divide-white/10 bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                    {[...gameState.players].sort((a, b) => b.score - a.score).map(p => {
                      const isWinner = p.id === gameState.winnerId;
                      const avatar = AVATARS.find(av => av.id === p.avatarId) || AVATARS[0];
                      return (
                        <div key={p.id} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs border ${avatar.color}`}>
                              {avatar.symbol}
                            </span>
                            <span className={`text-xs font-bold ${isWinner ? 'text-amber-400 font-black' : 'text-slate-200'}`}>
                              {p.name} {isWinner && <Crown className="w-3 h-3 inline text-amber-400" />}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-white">{p.score} pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleExitToLobby}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" /> Retourner à l'Accueil
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 5. Right Sidebar Drawers */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        tricksHistory={gameState.tricksHistory}
        players={gameState.players}
        currentRound={gameState.currentRound}
      />

      {/* 6. Online Real-time Chat */}
      {gameState.gameMode === 'online' && gameState.roomId && (
        <ChatPanel 
          roomId={gameState.roomId} 
          myPlayerId={myPlayerId} 
          players={gameState.players} 
        />
      )}

      {/* 7. AI Mode Confirmation Dialog */}
      <AnimatePresence>
        {showGameControlConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGameControlConfirm(null)}
              className="fixed inset-0 bg-black/60 z-40 cursor-pointer backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm bg-slate-950/50 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl text-center space-y-5">
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${
                  showGameControlConfirm.action === 'cancel' ? 'bg-red-500/15 border border-red-500/30 text-red-400' :
                  showGameControlConfirm.action === 'pause' ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' :
                  showGameControlConfirm.action === 'resume' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' :
                  'bg-orange-500/15 border border-orange-500/30 text-orange-400'
                }`}>
                  {showGameControlConfirm.action === 'cancel' && <XCircle className="w-7 h-7" />}
                  {showGameControlConfirm.action === 'pause' && <Pause className="w-7 h-7" />}
                  {showGameControlConfirm.action === 'resume' && <Play className="w-7 h-7" />}
                  {showGameControlConfirm.action === 'end' && <Flag className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {showGameControlConfirm.action === 'cancel' && 'Annuler la partie ?'}
                    {showGameControlConfirm.action === 'pause' && 'Mettre en pause ?'}
                    {showGameControlConfirm.action === 'resume' && 'Reprendre la partie ?'}
                    {showGameControlConfirm.action === 'end' && 'Terminer la partie ?'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {showGameControlConfirm.action === 'cancel' && 'La partie sera annulée et ne comptera pas dans vos statistiques.'}
                    {showGameControlConfirm.action === 'pause' && 'La partie sera mise en pause.'}
                    {showGameControlConfirm.action === 'resume' && 'La partie reprendra où elle s\'était arrêtée.'}
                    {showGameControlConfirm.action === 'end' && 'Le joueur avec le plus de points sera déclaré vainqueur.'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowGameControlConfirm(null)}
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Non
                  </button>
                  <button
                    onClick={handleConfirmGameAction}
                    className={`flex-1 py-2.5 font-bold rounded-xl text-xs transition cursor-pointer text-white flex items-center justify-center gap-1.5 ${
                      showGameControlConfirm.action === 'cancel' ? 'bg-red-600 hover:bg-red-500' :
                      showGameControlConfirm.action === 'end' ? 'bg-orange-600 hover:bg-orange-500' :
                      showGameControlConfirm.action === 'pause' ? 'bg-amber-600 hover:bg-amber-500' :
                      'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> Oui, confirmer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 8. Vote Modal (P&P local and Online modes) */}
      <AnimatePresence>
        {(localVote || (gameState.activeVote && gameState.gameMode === 'online')) && (() => {
          const activeVoteData = localVote || gameState.activeVote;
          if (!activeVoteData) return null;

          const actionLabels: Record<string, string> = {
            cancel: 'Annuler la partie',
            end: 'Terminer la partie',
            pause: 'Mettre en pause',
            resume: 'Reprendre la partie',
          };
          const actionColors: Record<string, string> = {
            cancel: 'text-red-400 bg-red-500/15 border-red-500/30',
            end: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
            pause: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
            resume: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
          };

          const myVote = activeVoteData.votes[myPlayerId];
          const hasVoted = myVote !== undefined;
          
          // For P&P, find the next player who hasn't voted
          const nextVoterP_P = gameState.gameMode === 'pass_and_play' 
            ? gameState.players.find(p => activeVoteData.votes[p.id] === undefined) 
            : null;

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-md bg-slate-950/50 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl space-y-5">
                  {/* Vote Header */}
                  <div className="text-center space-y-3">
                    <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center border ${actionColors[activeVoteData.action]}`}>
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Vote en cours</span>
                      <h3 className="text-lg font-black text-white mt-1">{actionLabels[activeVoteData.action]}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Proposé par <span className="text-white font-bold">{activeVoteData.initiatorName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Player votes list */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold px-1">Votes des joueurs</span>
                    <div className="divide-y divide-white/10 bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                      {gameState.players.map(p => {
                        const playerVote = activeVoteData.votes[p.id];
                        const avatar = AVATARS.find(av => av.id === p.avatarId) || AVATARS[0];
                        return (
                          <div key={p.id} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs border ${avatar.color}`}>
                                {avatar.symbol}
                              </span>
                              <span className="text-xs font-bold text-slate-200">{p.name}</span>
                            </div>
                            <div>
                              {playerVote === true && (
                                <span className="text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Oui
                                </span>
                              )}
                              {playerVote === false && (
                                <span className="text-[10px] font-bold bg-red-500/15 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <X className="w-3 h-3" /> Non
                                </span>
                              )}
                              {playerVote === undefined && (
                                <span className="text-[10px] font-mono text-slate-500 animate-pulse">En attente...</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vote buttons */}
                  {gameState.gameMode === 'pass_and_play' && nextVoterP_P ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-300 text-center">
                        Au tour de <span className="text-purple-300 font-black">{nextVoterP_P.name}</span> de voter
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLocalVoteCast(nextVoterP_P.id, false)}
                          className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" /> Non
                        </button>
                        <button
                          onClick={() => handleLocalVoteCast(nextVoterP_P.id, true)}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Oui
                        </button>
                      </div>
                    </div>
                  ) : gameState.gameMode === 'online' && !hasVoted ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOnlineVoteCast(false)}
                        className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Non
                      </button>
                      <button
                        onClick={() => handleOnlineVoteCast(true)}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Oui
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-400 font-mono animate-pulse py-2">
                      En attente des votes des autres joueurs...
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* 9. Pause Overlay */}
      <AnimatePresence>
        {gameState.status === 'paused' && !localVote && !gameState.activeVote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-35 backdrop-blur-lg flex flex-col items-center justify-center gap-6"
          >
            <div className="glass p-10 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl border border-white/15 rounded-3xl">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Pause className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Partie en Pause</h2>
                <p className="text-sm text-slate-400 mt-2">La partie est temporairement suspendue.</p>
              </div>
              <button
                onClick={() => handleGameAction('resume')}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg cursor-pointer inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Reprendre la partie
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10. Canceled state - auto redirect */}
      {gameState.status === 'canceled' && (() => {
        // Auto redirect to lobby on cancel
        setTimeout(() => handleExitToLobby(), 100);
        return null;
      })()}
    </div>
  );
}
