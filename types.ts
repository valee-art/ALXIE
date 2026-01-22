export interface VentData {
  id?: string;
  alias?: string;
  panggilan?: string;
  kontak?: string;
  pesan: string;
  mood?: string;
  consent: boolean;
  scheduled_at?: string;
  created_at?: string;
  ai_response?: string;
  model_used?: string;
}

export interface SupportMessage {
  id: string;
  sender: string;
  text: string;
  created_at: string;
  emoji: string;
  reactions?: Record<string, number>;
}

export interface AIResponse {
  text: string;
  isEmergency: boolean;
}

export enum Page {
  Home = 'home',
  Venting = 'venting',
  Journal = 'journal',
  Community = 'community',
  Contact = 'contact',
  Disclaimer = 'disclaimer'
}