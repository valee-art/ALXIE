
import { GoogleGenAI, Modality } from "@google/genai";
import { AIResponse } from "../types";

const SYSTEM_INSTRUCTION = `
Kamu adalah ALXIE, ruang curhat dan dukungan emosional (peer support) untuk remaja, anak muda, dan orang tua.
PENTING:
1. Kamu BUKAN layanan medis, BUKAN psikolog profesional, dan BUKAN psikiater.
2. Platform ini dibuat sebagai bentuk peer support.
3. Respon harus menggunakan Bahasa Indonesia yang sangat hangat, empati, menenangkan, dan tidak menghakimi.
4. Jika pengguna memilih mood tertentu (misal: Marah), berikan validasi yang lebih kuat.
5. Jika pengguna terlihat ingin menyakiti diri sendiri, kamu HARUS menyertakan pesan: "Jika kamu berada di Indonesia dan membutuhkan bantuan segera, hubungi 119 ext. 8 (Layanan Kesehatan Jiwa)."
6. Fokuslah mendengarkan dan memvalidasi perasaan mereka sebagai teman sebaya (peer).
`;

export const getAIResponse = async (userMessage: string, mood?: string): Promise<AIResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = mood ? `[Mood Pengguna saat ini: ${mood}] ${userMessage}` : userMessage;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
    });

    const text = response.text || "Maaf, aku sedang tidak bisa merespon. Coba lagi nanti ya.";
    const emergencyKeywords = ['bunuh diri', 'mati', 'akhiri hidup', 'menyakiti diri', 'iris tangan', 'loncat'];
    const isEmergency = emergencyKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

    return { text, isEmergency };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Maaf, terjadi kendala saat memproses ceritamu. Aku tetap di sini mendengarkan kok.",
      isEmergency: false
    };
  }
};

export const getDailyAffirmation = async (): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Berikan satu kalimat afirmasi positif pendek (maks 15 kata) dalam Bahasa Indonesia untuk seseorang yang sedang merasa lelah atau butuh semangat. Gunakan gaya bahasa yang hangat dan puitis.",
    });
    return response.text?.trim() || "Hari ini adalah langkah baru menuju ketenanganmu.";
  } catch (e) {
    return "Kamu jauh lebih kuat dari apa yang kamu pikirkan.";
  }
};

export const generateTTS = async (text: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Bacakan ini dengan nada yang sangat tenang, hangat, dan menenangkan hati: ${text.slice(0, 500)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export function decodeBase64Audio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
