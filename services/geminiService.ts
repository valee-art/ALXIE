import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AIResponse } from "../types";

const SYSTEM_INSTRUCTION = `
Kamu adalah ALXIE, pendengar yang sangat hangat dan penuh empati. 
Gunakan Bahasa Indonesia yang santai, tulus, dan menenangkan (seperti sahabat).
Tugasmu: Berikan validasi atas perasaan pengguna, dengarkan tanpa menghakimi, dan tunjukkan dukungan.
Jangan pernah menjawab kaku atau teknis.
Jika terjadi error, tetap berikan pesan dukungan yang menenangkan.
`;

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Mendapatkan respon AI untuk curhatan pengguna.
 * @param modelName - Nama model yang digunakan ('gemini-3-flash-preview' atau 'gemini-3-pro-preview')
 */
export const getAIResponse = async (
  userMessage: string, 
  mood?: string, 
  name?: string, 
  modelName: string = 'gemini-3-flash-preview'
): Promise<AIResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Nama: ${name || 'Teman'}\nMood: ${mood || 'Butuh teman bicara'}\nCurhatan: ${userMessage}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
      },
      safetySettings: safetySettings
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");

    return { 
      text, 
      isEmergency: isEmergencyText(userMessage)
    };

  } catch (error: any) {
    console.error("ALXIE API Error:", error);
    return getFallbackResponse(userMessage);
  }
};

const getFallbackResponse = (message: string): AIResponse => {
  const fallbacks = [
    "Aku mendengarmu dengan tulus. Maaf jika aku agak lambat merespons, tapi aku ingin kamu tahu bahwa perasaanmu sangat valid. Tarik napas pelan ya, aku di sini bersamamu.",
    "Terima kasih sudah mau berbagi cerita ini. Kamu sudah sangat hebat bisa bertahan sampai sekarang. Aku di sini untuk menemanimu sebentar.",
    "Aku mendengarmu. Kamu tidak sendirian. Meskipun ada sedikit kendala koneksi, hatiku tetap di sini untuk mendengarkan setiap keluh kesahmu.",
    "Jangan merasa sendirian ya. Aku menghargai keberanianmu untuk bercerita. Tetaplah bernapas dengan tenang, aku di sini."
  ];
  return {
    text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    isEmergency: isEmergencyText(message)
  };
};

const isEmergencyText = (text: string) => {
  const lower = text.toLowerCase();
  return lower.includes('bunuh diri') || lower.includes('akhiri hidup') || lower.includes('menyakiti diri');
};

/**
 * Menghasilkan afirmasi harian menggunakan Gemini.
 */
export const getDailyAffirmation = async (): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Berikan satu kalimat afirmasi positif Bahasa Indonesia yang sangat singkat dan hangat. Tanpa tanda kutip.",
    });
    return response.text?.trim() || "Hari ini adalah langkah baru yang baik untukmu.";
  } catch {
    return "Kamu sudah melakukan yang terbaik hari ini.";
  }
};

/**
 * Menghasilkan audio TTS menggunakan gemini-2.5-flash-preview-tts.
 */
export const generateTTS = async (text: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

/**
 * Fungsi dekode base64 ke Uint8Array sesuai pedoman.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Fungsi dekode audio PCM raw sesuai pedoman Live API.
 */
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