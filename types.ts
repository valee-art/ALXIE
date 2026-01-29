export interface VentData {
  id: string;
  alias?: string;
  panggilan?: string;
  kontak?: string;
  pesan: string;
  mood?: string;
  consent: boolean;
  scheduled_at?: string;
  created_at: string;
  ai_response?: string;
  admin_reply?: string;
  admin_replied_at?: string;
  status: 'new' | 'read' | 'replied';
}

export interface ReflectionEntry {
  id: string;
  emotion: string;
  emoji: string;
  answers: {
    trigger: string;
    lastTime: string;
    coping: string;
  };
  created_at: string;
  admin_reply?: string;
  admin_replied_at?: string;
  status: 'new' | 'read' | 'replied';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'admin';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  adminName: string;
  adminIcon: string;
  messages: ChatMessage[];
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
  Reflection = 'reflection',
  Journal = 'journal',
  Community = 'community',
  AdminChat = 'admin_chat',
  AdminDashboard = 'admin_dashboard',
  Contact = 'contact',
  Disclaimer = 'disclaimer'
}