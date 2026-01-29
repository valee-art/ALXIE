import React, { useState, useEffect } from 'react';
import { ReflectionEntry, Page } from '../types';
import { saveReflection, getReflections, clearReflections } from '../services/dbService';
import { generateReflectionEvaluation } from '../services/geminiService';
import AdminChat from './AdminChat';

const EMOTIONS = [
  { id: 'happy', label: 'Bahagia', emoji: '☀️', color: 'bg-yellow-500/10 border-yellow-500/30' },
  { id: 'sad', label: 'Sedih', emoji: '🌧️', color: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'angry', label: 'Marah', emoji: '🔥', color: 'bg-red-500/10 border-red-500/30' },
  { id: 'fear', label: 'Takut', emoji: '🌑', color: 'bg-purple-500/10 border-purple-500/30' },
  { id: 'anxious', label: 'Cemas', emoji: '🌪️', color: 'bg-teal-500/10 border-teal-500/30' },
  { id: 'tired', label: 'Lelah', emoji: '☁️', color: 'bg-gray-500/10 border-gray-500/30' },
];

const Reflection: React.FC = () => {
  const [step, setStep] = useState<'select' | 'form' | 'history' | 'chat'>('select');
  const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTIONS[0] | null>(null);
  const [answers, setAnswers] = useState({ trigger: '', lastTime: '', coping: '' });
  const [history, setHistory] = useState<ReflectionEntry[]>([]);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeContext, setActiveContext] = useState("");

  useEffect(() => {
    setHistory(getReflections());
  }, []);

  const handleSave = () => {
    if (!selectedEmotion) return;
    const newId = crypto.randomUUID();
    // Fix: Added missing status property as it is required by the ReflectionEntry interface
    const newEntry: ReflectionEntry = {
      id: newId,
      emotion: selectedEmotion.label,
      emoji: selectedEmotion.emoji,
      answers: { ...answers },
      created_at: new Date().toISOString(),
      status: 'new'
    };
    saveReflection(newEntry);
    setHistory([newEntry, ...history]);
    setStep('history');
    setAnswers({ trigger: '', lastTime: '', coping: '' });
  };

  const startChat = (entry: ReflectionEntry) => {
    setActiveChatId(entry.id);
    setActiveContext(`Emosi: ${entry.emotion}, Pemicu: ${entry.answers.trigger}, Cara Koping: ${entry.answers.coping}`);
    setStep('chat');
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    const result = await generateReflectionEvaluation(history);
    setEvaluation(result);
    setIsEvaluating(false);
  };

  if (step === 'chat' && activeChatId) {
    return <AdminChat sessionId={activeChatId} context={activeContext} onBack={() => setStep('history')} />;
  }

  if (step === 'select') {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">Ruang Refleksi Emosi</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Pilih satu emosi yang paling dominan kamu rasakan saat ini. Kita akan mengenalnya lebih dalam secara perlahan.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {EMOTIONS.map((emo) => (
            <button
              key={emo.id}
              onClick={() => { setSelectedEmotion(emo); setStep('form'); }}
              className={`p-10 rounded-[2.5rem] border-2 transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-4 ${emo.color} hover:shadow-2xl`}
            >
              <span className="text-6xl">{emo.emoji}</span>
              <span className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white">{emo.label}</span>
            </button>
          ))}
        </div>

        {history.length > 0 && (
          <div className="text-center">
            <button 
              onClick={() => setStep('history')}
              className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b-2 border-blue-600/20 pb-1 hover:border-blue-600 transition-all"
            >
              Lihat Riwayat Refleksi ({history.length})
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'form' && selectedEmotion) {
    return (
      <div className="max-w-2xl mx-auto py-10 animate-in zoom-in-95 duration-500">
        <div className={`p-10 rounded-[3rem] border-2 ${selectedEmotion.color} bg-white dark:bg-gray-900 shadow-2xl space-y-8`}>
          <div className="flex items-center gap-6">
            <span className="text-7xl">{selectedEmotion.emoji}</span>
            <div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{selectedEmotion.label}</h3>
              <p className="text-sm text-gray-500">Mari kita bicarakan perasaan ini...</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Apa yang memicu perasaan ini?</label>
              <textarea 
                className="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border border-transparent dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Kejadian apa yang membuatmu merasakannya?"
                value={answers.trigger}
                onChange={(e) => setAnswers({...answers, trigger: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Kapan terakhir kali kamu merasakannya?</label>
              <input 
                type="text"
                className="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border border-transparent dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Tadi pagi? Seminggu lalu?"
                value={answers.lastTime}
                onChange={(e) => setAnswers({...answers, lastTime: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Apa yang biasanya kamu lakukan saat ini muncul?</label>
              <textarea 
                className="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border border-transparent dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Bagaimana caramu menghadapinya?"
                value={answers.coping}
                onChange={(e) => setAnswers({...answers, coping: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setStep('select')}
              className="flex-1 py-4 text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-gray-600 transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={handleSave}
              className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              Simpan Refleksi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Riwayat Refleksimu</h2>
          <p className="text-gray-500 dark:text-gray-400 italic">Melihat pola emosi untuk mengenal diri lebih baik.</p>
        </div>
        <button onClick={() => setStep('select')} className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">Refleksi Baru</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {history.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{entry.emoji}</span>
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">{entry.emotion}</h4>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">{new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <button 
                  onClick={() => startChat(entry)}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-xl uppercase tracking-widest border border-blue-100 dark:border-blue-900/30 hover:bg-blue-600 hover:text-white transition-all"
                >
                  Bicara Relawan
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <p className="text-gray-600 dark:text-gray-400"><span className="font-bold text-blue-500">Pemicu:</span> {entry.answers.trigger}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-bold text-blue-500">Koping:</span> {entry.answers.coping}</p>
              </div>
            </div>
          ))}
          {history.length === 0 && (
             <div className="py-20 text-center text-gray-400 italic">Belum ada riwayat refleksi.</div>
          )}
        </div>

        <div className="space-y-8">
          <div className="sticky top-24 p-8 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-100 dark:border-blue-900/30 rounded-[3rem] shadow-xl">
            <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mb-4 tracking-tighter italic">Evaluasi Ke Depan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Berdasarkan pola emosimu belakangan ini, ALXIE bisa memberikan rangkuman dukungan dan langkah kecil yang bisa kamu coba.
            </p>
            
            {evaluation ? (
              <div className="space-y-6 animate-in slide-in-from-top-2">
                <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 italic text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                  "{evaluation}"
                </div>
                <button onClick={() => setEvaluation(null)} className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Minta Evaluasi Baru</button>
              </div>
            ) : (
              <button 
                onClick={handleEvaluate}
                disabled={isEvaluating || history.length === 0}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                {isEvaluating ? 'Menganalisis Polamu...' : 'Dapatkan Evaluasi Suportif ✨'}
              </button>
            )}

            <div className="mt-8 pt-8 border-t border-blue-100 dark:border-blue-900/30">
              <p className="text-[9px] text-gray-400 leading-tight">
                *Evaluasi ini dihasilkan oleh AI berdasarkan jawabanmu. Gunakan sebagai bahan renungan, bukan pengganti saran profesional medis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reflection;