/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, GameState, ChatMessage } from '../types';

// We bypass Firebase setup and use the custom full-stack WebSocket architecture.
// Since we have a backend server resolving multiplayer, they can play online instantly!
export const isFirebaseConfigured = true;

// Environment-aware Backend URLs (dev proxy fallback is used if these are empty)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || '';

// Placeholder exports to keep types and structures consistent
export let auth: any = null;
export let db: any = null;

let socket: WebSocket | null = null;
const roomSubscribers = new Set<(state: GameState) => void>();
const handSubscribers = new Set<(cards: Card[]) => void>();
const chatMessageSubscribers = new Set<(msg: ChatMessage) => void>();
const chatHistorySubscribers = new Set<(history: ChatMessage[]) => void>();

/**
 * Handle Auth preparation (generates frictionless identifier kept in local storage)
 */
export async function ensureAuthenticated(): Promise<string> {
  let localId = localStorage.getItem('sipa_local_player_id');
  if (!localId) {
    localId = 'player_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('sipa_local_player_id', localId);
  }
  return localId;
}

/**
 * REST Call to our backend express route to create a room code
 */
export async function createRoom(playerName: string, avatarId: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/create-room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ playerName, avatarId })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erreur lors de la création du salon');
  }

  const data = await response.json();
  return data.roomId;
}

/**
 * Join an existing lobby and mount the persistent WebSocket listener
 */
export async function joinRoom(roomId: string, playerName: string, avatarId: string): Promise<GameState> {
  const playerId = await ensureAuthenticated();

  if (socket) {
    socket.close();
    socket = null;
  }

  return new Promise((resolve, reject) => {
    let wsUrl = WS_BASE_URL;
    if (!wsUrl) {
      const isSecure = window.location.protocol === 'https:';
      wsUrl = `${isSecure ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    }

    const ws = new WebSocket(wsUrl);
    socket = ws;

    // Timeout if server doesn't respond
    const timeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        ws.close();
        reject(new Error("Impossible de se connecter au serveur en temps réel."));
      }
    }, 5000);

    ws.onopen = () => {
      clearTimeout(timeout);
      ws.send(JSON.stringify({
        type: 'join',
        payload: { roomId, playerId, playerName, avatarId }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'joined') {
          resolve(msg.payload.gameState);
        } else if (msg.type === 'error') {
          reject(new Error(msg.payload.message));
          ws.close();
        } else if (msg.type === 'room:updated') {
          roomSubscribers.forEach((sub) => sub(msg.payload));
        } else if (msg.type === 'your:hand') {
          handSubscribers.forEach((sub) => sub(msg.payload));
        } else if (msg.type === 'chat:message') {
          chatMessageSubscribers.forEach((sub) => sub(msg.payload));
        } else if (msg.type === 'chat:history') {
          chatHistorySubscribers.forEach((sub) => sub(msg.payload));
        }
      } catch (err) {
        console.error('Error handling WebSocket event:', err);
      }
    };

    ws.onerror = (err) => {
      clearTimeout(timeout);
      reject(new Error("Erreur de connexion avec le serveur."));
    };

    ws.onclose = () => {
      if (socket === ws) {
        socket = null;
      }
    };
  });
}

/**
 * Start the Game in an online room
 */
export async function startOnlineGame(roomId: string): Promise<void> {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'start_game',
      payload: { roomId }
    }));
  }
}

/**
 * Play card in online session
 */
export async function playOnlineCard(
  roomId: string,
  playerId: string,
  card: Card,
  playerName: string
): Promise<void> {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'play_card',
      payload: { roomId, playerId, card, playerName }
    }));
  }
}

/**
 * Deal cards for the next round in online room
 */
export async function dealNextOnlineRound(roomId: string): Promise<void> {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'deal_next_round',
      payload: { roomId }
    }));
  }
}

/**
 * Reset Scores online
 */
export async function resetOnlineScores(roomId: string): Promise<void> {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'reset_scores',
      payload: { roomId }
    }));
  }
}

/**
 * Subscribe to entire room updates
 */
export function subscribeToRoom(roomId: string, callback: (state: GameState) => void): () => void {
  roomSubscribers.add(callback);
  return () => {
    roomSubscribers.delete(callback);
  };
}

/**
 * Subscribe to the current player's private hand updates
 */
export function subscribeToPrivateHand(roomId: string, playerId: string, callback: (cards: Card[]) => void): () => void {
  handSubscribers.add(callback);
  return () => {
    handSubscribers.delete(callback);
  };
}

export function sendChatMessage(roomId: string, senderId: string, senderName: string, avatarId: string, text: string) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'send_message',
      payload: { roomId, senderId, senderName, avatarId, text }
    }));
  }
}

export function subscribeToChatMessage(callback: (msg: ChatMessage) => void): () => void {
  chatMessageSubscribers.add(callback);
  return () => {
    chatMessageSubscribers.delete(callback);
  };
}

export function subscribeToChatHistory(callback: (history: ChatMessage[]) => void): () => void {
  chatHistorySubscribers.add(callback);
  return () => {
    chatHistorySubscribers.delete(callback);
  };
}

/**
 * Register a new user with password and avatar (including anti-bot honeypot check)
 */
export async function registerUser(username: string, password: string, avatarId: string, honeypotValue: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password, avatarId, email_confirm: honeypotValue })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "Erreur d'inscription");
  }

  return await response.json();
}

/**
 * Log in an existing user
 */
export async function loginUser(username: string, password: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "Erreur de connexion");
  }

  return await response.json();
}

/**
 * Fetch the logged-in user profile using session token
 */
export async function getMe(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "Session invalide");
  }

  return await response.json();
}

/**
 * Log out the current user, destroying their session
 */
export async function logoutUser(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (err) {
    console.error("Logout request failed:", err);
  }
}
