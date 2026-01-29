
import React, { useState, useEffect } from 'react';
import { VentData, ReflectionEntry } from '../types';
import { subscribeToVents, subscribeToReflections, updateAdminReply } from '../services/dbService';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vents' | 'reflections'>('vents');
  const [vents, setVents] = useState<VentData[]>([]);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [replyText, setReplyText] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubVents = subscribeToVents(setVents);
    const unsubReflections = subscribeToReflections(setReflections);
    return () => {
      unsubVents();
      unsubReflections();
    };
  }, []);

  const handleSendReply = async () => {
    if (!selectedId || !replyText.trim()) return;
    
    const success = await updateAdminReply(activeTab === 'vents' ? 'vent' : 'reflection', selectedId, replyText);
    if (success) {
      alert("Balasan berhasil dikirim via Cloud!");
      setReplyText("");
      setSelectedId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">Admin Panel <span className="text-indigo-600 dark:text-indigo-400">ALXIE</span></h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium uppercase text-[10px] tracking-[0.3em]">Cloud Real-time Monitor</p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <button onClick={() => setActiveTab('vents')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'vents' ? 'bg-white dark:bg-indigo-600 shadow-md text-indigo-600 dark:text-white' : 'text-gray-400'}`}>Curhat ({vents.length})</button>
          <button onClick={() => setActiveTab('reflections')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'reflections' ? 'bg-white dark:bg-indigo-600 shadow-md text-indigo-600 dark:text-white' : 'text-gray-400'}`}>Refleksi ({reflections.length})</button>
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-2xl flex items-center gap-4">
        <span className="text-2xl">🌍</span>
        <p className="text-[10px] text-green-600 dark:text-green-400 font-medium leading-relaxed uppercase tracking-wider">
          <span className="font-black">Cloud Connected:</span> Kamu sekarang bisa melihat curhatan dari perangkat apa pun di seluruh dunia secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
          {activeTab === 'vents' ? (
            vents.map(v => (
              <div key={v.id} onClick={() => setSelectedId(v.id)} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${selectedId === v.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-800'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 dark:text-white">{v.panggilan || 'Anonim'}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${v.status === 'replied' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>{v.status}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">"{v.pesan}"</p>
              </div>
            ))
          ) : (
            reflections.map(r => (
              <div key={r.id} onClick={() => setSelectedId(r.id)} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${selectedId === r.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-800'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 dark:text-white">{r.emoji} {r.emotion}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${r.status === 'replied' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>{r.status}</span>
                </div>
                <p className="text-xs text-gray-500 italic">"{r.answers.trigger}"</p>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedId ? (
            <div className="sticky top-24 p-8 bg-white dark:bg-gray-950 border-2 border-indigo-600 rounded-[2.5rem] shadow-xl space-y-6">
              <h3 className="text-xl font-black italic tracking-tighter">Balas Cloud 🧿</h3>
              <textarea 
                className="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border outline-none text-sm min-h-[200px]"
                placeholder="Tulis balasanmu..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button onClick={handleSendReply} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs">Kirim Sekarang</button>
            </div>
          ) : (
            <div className="sticky top-24 p-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center opacity-30">
              <p className="text-[10px] font-black uppercase">Pilih Pesan di Kiri</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
