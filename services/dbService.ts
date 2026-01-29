import { VentData, SupportMessage, ReflectionEntry, ChatSession } from "../types";

// Helper untuk LocalStorage
const STORAGE_KEYS = {
  VENTS: 'alxie_vents',
  REFLECTIONS: 'alxie_reflections',
  COMMUNITY: 'alxie_community',
  CHATS: 'alxie_chats',
  ADMIN_CONTACTS: 'alxie_admin_contacts'
};

const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
  // Trigger event untuk simulasi real-time antar komponen di tab yang sama
  window.dispatchEvent(new Event('storage_update'));
};

// --- SEED DATA ---
export const seedInitialData = async () => {
  const community = getLocal<SupportMessage[]>(STORAGE_KEYS.COMMUNITY, []);
  if (community.length === 0) {
    const seed: SupportMessage = {
      id: 'seed-1',
      sender: "ALXIE Bot",
      text: "Selamat datang! Kamu tidak sendirian. Kami di sini untuk mendengarkanmu.",
      created_at: new Date().toISOString(),
      emoji: "🚀",
      reactions: { "❤️": 1 }
    };
    setLocal(STORAGE_KEYS.COMMUNITY, [seed]);
  }
  return true;
};

// --- VENTING ---
export const saveVentData = async (data: any): Promise<boolean> => {
  try {
    const vents = getLocal<VentData[]>(STORAGE_KEYS.VENTS, []);
    const newVent: VentData = {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
      status: 'new'
    };
    setLocal(STORAGE_KEYS.VENTS, [newVent, ...vents]);
    return true;
  } catch (e) {
    return false;
  }
};

export const subscribeToVents = (callback: (data: VentData[]) => void) => {
  const update = () => callback(getLocal<VentData[]>(STORAGE_KEYS.VENTS, []));
  update();
  window.addEventListener('storage_update', update);
  return () => window.removeEventListener('storage_update', update);
};

// --- REFLECTION ---
export const saveReflection = async (entry: any) => {
  try {
    const reflections = getLocal<ReflectionEntry[]>(STORAGE_KEYS.REFLECTIONS, []);
    const newReflection: ReflectionEntry = {
      id: crypto.randomUUID(),
      ...entry,
      created_at: new Date().toISOString(),
      status: 'new'
    };
    setLocal(STORAGE_KEYS.REFLECTIONS, [newReflection, ...reflections]);
    return true;
  } catch (e) {
    return false;
  }
};

export const subscribeToReflections = (callback: (data: ReflectionEntry[]) => void) => {
  const update = () => callback(getLocal<ReflectionEntry[]>(STORAGE_KEYS.REFLECTIONS, []));
  update();
  window.addEventListener('storage_update', update);
  return () => window.removeEventListener('storage_update', update);
};

// --- ADMIN REPLY ---
export const updateAdminReply = async (type: 'vent' | 'reflection', id: string, replyText: string) => {
  const key = type === 'vent' ? STORAGE_KEYS.VENTS : STORAGE_KEYS.REFLECTIONS;
  const items = getLocal<any[]>(key, []);
  const index = items.findIndex(i => i.id === id);
  
  if (index !== -1) {
    items[index] = {
      ...items[index],
      admin_reply: replyText,
      admin_replied_at: new Date().toISOString(),
      status: 'replied'
    };
    setLocal(key, items);
    return true;
  }
  return false;
};

// --- CHAT SESSIONS ---
export const saveChatSession = async (session: ChatSession) => {
  const chats = getLocal<Record<string, ChatSession>>(STORAGE_KEYS.CHATS, {});
  // Fix: last_updated is now officially supported in ChatSession interface
  chats[session.id] = {
    ...session,
    last_updated: new Date().toISOString()
  };
  setLocal(STORAGE_KEYS.CHATS, chats);
};

export const subscribeToChatSession = (id: string, callback: (session: ChatSession | null) => void) => {
  const update = () => {
    const chats = getLocal<Record<string, ChatSession>>(STORAGE_KEYS.CHATS, {});
    callback(chats[id] || null);
  };
  update();
  window.addEventListener('storage_update', update);
  return () => window.removeEventListener('storage_update', update);
};

// Fungsi Baru: Subscribe ke semua chat untuk Admin
export const subscribeToAllChatSessions = (callback: (sessions: ChatSession[]) => void) => {
  const update = () => {
    const chats = getLocal<Record<string, ChatSession>>(STORAGE_KEYS.CHATS, {});
    // Removed redundant any casts as ChatSession now includes last_updated
    const sessionList = Object.values(chats).sort((a, b) => 
      new Date(b.last_updated || 0).getTime() - new Date(a.last_updated || 0).getTime()
    );
    callback(sessionList);
  };
  update();
  window.addEventListener('storage_update', update);
  return () => window.removeEventListener('storage_update', update);
};

// --- COMMUNITY ---
export const saveSupportMessage = async (msg: SupportMessage) => {
  try {
    const messages = getLocal<SupportMessage[]>(STORAGE_KEYS.COMMUNITY, []);
    setLocal(STORAGE_KEYS.COMMUNITY, [msg, ...messages]);
    return true;
  } catch (e) {
    return false;
  }
};

export const subscribeToCommunity = (callback: (data: SupportMessage[]) => void) => {
  const update = () => callback(getLocal<SupportMessage[]>(STORAGE_KEYS.COMMUNITY, []));
  update();
  window.addEventListener('storage_update', update);
  return () => window.removeEventListener('storage_update', update);
};

export const addReactionToMessage = async (messageId: string, emoji: string) => {
  const messages = getLocal<SupportMessage[]>(STORAGE_KEYS.COMMUNITY, []);
  const index = messages.findIndex(m => m.id === messageId);
  
  if (index !== -1) {
    const reactions = messages[index].reactions || {};
    reactions[emoji] = (reactions[emoji] || 0) + 1;
    messages[index].reactions = reactions;
    setLocal(STORAGE_KEYS.COMMUNITY, messages);
    return true;
  }
  return false;
};

export const trackAdminContact = async (adminName: string) => {
  const contacts = getLocal<any[]>(STORAGE_KEYS.ADMIN_CONTACTS, []);
  contacts.push({ adminName, timestamp: new Date().toISOString() });
  setLocal(STORAGE_KEYS.ADMIN_CONTACTS, contacts);
};