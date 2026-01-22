
import React, { useState, useRef } from 'react';
import { VentData, AIResponse } from '../types';
import { getAIResponse, generateTTS, decode, decodeAudioData } from '../services/geminiService';
import { saveVentData } from '../services/dbService';

const MOODS = [
  { id: 'sad', label: 'Sedih', emoji: '😢' },
  { id: 'anxious', label: 'Cemas', emoji: '😰' },
  { id: 'angry', label: 'Marah', emoji: '😡' },
  { id: 'tired', label: 'Lelah', emoji: '😫' },
  { id: 'lonely', label: 'Sepi', emoji: '☁️' },
];

const VentingForm: React.FC = () => {
  const [formData, setFormData] = useState<VentData>({
    panggilan: '', kontak: '', pesan: '', mood: '', consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.pesan.trim()) return;
    if (!formData.consent) { setError("Klik kotak persetujuan dulu ya..."); return; }

    setIsSubmitting(true);
    try {
      const aiRes = await getAIResponse(formData.pesan, formData.mood, formData.panggilan);
      // Simpan data secara lokal
      await saveVentData({ ...formData, ai_response: aiRes.text });
      setResponse(aiRes);
    } catch (err: any) {
      console.error("Venting Fatal Error:", err);
      setError("Sepertinya ada sedikit kendala koneksi. Coba tekan kirim sekali lagi?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTTS = async () => {
    if (!response?.text) return;
    setIsAudioLoading(true);
    try {
      const base64Audio = await generateTTS(response.text);
      if (base64Audio) {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext();
        const ctx = audioContextRef.current;
        const decoded = decode(base64Audio);
        // Menggunakan signature decodeAudioData yang diperbarui sesuai pedoman
        const audioBuffer = await decodeAudioData(decoded, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) {
      console.error("TTS Error", e);
    } finally {
      setIsAudioLoading(false);
    }
  };

  if (response) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-blue-100 dark:border-blue-900/30 animate-shake">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">✨</div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Pesan Dari ALXIE</h2>
        </div>
        
        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-50 dark:border-blue-900/20 mb-8">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-lg italic font-medium">
            "{response.text}"
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleTTS} 
            disabled={isAudioLoading} 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all hover:scale-[1.02] active:scale-95"
          >
            {isAudioLoading ? "Mempersiapkan Suara..." : "🔊 Dengarkan Suara ALXIE"}
          </button>
          
          <button 
            onClick={() => setResponse(null)} 
            className="py-3 text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-blue-500 transition-colors"
          >
            Kembali Bercerita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900/50 p-10 rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic">Tuangkan Perasaanmu...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">ALXIE ada di sini untuk mendengarkan tanpa menghakimi.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Panggilan</label>
            <input 
              type="text" 
              placeholder="Namamu?" 
              className="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border border-transparent dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              value={formData.panggilan} 
              onChange={(e) => setFormData({...formData, panggilan: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Kontak (Opsional)</label>
            <input 
              type="text" 
              placeholder="WA/ID?" 
              className="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border border-transparent dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              value={formData.kontak} 
              onChange={(e) => setFormData({...formData, kontak: e.target.value})} 
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mood Kamu Saat Ini</label>
          <div className="flex justify-between gap-3">
            {MOODS.map(m => (
              <button 
                key={m.id} 
                type="button" 
                onClick={() => setFormData({...formData, mood: m.id})} 
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${formData.mood === m.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' : 'border-transparent bg-gray-50 dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900'}`}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cerita Kamu</label>
          <textarea 
            rows={6} 
            placeholder="Apa yang mengganjal di hatimu? Ceritakan saja semuanya..." 
            className="w-full p-6 bg-gray-50 dark:bg-black rounded-[2rem] border border-transparent dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner resize-none text-lg leading-relaxed" 
            value={formData.pesan} 
            onChange={(e) => setFormData({...formData, pesan: e.target.value})} 
          />
        </div>

        <div className="flex items-start gap-3 bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
          <input 
            type="checkbox" 
            id="consent" 
            checked={formData.consent} 
            onChange={(e) => setFormData({...formData, consent: e.target.checked})} 
            className="w-5 h-5 mt-1 accent-blue-600 rounded cursor-pointer" 
          />
          <label htmlFor="consent" className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal cursor-pointer">
            Saya mengerti bahwa cerita ini hanya disimpan di browser saya sendiri (Local Storage) dan ALXIE akan mendengarkan dengan sepenuh hati.
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-2xl animate-shake">
            <p className="text-red-600 dark:text-red-400 text-xs font-bold text-center">{error}</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting || !formData.pesan.trim()} 
          className="w-full py-5 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl hover:bg-blue-700 disabled:bg-gray-400 transition-all active:scale-95 transform hover:-translate-y-1 uppercase tracking-widest text-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ALXIE sedang menyimak...
            </span>
          ) : "Kirim Cerita Ke ALXIE ✨"}
        </button>
      </form>
    </div>
  );
};

export default VentingForm;
