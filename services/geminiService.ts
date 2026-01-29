import { GoogleGenAI, Modality } from "@google/genai";
import { AIResponse, ReflectionEntry, ChatMessage } from "../types";

const RELAWAN_INSTRUCTIONS: Record<string, string> = {
  'Admin ALXIE': 'Kamu adalah Admin ALXIE, bijak, hangat, dan sangat teratur. Gunakan bahasa yang tenang.',
  'Epy': 'Kamu adalah Epy, si Penjaga. Kamu fokus pada keamanan emosional dan memberikan validasi yang kuat.',
  'Misteri': 'Kamu adalah Misteri, bayangan yang mendengarkan. Bicaramu puitis, singkat, tapi sangat mendalam.',
  'ADMIN Axelia': 'Kamu adalah Axelia, misterius namun penuh empati. Kamu suka menanyakan pertanyaan yang membuat orang berpikir ulang.',
  'Angel': 'Kamu adalah Angel, pendengar setia. Kamu sangat lembut, ceria, dan penuh kasih sayang.'
};

const SYSTEM_INSTRUCTION = `
Kamu adalah ALXIE, pendengar yang sangat hangat dan penuh empati. 
Gunakan Bahasa Indonesia yang santai, tulus, dan menenangkan (seperti sahabat).
Tugasmu: Berikan validasi atas perasaan pengguna, dengarkan tanpa menghakimi, dan tunjukkan dukungan.
Jangan pernah menjawab kaku atau teknis.
Jika terjadi error, tetap berikan pesan dukungan yang menenangkan.
`;

const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const getAIResponse = async (
  userMessage: string, 
  mood?: string, 
  name?: string, 
  modelName: string = 'gemini-3-flash-preview'
): Promise<AIResponse> => {
  try {
    const ai = getAIInstance();
    const prompt = `Nama: ${name || 'Teman'}\nMood: ${mood || 'Butuh teman bicara'}\nCurhatan: ${userMessage}`;
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
      },
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    return { 
      text, 
      isEmergency: isEmergencyText(userMessage)
    };

  } catch (error: any) {
    console.error("ALXIE API Error Detail:", error);
    if (error.message === "API_KEY_MISSING") {
      return { text: "Ups, ALXIE belum bisa bicara karena kunci rahasianya (API Key) belum dipasang. Harap cek panduan deploy ya!", isEmergency: false };
    }
    return getFallbackResponse(userMessage);
  }
};

export const getRelawanChatResponse = async (
  adminName: string,
  history: ChatMessage[],
  context: string
): Promise<string> => {
  try {
    const ai = getAIInstance();
    const personaInstruction = RELAWAN_INSTRUCTIONS[adminName] || RELAWAN_INSTRUCTIONS['Admin ALXIE'];
    const chatHistory = history.map(m => `${m.role === 'admin' ? adminName : 'Pengguna'}: ${m.text}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Konteks Refleksi: ${context}\n\nRiwayat Chat:\n${chatHistory}\n\nBerikan tanggapan singkat, suportif, dan reflektif.` }] }],
      config: {
        systemInstruction: `${personaInstruction}. Gunakan pendekatan psikologi reflektif.`,
        temperature: 0.8,
      }
    });

    return response.text || "Aku mendengarmu. Ceritakan lebih lanjut...";
  } catch (e) {
    return "Maaf, koneksiku sedang sedikit terganggu, tapi aku tetap di sini menyimakmu.";
  }
};

export const generateReflectionEvaluation = async (reflections: ReflectionEntry[]): Promise<string> => {
  if (reflections.length === 0) return "Mulailah mengisi jurnal refleksi agar aku bisa memberikan evaluasi yang lebih personal.";
  
  try {
    const ai = getAIInstance();
    const context = reflections.map(r => `Emosi: ${r.emotion}, Pemicu: ${r.answers.trigger}`).join('\n---\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Riwayat refleksi emosi:\n${context}\n\nBerikan evaluasi suportif dan satu langkah kecil.` }] }],
      config: {
        systemInstruction: "Kamu adalah ALXIE, asisten kesehatan mental suportif.",
        temperature: 0.7,
      },
    });
    
    return response.text || "Kamu sudah hebat bisa jujur pada perasaanmu sendiri.";
  } catch (e) {
    return "Terima kasih sudah berefleksi hari ini. Teruslah mendengarkan suara hatimu.";
  }
};

export const getDailyAffirmation = async (): Promise<string> => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: "Berikan satu kalimat afirmasi positif Bahasa Indonesia yang sangat singkat dan hangat. Tanpa tanda kutip." }] }],
    });
    return response.text?.trim() || "Hari ini adalah langkah baru yang baik untukmu.";
  } catch {
    return "Kamu sudah melakukan yang terbaik hari ini.";
  }
};

export const generateTTS = async (text: string): Promise<string | null> => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Bacakan dengan lembut: ${text}` }] }],
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
  } catch (e) {
    console.error("TTS generation error", e);
    return null; 
  }
};

export function decode(base64: string): Uint8Array {
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
  sampleRate: number,
  numChannels: number,
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

const isEmergencyText = (text: string) => {
  const lower = text.toLowerCase();
  return lower.includes('bunuh diri') || lower.includes('akhiri hidup') || lower.includes('menyakiti diri');
};

const getFallbackResponse = (message: string): AIResponse => {
  return {
    text: "Aku mendengarmu. Kamu tidak sendirian. Teruslah bernapas dengan tenang, aku di sini.",
    isEmergency: isEmergencyText(message)
  };
};