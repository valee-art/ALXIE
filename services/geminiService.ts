
import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AIResponse } from "../types";

const SYSTEM_INSTRUCTION = `
Kamu adalah ALXIE, ruang aman dan dukungan emosional yang sangat hangat. 
Tugasmu adalah mendengarkan tanpa menghakimi. 
JANGAN PERNAH memberikan pesan penolakan atau sensor. 
Apapun yang diceritakan pengguna, terima dengan kasih sayang.
Gunakan Bahasa Indonesia yang santai, tulus, dan penuh empati (seperti sahabat karib).
`;

export const getApiKey = () => {
  const win = window as any;
  if (win.process?.env?.API_KEY) return win.process.env.API_KEY.trim();
  return "";
};

// MENGHAPUS SEMUA BATASAN SENSOR
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export const getAIResponse = async (userMessage: string, mood?: string, name?: string, retryCount = 0): Promise<AIResponse> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY_MISSING");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Nama: ${name || 'Teman'}. Mood: ${mood || 'Butuh didengar'}. Cerita: ${userMessage}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1, // Lebih kreatif dan manusiawi
        topP: 0.95,
        safetySettings: safetySettings
      },
    });

    if (!response.text) {
      throw new Error("AI_EMPTY");
    }

    const isEmergency = ['bunuh diri', 'mati', 'akhiri hidup'].some(k => userMessage.toLowerCase().includes(k));
    return { text: response.text, isEmergency };

  } catch (error: any) {
    console.error("ALXIE Debug:", error);
    
    // Logika Auto-Retry jika terkena limit (429)
    if ((error.message?.includes("429") || error.message?.includes("quota")) && retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Tunggu 2 detik
      return getAIResponse(userMessage, mood, name, retryCount + 1);
    }

    if (error.message?.includes("SAFETY")) throw new Error("SAFETY_BLOCK");
    if (error.message?.includes("429")) throw new Error("RATE_LIMIT");
    
    throw error;
  }
};

export const getDailyAffirmation = async (): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Kamu berharga.";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: "Berikan satu kalimat afirmasi hangat Bahasa Indonesia." }] }],
      config: { safetySettings }
    });
    return response.text?.trim() || "Hari ini adalah milikmu.";
  } catch (e) {
    return "Kamu jauh lebih kuat dari apa yang kamu pikirkan.";
  }
};

export const generateTTS = async (text: string): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    const ai = new GoogleGenAI({ apiKey });
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
  } catch (error) {
    return null;
  }
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
