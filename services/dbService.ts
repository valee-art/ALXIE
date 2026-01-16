
import { VentData } from "../types";

/**
 * In a real scenario, you would use:
 * const { data, error } = await supabase.from('vents').insert([payload])
 * or Firebase Firestore:
 * await addDoc(collection(db, "vents"), payload)
 */

export const saveVentData = async (data: VentData): Promise<boolean> => {
  if (!data.consent) {
    console.warn("Data not saved: Consent not given.");
    return false;
  }

  // Simulating database storage
  const payload = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString()
  };

  console.log("Saving to Database (Simulated):", payload);
  
  // For demonstration, we'll use LocalStorage as a pseudo-database
  try {
    const existing = JSON.parse(localStorage.getItem('alxie_vents') || '[]');
    existing.push(payload);
    localStorage.setItem('alxie_vents', JSON.stringify(existing));
    return true;
  } catch (e) {
    console.error("Storage error", e);
    return false;
  }
};
