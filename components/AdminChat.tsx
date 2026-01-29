import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { getChatSession, saveChatSession } from '../services/dbService';
import { getRelawanChatResponse } from '../services/geminiService';

interface AdminChatProps {
  sessionId: string;
  context: string;
  onBack: () => void;
}

const AdminChat: React.FC<AdminChatProps> = ({ sessionId, context, onBack }) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = getChatSession(sessionId);
    if (existing) {
      setSession(existing);
    } else {
      // Inisialisasi sesi baru dengan admin default
      const newSession: ChatSession = {
        id: sessionId,
        adminName: 'Admin ALXIE',
        adminIcon: '🧿',
        messages: []
      };
      setSession(newSession);
      // Trigger pesan pembuka
      handleBotReply(newSession, []);
    }
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isTyping]);

  const handleBotReply = async (currentSession: ChatSession, history: ChatMessage[]) => {
    setIsTyping(true);
    const replyText = await getRelawanChatResponse(currentSession.adminName, history, context);
    
    const botMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'admin',
      text: replyText,
      timestamp: new Date().toISOString()
    };

    const updatedSession = {
      ...currentSession,
      messages: [...history, botMsg]
    };
    
    setSession(updatedSession);
    saveChatSession(updatedSession);
    setIsTyping(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !session || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: inputText,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...session.messages, userMsg];
    const updatedSession = { ...session, messages: updatedMessages };
    
    setSession(updatedSession);
    setInputText("");
    
    await handleBotReply(updatedSession, updatedMessages);
  };

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto h-[80vh] flex flex-col bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-6 bg-gray-50 dark:bg-black/40 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{session.adminIcon}</span>
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{session.adminName}</h3>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Aktif Melayani</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <div className="text-center py-4">
          <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-400 px-4 py-1.5 rounded-full uppercase font-black tracking-widest">Awal Percakapan Reflektif</span>
        </div>

        {session.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700'
            }`}>
              {msg.text}
              <div className={`text-[8px] mt-2 opacity-50 font-bold uppercase ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 rounded-3xl rounded-tl-none border border-gray-200 dark:border-gray-700">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300"></div>
               </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-6 bg-gray-50 dark:bg-black/40 border-t border-gray-100 dark:border-gray-800">
        <div className="relative">
          <input 
            type="text"
            placeholder="Ketik balasanmu di sini..."
            className="w-full p-4 pr-16 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
        <p className="text-[9px] text-gray-400 mt-3 text-center uppercase tracking-widest font-bold">Relawan akan membalas berdasarkan refleksimu.</p>
      </form>
    </div>
  );
};

export default AdminChat;