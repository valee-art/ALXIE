
import React, { useState, useRef } from 'react';
import { VentData, AIResponse } from '../types';
import { getAIResponse, generateTTS, decodeBase64Audio, decodeAudioData } from '../services/geminiService';
import { saveVentData } from '../services/dbService';

const MOODS = [
  { id: 'sad', label: 'Sedih', emoji: '😢', color: 'bg-blue-500' },
  { id: 'anxious', label: 'Cemas', emoji: '😰', color: 'bg-teal-500' },
  { id: 'angry', label: 'Marah', emoji: '😡', color: 'bg-red-500' },
  { id: 'tired', label: 'Lelah', emoji: '😫', color: 'bg-purple-500' },
  { id: 'lonely', label: 'Sepi', emoji: '☁️', color: 'bg-gray-500' },
];

const TOPICS = [
  "Tentang sekolah/kerja...",
  "Tentang hubungan...",
  "Apa yang membuatku cemas?",
  "Hal yang kusyukuri hari ini...",
  "Hanya ingin didengarkan..."
];

const VentingForm: React.FC = () => {
  const [formData, setFormData] = useState<VentData>({
    alias: '', kontak: '', pesan: '', mood: '', consent: false, scheduled_at: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleTTS = async () => {
    if (!response?.text) return;
    setIsAudioLoading(true);
    try {
      const base64Audio = await generateTTS(response.text);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const decodedBytes = decodeBase64Audio(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, ctx);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) {
      console.error("Audio playback error", e);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const sendToWhatsApp = () => {
    const adminNumber = "628194068927";
    const moodEmoji = MOODS.find(m => m.id === formData.mood)?.emoji || '📝';
    const message = `Halo Admin ALXIE, saya ingin berbagi curhatan saya:\n\n*Alias:* ${formData.alias || 'Anonim'}\n*Mood:* ${moodEmoji} ${formData.mood || '-'}\n*Curhatan:* \n"${formData.pesan}"\n\n---\n*Respon AI ALXIE:*\n"${response?.text?.slice(0, 300)}..."`;
    window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.pesan.trim()) { setError("Isi pesan curhatmu dulu ya.."); return; }
    if (!formData.consent) { setError("Mohon berikan persetujuan agar pesanmu bisa kami dengar."); return; }

    setIsSubmitting(true);
    try {
      const aiRes = await getAIResponse(formData.pesan, formData.mood);
      const finalData = { ...formData, ai_response: aiRes.text };
      await saveVentData(finalData);
      setResponse(aiRes);
    } catch (err) {
      setError("Ada masalah teknis. Coba lagi ya.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setResponse(null);
    setFormData({ alias: '', kontak: '', pesan: '', mood: '', consent: false, scheduled_at: '' });
  };

  if (response) {
    return (
      <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl">✨</span></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Pesan dari ALXIE</h2>
              <button onClick={handleTTS} disabled={isAudioLoading} className={`p-3 rounded-full transition-all ${isAudioLoading ? 'bg-blue-500 text-white animate-pulse' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:scale-110'}`}>
                {isAudioLoading ? <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>}
              </button>
            </div>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">{response.text}</div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={handleReset} className="py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-2xl transition-all">Curhat Lagi</button>
              <button onClick={sendToWhatsApp} className="py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">Chat Admin WA</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Suaramu Sangat Berharga</h2>
        <p className="text-gray-600 dark:text-gray-400">Pilih suasana hatimu dan ceritakan apa saja.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900/30 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Apa yang kamu rasakan?</label>
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map(m => (
              <button key={m.id} type="button" onClick={() => setFormData({...formData, mood: m.id})} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${formData.mood === m.id ? `border-blue-500 ${m.color} text-white scale-110 shadow-lg` : 'border-transparent bg-gray-50 dark:bg-black hover:border-blue-300'}`}>
                <span className="text-2xl mb-1">{m.emoji}</span>
                <span className="text-[10px] font-bold uppercase">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {TOPICS.map((topic, i) => (
              <button key={i} type="button" onClick={() => setFormData({...formData, pesan: topic})} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors">
                {topic}
              </button>
            ))}
          </div>
          <textarea rows={5} required placeholder="Tuliskan isi hatimu di sini..." className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all resize-none" value={formData.pesan} onChange={(e) => setFormData({...formData, pesan: e.target.value})} />
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
          <input type="checkbox" id="consent" checked={formData.consent} onChange={(e) => setFormData({...formData, consent: e.target.checked})} className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <label htmlFor="consent" className="text-sm text-blue-800 dark:text-blue-300 cursor-pointer select-none">Saya mengizinkan ALXIE menyimpan pesan ini secara anonim.</label>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2">
          {isSubmitting ? "ALXIE sedang mendengarkan..." : "Kirim Curhatan 🚀"}
        </button>
      </form>
    </div>
  );
};

export default VentingForm;
