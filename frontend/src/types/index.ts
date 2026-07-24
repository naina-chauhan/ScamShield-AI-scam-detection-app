export interface User {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ScanResult {
  status: 'scam' | 'warning' | 'safe';
  confidence: number;
  explanation: string;
  suspicious_words: string[];
  scam_category: string;
}

export interface ScanHistory {
  id: string;
  scan_type: string;
  input_text: string;
  status: string;
  confidence: number;
  explanation: string;
  scam_category: string;
  suspicious_words: string[];
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ScanType = 'text' | 'url' | 'email';
