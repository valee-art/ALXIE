
import React, { useState, useEffect } from 'react';
import { VentData, ReflectionEntry } from '../types';
import { getVents, getReflections, updateAdminReply } from '../services/dbService';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vents' | 'reflections'>('vents');
  const [vents, setVents] = useState<VentData[]>([]);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [replyText, setReplyText] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setVents(getVents().reverse());
    setReflections(getReflections().reverse());
  }, []);

  const handleSendReply = () => {
    if (!selectedId || !replyText.trim()) return;
    
    const success = updateAdminReply(activeTab === 'vents' ? 'vent' : 'reflection', selectedId, replyText);
    if (success) {
      alert("Balasan berhasil dikirim ke pengguna!");
      setReplyText("");
      setSelectedId(null);
      setVents(getVents().reverse());
      setReflections(getReflections().reverse());
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">Admin Panel <span className="text-indigo-600 dark:text-indigo-400">ALXIE</span></h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium uppercase text-[10px] tracking-[0.3em]">Master Control & Support Manager</p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setActiveTab('vents')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'vents' ? 'bg-white dark:bg-indigo-600 shadow-md text-indigo-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Curhatan ({vents.length})
          </button>
          <button 
            onClick={() => setActiveTab('reflections')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'reflections' ? 'bg-white dark:bg-indigo-600 shadow-md text-indigo-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Refleksi ({reflections.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
          {activeTab === 'vents' ? (
            vents.map(v => (
              <div 
                key={v.id} 
                onClick={() => setSelectedId(v.id)}
                className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${selectedId === v.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-xl scale-[1.01]' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-indigo-200'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{v.mood === 'sad' ? '😢' : v.mood === 'anxious' ? '😰' : '📝'}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{v.panggilan || 'Anonim'}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-black">{new Date(v.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${v.status === 'replied' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
                    {v.status === 'replied' ? 'Sudah Dibalas' : 'Antrean Baru'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic">"{v.pesan}"</p>
              </div>
            ))
          ) : (
            reflections.map(r => (
              <div 
                key={r.id} 
                onClick={() => setSelectedId(r.id)}
                className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${selectedId === r.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-xl scale-[1.01]' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-indigo-200'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.emoji}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{r.emotion}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-black">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${r.status === 'replied' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
                    {r.status === 'replied' ? 'Sudah Dibalas' : 'Antrean Baru'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1"><span className="font-bold">Pemicu:</span> {r.answers.trigger}</p>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedId ? (
            <div className="sticky top-24 p-8 bg-white dark:bg-gray-950 border-2 border-indigo-600 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)] space-y-6 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Balas Manual</h3>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-indigo-950/20 rounded-2xl text-xs italic text-gray-500 dark:text-gray-400 border-l-4 border-indigo-500">
                {activeTab === 'vents' 
                  ? `"${vents.find(v => v.id === selectedId)?.pesan}"`
                  : `Refleksi emosi: ${reflections.find(r => r.id === selectedId)?.emotion}`}
              </div>

              <textarea 
                className="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border border-transparent dark:border-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm min-h-[200px] resize-none text-gray-800 dark:text-gray-200"
                placeholder="Tulis pesan dukungan yang hangat..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSendReply}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Kirim Balasan
                </button>
                <button 
                  onClick={() => setSelectedId(null)}
                  className="w-full py-2 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-gray-600"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="sticky top-24 p-12 border-2 border-dashed border-indigo-100 dark:border-indigo-900/30 rounded-[2.5rem] text-center space-y-4 opacity-50 bg-indigo-50/10">
              <div className="text-5xl grayscale opacity-30">📬</div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] leading-relaxed">
                Menunggu Data <br/> Masuk ke Antrean
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
