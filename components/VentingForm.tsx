
import React, { useState, useRef } from 'react';
import { VentData, AIResponse } from '../types';
import { getAIResponse, generateTTS, decodeBase64Audio, decodeAudioData } from '../services/geminiService';
import { saveVentData } from '../services/dbService';

const MOODS = [
  { id: 'sad', label: 'Sedih', emoji: '😢' },
  { id: 'anxious', label: 'Cemas', emoji: '😰' },
  { id: 'angry', label: 'Marah', emoji: '😡' },
  { id: 'tired', label: 'Lelah', emoji: '😫' },
  { id: 'lonely', label: 'Sepi', emoji: '☁️' },
];

const ADMINS = [
  { name: 'Admin ALXIE', phone: '628194068927', icon: '🧿' },
  { name: 'Epy', phone: '6281572926951', icon: '🛡️' },
  { name: 'Misteri', phone: '6285133763226', icon: '🌑' },
  { name: 'ADMIN Axelia', phone: '6283140008929', icon: '✨' }
];

const VentingForm: React.FC = () => {
  const [formData, setFormData] = useState<VentData>({
    panggilan: '', kontak: '', pesan: '', mood: '', consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [error, setError] = useState<{message: string, type?: string} | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.pesan.trim()) return;
    if (!formData.consent) { setError({message: "Klik kotak persetujuan dulu ya...", type: 'consent'}); return; }

    setIsSubmitting(true);
    try {
      const aiRes = await getAIResponse(formData.pesan, formData.mood, formData.panggilan);
      await saveVentData({ ...formData, ai_response: aiRes.text });
      setResponse(aiRes);
      setHasPlayedOnce(false);
    } catch (err: any) {
      if (err.message === "RATE_LIMIT") {
        setError({message: "ALXIE sedang menerima banyak tamu. Tunggu 10 detik lalu coba klik Kirim lagi ya!", type: 'limit'});
      } else {
        setError({message: "Ada kendala sedikit di server Google. Jangan menyerah, coba tekan kirim sekali lagi ya?", type: 'general'});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTTS = async () => {
    if (!response?.text) return;
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch(e) {}
    }

    setIsAudioLoading(true);
    try {
      const base64Audio = await generateTTS(response.text);
      if (base64Audio) {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext();
        const ctx = audioContextRef.current;
        const decoded = decodeBase64Audio(base64Audio);
        const audioBuffer = await decodeAudioData(decoded, ctx);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
        currentSourceRef.current = source;
        setHasPlayedOnce(true);
        source.onended = () => setIsAudioLoading(false);
      } else {
        setIsAudioLoading(false);
      }
    } catch (e) { 
      setIsAudioLoading(false); 
    }
  };

  if (response) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-500 border border-blue-100 dark:border-blue-900/30">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">ALXIE Untukmu</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-8 text-lg">{response.text}</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={handleTTS} disabled={isAudioLoading} className="py-4 bg-blue-600 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg disabled:bg-blue-400 flex items-center justify-center gap-2">
            {isAudioLoading ? "ALXIE sedang bicara..." : (hasPlayedOnce ? "🔊 Putar Lagi" : "🔊 Dengarkan Suara ALXIE")}
          </button>
          <button onClick={() => setResponse(null)} className="py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-gray-500">Curhat Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900/50 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Panggilan" className="w-full p-3 bg-gray-50 dark:bg-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border dark:border-gray-800" value={formData.panggilan} onChange={(e) => setFormData({...formData, panggilan: e.target.value})} />
          <input type="text" placeholder="WA (Opsional)" className="w-full p-3 bg-gray-50 dark:bg-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border dark:border-gray-800" value={formData.kontak} onChange={(e) => setFormData({...formData, kontak: e.target.value})} />
        </div>
        <div className="flex justify-between gap-2">
          {MOODS.map(m => (
            <button key={m.id} type="button" onClick={() => setFormData({...formData, mood: m.id})} className={`flex-1 p-3 rounded-xl border-2 transition-all ${formData.mood === m.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-black'}`}>
              <span className="text-2xl block">{m.emoji}</span>
              <span className="text-[10px] font-bold text-gray-400">{m.label}</span>
            </button>
          ))}
        </div>
        <textarea rows={5} placeholder="Ceritakan apa saja yang mengganjal di hatimu..." className="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border dark:border-gray-800" value={formData.pesan} onChange={(e) => setFormData({...formData, pesan: e.target.value})} />
        <div className="flex items-start gap-2 bg-gray-50 dark:bg-black/40 p-3 rounded-xl">
          <input type="checkbox" id="consent" checked={formData.consent} onChange={(e) => setFormData({...formData, consent: e.target.checked})} className="w-5 h-5 mt-0.5 accent-blue-600" />
          <label htmlFor="consent" className="text-[10px] text-gray-500 leading-tight">Saya setuju cerita ini disimpan secara anonim.</label>
        </div>
        {error && (
          <div className="p-4 rounded-xl text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 animate-shake">
            <p className="flex items-center gap-2">
              <span>💡</span>
              <span>{error.message}</span>
            </p>
          </div>
        )}
        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white font-bold uppercase tracking-widest rounded-2xl shadow-xl hover:bg-blue-700 disabled:bg-gray-400 transition-all active:scale-95">
          {isSubmitting ? "Sedang Mengirim..." : "Kirim Curhatan 🚀"}
        </button>
      </form>
    </div>
  );
};

export default VentingForm;
