
import React, { useState, useEffect } from 'react';
import { VentData } from '../types';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<VentData[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('alxie_vents') || '[]');
      setEntries([...saved].reverse());
      
      const moodCounts: Record<string, number> = {};
      saved.forEach((v: VentData) => {
        if (v.mood) moodCounts[v.mood] = (moodCounts[v.mood] || 0) + 1;
      });
      setStats(moodCounts);
    } catch (e) {
      console.error("Gagal memuat jurnal", e);
    }
  }, []);

  const clearJournal = () => {
    if (window.confirm("Hapus semua catatan?")) {
      localStorage.removeItem('alxie_vents');
      setEntries([]);
      setStats({});
    }
  };

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

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="text-6xl mb-6">🏜️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Jurnal Masih Kosong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Mulailah mencurahkan perasaanmu, dan mereka akan tersimpan aman di sini.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Jurnal Emosiku</h2>
          <p className="text-gray-600 dark:text-gray-400">Refleksi dari perjalananmu bercerita.</p>
        </div>
        <button onClick={clearJournal} className="text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/5 transition-colors">Hapus Semua</button>
      </div>

      {/* Mood Statistics Widget */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Statistik Mood</h3>
        <div className="flex items-end gap-3 h-24">
          {['sad', 'anxious', 'angry', 'tired', 'lonely'].map(m => {
            const count = stats[m] || 0;
            // Fix: Explicitly cast Object.values(stats) to number[] to ensure type safety with Math.max spread
            const max = Math.max(...(Object.values(stats) as number[]), 1);
            const height = (count / max) * 100;
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-2 h-full">
                <div className="flex-1 w-full bg-gray-50 dark:bg-black rounded-lg overflow-hidden flex items-end">
                  <div 
                    className={`w-full transition-all duration-1000 bg-blue-500/30 border-t-2 border-blue-500`} 
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <span className="text-lg">{getMoodEmoji(m)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{entry.alias || "Anonim"}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{new Date(entry.created_at || '').toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 italic text-sm border-l-2 border-blue-500/30 pl-4 py-1">"{entry.pesan}"</p>
              {entry.ai_response && (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase">ALXIE Berkata:</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{entry.ai_response}</p>
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
