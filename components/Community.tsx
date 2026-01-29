
import React, { useState, useEffect } from 'react';
import { SupportMessage } from '../types';
import { saveSupportMessage, subscribeToCommunity, addReactionToMessage } from '../services/dbService';

const EMOJIS = ['🌟', '🌱', '☀️', '🌊', '🌈', '🕊️', '🌈', '🫂'];
const REACTION_OPTIONS = ['❤️', '🙌', '✨', '🫂'];

const Community: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Use real-time subscription for dynamic community content
  useEffect(() => {
    return subscribeToCommunity(setMessages);
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    setIsPosting(true);
    const payload: SupportMessage = {
      id: crypto.randomUUID(),
      sender: "Anonim",
      text: newMsg,
      created_at: new Date().toISOString(),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      reactions: {}
    };

    await saveSupportMessage(payload);
    setNewMsg("");
    setIsPosting(false);
    
    // Tampilkan notifikasi visual
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    await addReactionToMessage(messageId, emoji);
    // Subscription will automatically update the UI state
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-12 relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 dark:border-black/10">
          <span className="text-xl">✨</span>
          <span className="text-sm font-bold tracking-tight">Harapanmu telah tertempel di papan!</span>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Papan Harapan</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto italic leading-relaxed">
          "Satu kalimat atau cerita penyemangat darimu, bisa jadi alasan seseorang untuk tetap bertahan hari ini."
        </p>
      </div>

      <form onSubmit={handlePost} className="max-w-xl mx-auto flex flex-col gap-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <textarea 
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Tulis harapan atau pesan penyemangat untuk teman-teman di ALXIE..."
            className="relative w-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 shadow-xl resize-none min-h-[140px] text-center text-lg font-medium transition-all"
          />
        </div>
        <button 
          disabled={!newMsg.trim() || isPosting}
          className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 transform"
        >
          {isPosting ? 'Menempelkan...' : 'Tempel di Papan 📌'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.map((m, index) => (
          <div 
            key={m.id} 
            className={`p-8 bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group relative overflow-hidden flex flex-col h-full ${index === 0 && showToast ? 'ring-2 ring-blue-500 ring-offset-4 dark:ring-offset-black animate-pulse' : ''}`}
          >
            <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:opacity-30 transition-opacity rotate-12">{m.emoji}</div>
            
            <div className="flex-grow space-y-4">
               <span className="text-2xl block mb-2">{m.emoji}</span>
               <p className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">"{m.text}"</p>
            </div>

            <div className="mt-8 space-y-4">
               {/* Reaction Bar */}
               <div className="flex flex-wrap gap-2">
                 {REACTION_OPTIONS.map(emoji => {
                   const count = m.reactions?.[emoji] || 0;
                   return (
                     <button 
                       key={emoji}
                       onClick={() => handleReaction(m.id, emoji)}
                       className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-75 ${
                         count > 0 
                         ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                         : 'bg-gray-50 dark:bg-black/40 border-transparent text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                       }`}
                     >
                       <span>{emoji}</span>
                       {count > 0 && <span>{count}</span>}
                     </button>
                   );
                 })}
               </div>

               <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                 <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Sahabat ALXIE</span>
                 <span className="text-[9px] text-gray-400 uppercase">{m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Baru saja'}</span>
               </div>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 opacity-50">
            <div className="text-6xl">📝</div>
            <p className="font-medium text-gray-500">Papan ini masih kosong. Jadilah yang pertama menebar harapan!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
