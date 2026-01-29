
import React, { useState, useEffect } from 'react';
import { VentData, ReflectionEntry } from '../types';
import { subscribeToVents, subscribeToReflections } from '../services/dbService';

const Journal: React.FC = () => {
  const [vents, setVents] = useState<VentData[]>([]);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'vents' | 'reflections'>('all');

  // Fix: use real-time subscriptions instead of static empty getters to actually show data
  useEffect(() => {
    const unsubVents = subscribeToVents(setVents);
    const unsubReflections = subscribeToReflections(setReflections);
    return () => {
      unsubVents();
      unsubReflections();
    };
  }, []);

  const getMoodEmoji = (moodId?: string) => {
    switch(moodId) {
      case 'sad': return '😢';
      case 'anxious': return '😰';
      case 'angry': return '😡';
      case 'tired': return '😫';
      case 'lonely': return '☁️';
      default: return '📝';
    }
  };

  const hasAnyData = vents.length > 0 || reflections.length > 0;

  if (!hasAnyData) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="text-6xl mb-6">🏜️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Jurnal Masih Kosong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Mulailah mencurahkan perasaan atau melakukan refleksi emosi untuk melihat riwayatmu di sini.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic">Jurnal & Dukungan</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Catatan perjalanan emosionalmu di ALXIE.</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-400'}`}>Semua</button>
          <button onClick={() => setFilter('vents')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === 'vents' ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-400'}`}>Curhat</button>
          <button onClick={() => setFilter('reflections')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === 'reflections' ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-400'}`}>Refleksi</button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Render Curhatan (Vents) */}
        {(filter === 'all' || filter === 'vents') && vents.map((entry) => (
          <div key={entry.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            {entry.admin_reply && <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">Balasan Admin</div>}
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{getMoodEmoji(entry.mood)}</span>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Curhatan: {entry.panggilan || "Anonim"}</h4>
                <p className="text-[10px] text-gray-400 uppercase font-black">{entry.created_at ? new Date(entry.created_at).toLocaleString() : 'Baru saja'}</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300 italic text-base border-l-4 border-indigo-500/20 pl-4 py-1">"{entry.pesan}"</p>
              {entry.admin_reply && (
                <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-950/40 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🧿</span>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Tanggapan Tim ALXIE</span>
                  </div>
                  <p className="text-sm text-indigo-900 dark:text-indigo-100 leading-relaxed font-medium">{entry.admin_reply}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Render Refleksi (Reflections) */}
        {(filter === 'all' || filter === 'reflections') && reflections.map((entry) => (
          <div key={entry.id} className="bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900/30 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
             {entry.admin_reply && <div className="absolute top-0 right-0 bg-green-600 text-white text-[8px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">Evaluasi Admin</div>}
             
             <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{entry.emoji}</span>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Refleksi: {entry.emotion}</h4>
                <p className="text-[10px] text-gray-400 uppercase font-black">{entry.created_at ? new Date(entry.created_at).toLocaleString() : 'Baru saja'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="text-xs bg-gray-50 dark:bg-black/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="font-black text-indigo-500 uppercase text-[9px] mb-1">Pemicu</p>
                  <p className="text-gray-600 dark:text-gray-300 italic">"{entry.answers.trigger}"</p>
                </div>
              </div>

              {entry.admin_reply && (
                <div className="mt-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-3xl border-2 border-green-200 dark:border-green-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🌿</span>
                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-[0.2em]">Saran Langkah Kecil</span>
                  </div>
                  <p className="text-sm text-green-900 dark:text-green-100 leading-relaxed font-medium">{entry.admin_reply}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;
