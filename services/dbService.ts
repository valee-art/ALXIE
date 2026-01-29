import { VentData, SupportMessage, ReflectionEntry, ChatSession, ChatMessage } from "../types";

export const saveVentData = async (data: any): Promise<boolean> => {
  if (!data.consent) return false;
  const payload: VentData = { 
    ...data, 
    id: crypto.randomUUID(), 
    created_at: new Date().toISOString(),
    status: 'new'
  };
  try {
    const existing = JSON.parse(localStorage.getItem('alxie_vents') || '[]');
    existing.push(payload);
    localStorage.setItem('alxie_vents', JSON.stringify(existing));
    return true;
  } catch (e) { return false; }
};

export const saveReflection = (entry: any) => {
  try {
    const payload: ReflectionEntry = {
      ...entry,
      status: 'new'
    };
    const existing = JSON.parse(localStorage.getItem('alxie_reflections') || '[]');
    existing.push(payload);
    localStorage.setItem('alxie_reflections', JSON.stringify(existing));
  } catch (e) {}
};

export const getReflections = (): ReflectionEntry[] => {
  try {
    return JSON.parse(localStorage.getItem('alxie_reflections') || '[]');
  } catch (e) { return []; }
};

export const getVents = (): VentData[] => {
  try {
    return JSON.parse(localStorage.getItem('alxie_vents') || '[]');
  } catch (e) { return []; }
};

// Update Balasan Admin Manual
export const updateAdminReply = (type: 'vent' | 'reflection', id: string, replyText: string) => {
  const key = type === 'vent' ? 'alxie_vents' : 'alxie_reflections';
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const index = data.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      data[index].admin_reply = replyText;
      data[index].admin_replied_at = new Date().toISOString();
      data[index].status = 'replied';
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    }
    return false;
  } catch (e) { return false; }
};

export const saveChatSession = (session: ChatSession) => {
  try {
    const existing: Record<string, ChatSession> = JSON.parse(localStorage.getItem('alxie_chats') || '{}');
    existing[session.id] = session;
    localStorage.setItem('alxie_chats', JSON.stringify(existing));
  } catch (e) {}
};

export const getChatSession = (id: string): ChatSession | null => {
  try {
    const existing: Record<string, ChatSession> = JSON.parse(localStorage.getItem('alxie_chats') || '{}');
    return existing[id] || null;
  } catch (e) { return null; }
};

export const trackAdminContact = (adminName: string) => {
  try {
    const stats = JSON.parse(localStorage.getItem('alxie_admin_stats') || '{}');
    stats[adminName] = (stats[adminName] || 0) + 1;
    localStorage.setItem('alxie_admin_stats', JSON.stringify(stats));
  } catch (e) {}
};

export const getAdminStats = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem('alxie_admin_stats') || '{}'); }
  catch (e) { return {}; }
};

export const saveSupportMessage = (msg: SupportMessage) => {
  try {
    const existing = JSON.parse(localStorage.getItem('alxie_community') || '[]');
    existing.unshift(msg);
    localStorage.setItem('alxie_community', JSON.stringify(existing));
  } catch (e) {}
};

export const getSupportMessages = (): SupportMessage[] => {
  try { return JSON.parse(localStorage.getItem('alxie_community') || '[]'); }
  catch (e) { return []; }
};

// Fix: Added missing export for addReactionToMessage used in Community.tsx
export const addReactionToMessage = (messageId: string, emoji: string): boolean => {
  try {
    const existing: SupportMessage[] = JSON.parse(localStorage.getItem('alxie_community') || '[]');
    const index = existing.findIndex(m => m.id === messageId);
    if (index !== -1) {
      const msg = existing[index];
      if (!msg.reactions) msg.reactions = {};
      msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
      localStorage.setItem('alxie_community', JSON.stringify(existing));
      return true;
    }
    return false;
  } catch (e) { return false; }
};

// Fix: Added missing export for clearReflections imported in Reflection.tsx
export const clearReflections = () => {
  localStorage.removeItem('alxie_reflections');
};