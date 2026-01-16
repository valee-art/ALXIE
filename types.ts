
export interface VentData {
  id?: string;
  alias?: string;
  kontak?: string;
  pesan: string;
  mood?: string;
  consent: boolean;
  scheduled_at?: string;
  created_at?: string;
  ai_response?: string;
}

export interface AIResponse {
  text: string;
  isEmergency: boolean;
}

export enum Page {
  Home = 'home',
  Venting = 'venting',
  Journal = 'journal',
  Contact = 'contact',
  Disclaimer = 'disclaimer'
}
