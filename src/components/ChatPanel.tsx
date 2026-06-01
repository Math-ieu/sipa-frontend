import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, ChevronRight, CornerDownRight } from 'lucide-react';
import { ChatMessage, Player } from '../types';
import { 
  sendChatMessage, 
  subscribeToChatMessage, 
  subscribeToChatHistory 
} from '../utils/backendService';
import { AVATARS } from './LobbyViews';

interface ChatPanelProps {
  roomId: string;
  myPlayerId: string;
  players: Player[];
}

export function ChatPanel({ roomId, myPlayerId, players }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const me = players.find(p => p.id === myPlayerId);

  // Sync scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      // Short delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);

  // Handle WS chat subscriptions
  useEffect(() => {
    // Reset messages when room changes
    setMessages([]);
    setUnreadCount(0);

    const unsubHistory = subscribeToChatHistory((history) => {
      setMessages(history);
    });

    const unsubMsg = subscribeToChatMessage((newMsg) => {
      setMessages(prev => {
        // Prevent duplicate appending
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      if (!isOpenRef.current && newMsg.senderId !== myPlayerId) {
        setUnreadCount(c => c + 1);
      }
    });

    return () => {
      unsubHistory();
      unsubMsg();
    };
  }, [roomId, myPlayerId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = me?.name || 'Joueur';
    const avatarId = me?.avatarId || 'av1';

    sendChatMessage(roomId, myPlayerId, senderName, avatarId, inputText.trim());
    setInputText('');
  };

  const getSenderAvatar = (msg: ChatMessage) => {
    return AVATARS.find(av => av.id === msg.avatarId) || AVATARS[0];
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* 1. Toggle Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center p-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/30 text-white shadow-xl shadow-blue-900/40 hover:from-blue-500 hover:to-indigo-500 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <MessageSquare className="w-5.5 h-5.5" />
          
          {/* Badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black border border-slate-900 shadow-lg text-white font-mono"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* 2. Floating Sliding Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="w-[320px] xs:w-[350px] sm:w-[380px] h-[450px] sm:h-[500px] flex flex-col bg-slate-950/95 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden relative"
          >
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-sm text-slate-100 uppercase tracking-wider font-sans">
                  Discussion de Salon
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  #{roomId}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages box list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 text-center select-none px-6">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-full">
                    <MessageSquare className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">Discussion vide</div>
                  <div className="text-[10px] text-slate-500 leading-normal">
                    Faites un coucou ! Dites bonjour ou discutez stratégies pendant le match.
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === myPlayerId;
                  const av = getSenderAvatar(msg);
                  const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar for foreign sender */}
                      {!isMe && (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0 mt-0.5 ${av.color}`}>
                          {av.symbol}
                        </div>
                      )}

                      <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Meta information */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 mb-0.5">
                          <span className="font-semibold">{msg.senderName}</span>
                          <span>•</span>
                          <span className="font-mono text-[9px]">{timeStr}</span>
                        </div>

                        {/* Speech Bubble */}
                        <div 
                          className={`
                            px-3 py-2 rounded-xl text-xs break-all leading-normal text-slate-100
                            ${isMe 
                              ? 'bg-blue-600 rounded-tr-none' 
                              : 'bg-white/10 border border-white/5 rounded-tl-none'
                            }
                          `}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Submission Form */}
            <form 
              onSubmit={handleSendMessage}
              className="p-3 bg-white/5 border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Votre message..."
                maxLength={100}
                className="flex-1 bg-black/60 text-xs px-3 py-2.5 rounded-xl border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`
                  p-2.5 rounded-xl flex items-center justify-center transition cursor-pointer border
                  ${inputText.trim() 
                    ? 'bg-blue-600 hover:bg-blue-500 border-blue-400/30 text-white' 
                    : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
