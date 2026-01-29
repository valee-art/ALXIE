import React, { useState, useEffect } from 'react';
import { VentData, ReflectionEntry, ChatSession } from '../types';
import { 
  subscribeToVents, 
  subscribeToReflections, 
  subscribeToAllChatSessions,
  updateAdminReply 
} from '../services/dbService';
import AdminChat from './AdminChat';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vents' | 'reflections' | 'chats'>('vents');
  const [vents, setVents] = useState<VentData[]>([]);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  
  const [replyText, setReplyText] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);

  useEffect(() => {
    const unsubVents = subscribeToVents(setVents);
    const unsubReflections = subscribeToReflections(setReflections);
    const unsubChats = subscribeToAllChatSessions(setChatSessions);
    return () => {
      unsubVents();
      unsubReflections();
      unsubChats();
    };
  }, []);

  const handleSendReply = async () => {
    if (!selectedId || !replyText.trim()) return;
    
    const type = activeTab === 'vents' ? 'vent' : 'reflection';
    const success = await updateAdminReply(type, selectedId, replyText);
    if (success) {
      setReplyText("");
      setSelectedId(null);
    }
  };

  const openChatSession = (session: ChatSession) => {
    setActiveChat(session);
  };

  if (activeChat) {
    return (
      <div className="animate-in fade-in duration-300">
        <AdminChat 
          isAdmin={true} 
          sessionId={activeChat.id} 
          context="Balasan Admin Manual" 
          onBack={() => setActiveChat(null)} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">Admin Panel <span className="text-indigo-600 dark:text-indigo-400">ALXIE</span></h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium uppercase text-[10px] tracking-[0.3em]">Monitoring & Respon Manual</p>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <button onClick={() => setActiveTab('vents')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vents' ? 'bg-white dark:bg-indigo-600 shadow-md text-indigo-600 dark:text-white' : 'text-gray-400'}`}>Curhat ({vents.length})</button>
          <button onClick={() => setActiveTab('reflections')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reflections' ? 'bg-white dark:bg-indigo-600 shadow-md text-indigo-600 dark:text-white' : 'text-gray-400'}`}>Refleksi ({reflections.length})</button>
          <button onClick={() => setActiveTab('chats')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'chats' ? 'bg-white dark:bg-indigo-600 shadow-md text-indigo-600 dark:text-white' : 'text-gray-400'}`}>Live Chats ({chatSessions.length})</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
          {activeTab === 'vents' && vents.map(v => (
            <div key={v.id} onClick={() => setSelectedId(v.id)} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${selectedId === v.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-800'}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900 dark:text-white">{v.panggilan || 'Anonim'}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${v.status === 'replied' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>{v.status}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">"{v.pesan}"</p>
            </div>
          ))}

          {activeTab === 'reflections' && reflections.map(r => (
            <div key={r.id} onClick={() => setSelectedId(r.id)} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${selectedId === r.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-800'}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900 dark:text-white">{r.emoji} {r.emotion}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${r.status === 'replied' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>{r.status}</span>
              </div>
              <p className="text-xs text-gray-500 italic">"{r.answers.trigger}"</p>
            </div>
          ))}

          {activeTab === 'chats' && chatSessions.map(s => (
            <div key={s.id} onClick={() => openChatSession(s)} className="p-6 bg-white dark:bg-gray-900/40 border-2 border-gray-100 dark:border-gray-800 rounded-3xl cursor-pointer hover:border-indigo-500 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{s.adminIcon}</span>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Chat ID: {s.id.slice(0, 8)}...</h4>
                  {/* Fixed: Removed redundant as any cast after updating ChatSession interface */}
                  <p className="text-[10px] text-gray-500">{s.messages.length} Pesan • Terakhir: {new Date(s.last_updated || 0).toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="p-2 bg-indigo-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </div>
            </div>
          ))}

          {(activeTab === 'vents' && vents.length === 0) || (activeTab === 'reflections' && reflections.length === 0) || (activeTab === 'chats' && chatSessions.length === 0) && (
             <div className="py-20 text-center text-gray-400 italic">Belum ada data di kategori ini.</div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedId ? (
            <div className="sticky top-24 p-8 bg-white dark:bg-gray-950 border-2 border-indigo-600 rounded-[2.5rem] shadow-xl space-y-6">
              <h3 className="text-xl font-black italic tracking-tighter">Balas Manual 🧿</h3>
              <textarea 
                className="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border outline-none text-sm min-h-[200px]"
                placeholder="Tulis balasanmu di sini..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button onClick={handleSendReply} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg hover:bg-indigo-700 transition-all active:scale-95">Kirim Sekarang</button>
            </div>
          ) : (
            <div className="sticky top-24 p-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] text-center opacity-30 flex flex-col items-center gap-4">
              <div className="text-4xl">👆</div>
              <p className="text-[10px] font-black uppercase tracking-widest">Pilih Item untuk Dibalas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;