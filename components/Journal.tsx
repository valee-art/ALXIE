import React, { useState, useEffect } from 'react';
import { VentData } from '../types';
import { getAdminStats } from '../services/dbService';

const ADMIN_ICONS: Record<string, string> = {
  'Admin ALXIE': '🧿',
  'Epy': '🛡️',
  'Misteri': '🌑',
  'ADMIN Axelia': '✨',
  'Angel': '👼'
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
        <p className="text-gray-600 dark:text-gray-400 mb-8">Mulailah mencurahkan perasaanmu, balasan admin akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic">Jurnal & Dukungan</h2>
          <p className="text-gray-500 dark:text-gray-400">Refleksi dari perjalananmu dan balasan dari tim ALXIE.</p>
        </div>
      </div>

      <div className="space-y-6">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            {entry.admin_reply && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest animate-pulse">
                Pesan Baru Dari Admin
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{getMoodEmoji(entry.mood)}</span>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">{entry.panggilan || "Anonim"}</h4>
                <p className="text-[10px] text-gray-400 uppercase font-black">{new Date(entry.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300 italic text-base border-l-4 border-blue-500/20 pl-4 py-1">
                "{entry.pesan}"
              </p>

              {entry.admin_reply && (
                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/40 rounded-3xl border-2 border-blue-200 dark:border-blue-900/30 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🧿</span>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Tanggapan Tim ALXIE</span>
                  </div>
                  <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed font-medium">
                    {entry.admin_reply}
                  </p>
                  <p className="text-[8px] text-blue-400 mt-4 uppercase font-bold text-right">
                    Dibalas pada: {new Date(entry.admin_replied_at || '').toLocaleDateString()}
                  </p>
                </div>
              )}

              {entry.ai_response && !entry.admin_reply && (
                <div className="p-4 bg-gray-50 dark:bg-black/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Catatan ALXIE (AI):</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{entry.ai_response}</p>
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