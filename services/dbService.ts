
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc,
  serverTimestamp,
  setDoc,
  getDoc,
  getDocs
} from "firebase/firestore";
import { VentData, SupportMessage, ReflectionEntry, ChatSession } from "../types";

// Konfigurasi Firebase ALXIE milik Anda
const firebaseConfig = {
  apiKey: "AIzaSyDRO6ddNka5Qmh76GrtdZv-pWcsQtk1EfQ",
  authDomain: "alxie-9e94c.firebaseapp.com",
  projectId: "alxie-9e94c",
  storageBucket: "alxie-9e94c.firebasestorage.app",
  messagingSenderId: "48310248319",
  appId: "1:48310248319:web:fc8954759eaa9f2f18304a",
  measurementId: "G-QWFLGHPT0L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- VENTING (CURHATAN) ---
export const saveVentData = async (data: any): Promise<boolean> => {
  if (!data.consent) return false;
  try {
    await addDoc(collection(db, "vents"), {
      ...data,
      created_at: new Date().toISOString(),
      server_timestamp: serverTimestamp(),
      status: 'new'
    });
    return true;
  } catch (e) { 
    console.error("Firebase Error:", e);
    return false; 
  }
};

export const subscribeToVents = (callback: (data: VentData[]) => void) => {
  const q = query(collection(db, "vents"), orderBy("server_timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const vents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VentData));
    callback(vents);
  });
};

// --- REFLECTION (REFLEKSI) ---
export const saveReflection = async (entry: any) => {
  try {
    await addDoc(collection(db, "reflections"), {
      ...entry,
      server_timestamp: serverTimestamp(),
      status: 'new'
    });
  } catch (e) {
    console.error("Firebase Reflection Error:", e);
  }
};

export const subscribeToReflections = (callback: (data: ReflectionEntry[]) => void) => {
  const q = query(collection(db, "reflections"), orderBy("server_timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const reflections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReflectionEntry));
    callback(reflections);
  });
};

// --- ADMIN REPLY ---
export const updateAdminReply = async (type: 'vent' | 'reflection', id: string, replyText: string) => {
  const collectionName = type === 'vent' ? 'vents' : 'reflections';
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      admin_reply: replyText,
      admin_replied_at: new Date().toISOString(),
      status: 'replied'
    });
    return true;
  } catch (e) { 
    console.error("Update Admin Reply Error:", e);
    return false; 
  }
};

// --- CHAT SESSIONS (RELAWAN) ---
export const saveChatSession = async (session: ChatSession) => {
  try {
    await setDoc(doc(db, "chats", session.id), {
      ...session,
      updated_at: serverTimestamp()
    });
  } catch (e) {}
};

export const subscribeToChatSession = (id: string, callback: (session: ChatSession | null) => void) => {
  return onSnapshot(doc(db, "chats", id), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as ChatSession);
    } else {
      callback(null);
    }
  });
};

export const getChatSession = async (id: string): Promise<ChatSession | null> => {
  try {
    const docRef = doc(db, "chats", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as ChatSession;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// --- COMMUNITY (PAPAN HARAPAN) ---
export const saveSupportMessage = async (msg: SupportMessage) => {
  try {
    await addDoc(collection(db, "community"), {
      ...msg,
      server_timestamp: serverTimestamp()
    });
  } catch (e) {}
};

export const subscribeToCommunity = (callback: (data: SupportMessage[]) => void) => {
  const q = query(collection(db, "community"), orderBy("server_timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportMessage));
    callback(msgs);
  });
};

export const getSupportMessages = async (): Promise<SupportMessage[]> => {
  try {
    const q = query(collection(db, "community"), orderBy("server_timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportMessage));
  } catch (e) {
    return [];
  }
};

export const addReactionToMessage = async (messageId: string, emoji: string) => {
  try {
    const docRef = doc(db, "community", messageId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const reactions = snap.data().reactions || {};
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      await updateDoc(docRef, { reactions });
      return true;
    }
    return false;
  } catch (e) { return false; }
};

// --- ADMIN TRACKING & STATS ---
export const trackAdminContact = async (adminName: string) => {
  try {
    await addDoc(collection(db, "admin_contacts"), {
      adminName,
      timestamp: serverTimestamp()
    });
  } catch (e) {}
};

export const getAdminStats = async () => {
  return { vents: 0, reflections: 0 };
};

// Fungsi fallback untuk kompatibilitas
export const getVents = () => [];
export const getReflections = () => [];
export const clearReflections = () => {};
