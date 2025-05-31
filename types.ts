import { Chat } from "@google/genai";

export interface UserPersona {
  id: string;
  name: string;
  description: string;
  picture: string | null; // base64 string
}

export interface BotConfig {
  id: string;
  name: string;
  picture: string | null; // base64 string
  description: string;
  background: string;
  personalityTraits: string; // comma-separated or newline-separated
  starterPrompts?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  image?: string | null; // base64 string for user messages with images (future use)
}

export type AppView = 
  | 'botList' 
  | 'botEditor' 
  | 'chatView' 
  | 'personaEditor'
  | 'historyModal'
  | 'settingsModal';

export interface ChatSession {
  chat: Chat;
  botId: string;
}

// Updated AccentColor type to reflect new color names/keys
export type AccentColorKey = 'indigo' | 'lime' | 'crimson' | 'azure';
export type FontSize = 'sm' | 'base' | 'lg';

export interface AppSettings {
  accentColor: AccentColorKey;
  fontSize: FontSize;
  chatBackground: string; // Can be a color key like 'default' or a base64 image string
  customChatBackgroundImage: string | null; // Stores base64 of user uploaded image
}

export type SpeechRecognitionStatus = 'idle' | 'listening' | 'error' | 'denied' | 'nosupport';
