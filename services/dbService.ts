
import { VentData, SupportMessage } from "../types";

export const saveVentData = async (data: VentData): Promise<boolean> => {
  if (!data.consent) return false;
  const payload = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  try {
    const existing = JSON.parse(localStorage.getItem('alxie_vents') || '[]');
    existing.push(payload);
    localStorage.setItem('alxie_vents', JSON.stringify(existing));
    return true;
  } catch (e) { return false; }
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

// Fitur Komunitas
export const saveSupportMessage = (msg: SupportMessage) => {
  try {
    const existing = JSON.parse(localStorage.getItem('alxie_community') || '[]');
    const payload = { ...msg, reactions: msg.reactions || {} };
    existing.unshift(payload);
    // Batasan slice(0, 50) dihapus agar pesan tidak terbatas
    localStorage.setItem('alxie_community', JSON.stringify(existing));
  } catch (e) {}
};

export const getSupportMessages = (): SupportMessage[] => {
  try { 
    const data = JSON.parse(localStorage.getItem('alxie_community') || '[]');
    // Pastikan field reactions ada
    return data.map((m: any) => ({ ...m, reactions: m.reactions || {} }));
  }
  catch (e) { return []; }
};

export const addReactionToMessage = (messageId: string, emoji: string) => {
  try {
    const existing = getSupportMessages();
    const index = existing.findIndex(m => m.id === messageId);
    if (index !== -1) {
      const reactions = existing[index].reactions || {};
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      existing[index].reactions = reactions;
      localStorage.setItem('alxie_community', JSON.stringify(existing));
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};
