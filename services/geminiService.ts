
import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AIResponse } from "../types";

const SYSTEM_INSTRUCTION = `
Kamu adalah ALXIE, ruang aman dan dukungan emosional yang sangat hangat. 
Tugasmu adalah mendengarkan tanpa menghakimi. 
Gunakan Bahasa Indonesia yang santai, tulus, dan penuh empati (seperti sahabat karib).
Jika pengguna bercerita hal sensitif, tetap berikan dukungan hangat. 
JANGAN memberikan pesan peringatan teknis atau penolakan kaku.
`;

// getApiKey strictly uses process.env.API_KEY as per guidelines
export const getApiKey = () => {
  return process.env.API_KEY || "";
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Added getDailyAffirmation to fix error in Home.tsx
export const getDailyAffirmation = async (): Promise<string> => {
  if (!process.env.API_KEY) return "Kamu berharga dan luar biasa.";
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Berikan satu kalimat afirmasi positif singkat dalam Bahasa Indonesia yang menenangkan dan memotivasi untuk remaja yang sedang merasa lelah atau sedih. Jangan gunakan tanda kutip.",
    });
    return response.text?.trim() || "Kamu berharga dan luar biasa.";
  } catch (error) {
    console.error("Affirmation Error:", error);
    return "Kamu berharga dan luar biasa.";
  }
};

export const getAIResponse = async (userMessage: string, mood?: string, name?: string, retryCount = 0): Promise<AIResponse> => {
  if (!process.env.API_KEY) throw new Error("API_KEY_INVALID");

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Nama: ${name || 'Teman'}. Mood: ${mood || 'Butuh didengar'}. Cerita: ${userMessage}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
        safetySettings: safetySettings
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI_EMPTY");

    return { 
      text: text, 
      isEmergency: userMessage.toLowerCase().includes('bunuh diri') 
    };

  } catch (error: any) {
    console.error("ALXIE Debug:", error);
    
    // Handling for safety filter blocks
    if (error.message?.includes("SAFETY")) {
      return {
        text: "Terima kasih sudah mau berbagi cerita itu denganku. Kadang memang sulit untuk mengungkapkannya, tapi aku ingin kamu tahu bahwa aku tetap di sini, siap mendengarkan setiap helaan napasmu. Jangan sungkan untuk cerita hal lainnya ya...",
        isEmergency: false
      };
    }

    // Graceful retry logic for 429 errors
    if (error.message?.includes("429") && retryCount < 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return getAIResponse(userMessage, mood, name, retryCount + 1);
    }

    throw error;
  }
};

export const generateTTS = async (text: string): Promise<string | null> => {
  if (!process.env.API_KEY) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Bacakan dengan lembut: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (e) { return null; }
};

export function decodeBase64Audio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000, numChannels: number = 1): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
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
