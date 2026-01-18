
import React, { useState, useEffect } from 'react';
import { VentData } from '../types';
import { getAdminStats } from '../services/dbService';

const ADMIN_ICONS: Record<string, string> = {
  'Admin ALXIE': '🧿',
  'Epy': '🛡️',
  'Misteri': '🌑',
  'ADMIN Axelia': '✨'
};

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<VentData[]>([]);
  const [moodStats, setMoodStats] = useState<Record<string, number>>({});
  const [adminStats, setAdminStats] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('alxie_vents') || '[]');
      setEntries([...saved].reverse());
      
      const counts: Record<string, number> = {};
      saved.forEach((v: VentData) => {
        if (v.mood) counts[v.mood] = (counts[v.mood] || 0) + 1;
      });
      setMoodStats(counts);
      setAdminStats(getAdminStats());
    } catch (e) {
      console.error("Gagal memuat jurnal", e);
    }
  }, []);

  const clearJournal = () => {
    if (window.confirm("Hapus semua catatan? Statistik admin juga akan direset.")) {
      localStorage.removeItem('alxie_vents');
      localStorage.removeItem('alxie_admin_stats');
      setEntries([]);
      setMoodStats({});
      setAdminStats({});
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

  const hasAnyData = entries.length > 0 || Object.keys(adminStats).length > 0;

  if (!hasAnyData) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="text-6xl mb-6">🏜️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Jurnal Masih Kosong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Mulailah mencurahkan perasaanmu atau hubungi teman bicara, data akan tersimpan aman di sini.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Jurnal & Statistik</h2>
          <p className="text-gray-600 dark:text-gray-400">Refleksi dari perjalananmu di ALXIE.</p>
        </div>
        <button onClick={clearJournal} className="text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/5 transition-colors">Hapus Semua</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Statistics Widget */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Frekuensi Mood</h3>
          <div className="flex items-end gap-3 h-32">
            {['sad', 'anxious', 'angry', 'tired', 'lonely'].map(m => {
              const count = moodStats[m] || 0;
              const max = Math.max(...(Object.values(moodStats) as number[]), 1);
              const height = (count / max) * 100;
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="flex-1 w-full bg-gray-50 dark:bg-black rounded-xl overflow-hidden flex items-end">
                    <div 
                      className={`w-full transition-all duration-1000 bg-blue-500/30 border-t-2 border-blue-500`} 
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                  <span className="text-xl">{getMoodEmoji(m)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin Trust Statistics */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Teman Paling Dipercaya</h3>
          <div className="space-y-3">
            {Object.keys(ADMIN_ICONS).map(name => {
              const count = adminStats[name] || 0;
              const max = Math.max(...(Object.values(adminStats) as number[]), 1);
              const width = (count / max) * 100;
              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-1">
                      <span>{ADMIN_ICONS[name]}</span> {name}
                    </span>
                    <span>{count} Klik</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-black rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-1000"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(adminStats).length === 0 && (
              <p className="text-xs text-gray-400 italic py-4 text-center">Belum ada teman bicara yang dihubungi.</p>
            )}
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Riwayat Curhatan</h3>
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{entry.panggilan || "Anonim"}</h4>
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
      )}
    </div>
  );
};

export default Journal;
