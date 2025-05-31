import { AccentColorKey, AppSettings, FontSize } from "./types";

export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";
export const IMAGE_GENERATION_MODEL_NAME = "imagen-3.0-generate-002";
export const MAX_CHAT_HISTORY_LENGTH = 50; // Max messages to keep in history for context
export const MAX_CHAT_HISTORY_ITEMS_DISPLAYED = 20; // Max items to show in history modal
export const MAX_STARTER_PROMPTS = 3;


export const LOCAL_STORAGE_USER_PERSONA_KEY = 'aiRoleplay_userPersona_v2'; // Incremented version due to theme changes
export const LOCAL_STORAGE_BOTS_KEY = 'aiRoleplay_bots_v2'; // Incremented for starterPrompts
export const LOCAL_STORAGE_CHAT_HISTORIES_KEY = 'aiRoleplay_chatHistories_v2';
export const LOCAL_STORAGE_APP_SETTINGS_KEY = 'aiRoleplay_appSettings_v2';


export const DEFAULT_BOT_PLACEHOLDER_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%27200%27%20height%3D%27200%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Crect%20width%3D%27200%27%20height%3D%27200%27%20fill%3D%27%2330363D%27%2F%3E%3Ctext%20x%3D%2750%25%27%20y%3D%2750%25%27%20font-family%3D%27sans-serif%27%20font-size%3D%2720%27%20fill%3D%27%23C9D1D9%27%20dominant-baseline%3D%27middle%27%20text-anchor%3D%27middle%27%3EBot%3C%2Ftext%3E%3C%2Fsvg%3E";
export const DEFAULT_USER_PLACEHOLDER_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%27200%27%20height%3D%27200%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Crect%20width%3D%27200%27%20height%3D%27200%27%20fill%3D%27%2330363D%27%2F%3E%3Ctext%20x%3D%2750%25%27%20y%3D%2750%25%27%20font-family%3D%27sans-serif%27%20font-size%3D%2720%27%20fill%3D%27%23C9D1D9%27%20dominant-baseline%3D%27middle%27%20text-anchor%3D%27middle%27%3EUser%3C%2Ftext%3E%3C%2Fsvg%3E";


export const ACCENT_COLORS: { key: AccentColorKey, name: string, baseColorClass: string, cssVars: Record<string, string> }[] = [
  { 
    key: 'indigo', name: 'Electric Indigo', baseColorClass: 'bg-indigo-500', // Tailwind's indigo-500
    cssVars: {
      '--accent-color-50': '#eef2ff', '--accent-color-100': '#e0e7ff', '--accent-color-200': '#c7d2fe',
      '--accent-color-300': '#a5b4fc', '--accent-color-400': '#818cf8', '--accent-color-500': '#6366f1',
      '--accent-color-600': '#4f46e5', '--accent-color-700': '#4338ca', '--accent-color-800': '#3730a3',
      '--accent-color-900': '#312e81', '--accent-color-950': '#1e1b4b',
    }
  },
  { 
    key: 'lime', name: 'Cyber Lime', baseColorClass: 'bg-lime-500',
    cssVars: {
      '--accent-color-50': '#f7fee7', '--accent-color-100': '#ecfccb', '--accent-color-200': '#d9f99d',
      '--accent-color-300': '#bef264', '--accent-color-400': '#a3e635', '--accent-color-500': '#84cc16',
      '--accent-color-600': '#65a30d', '--accent-color-700': '#4d7c0f', '--accent-color-800': '#3f6212',
      '--accent-color-900': '#365314', '--accent-color-950': '#1a2e05',
    }
  },
  { 
    key: 'crimson', name: 'Crimson Red', baseColorClass: 'bg-red-600', // Tailwind's red-600
    cssVars: {
      '--accent-color-50': '#fff1f2', '--accent-color-100': '#ffe4e6', '--accent-color-200': '#fecdd3',
      '--accent-color-300': '#fda4af', '--accent-color-400': '#fb7185', '--accent-color-500': '#f43f5e',
      '--accent-color-600': '#e11d48', '--accent-color-700': '#be123c', '--accent-color-800': '#9f1239',
      '--accent-color-900': '#881337', '--accent-color-950': '#4c0519',
    }
  },
   { 
    key: 'azure', name: 'Azure Blue', baseColorClass: 'bg-sky-500', // Tailwind's sky-500
    cssVars: { // Re-using Sky for Azure, adjusted if needed
      '--accent-color-50': '#eff6ff', '--accent-color-100': '#dbeafe', '--accent-color-200': '#bfdbfe',
      '--accent-color-300': '#93c5fd', '--accent-color-400': '#60a5fa', '--accent-color-500': '#3b82f6',
      '--accent-color-600': '#2563eb', '--accent-color-700': '#1d4ed8', '--accent-color-800': '#1e40af',
      '--accent-color-900': '#1e3a8a', '--accent-color-950': '#172554',
    }
  },
];

export const FONT_SIZES: { key: FontSize, name: string, className: string }[] = [
  { key: 'sm', name: 'Small', className: 'font-size-sm' },
  { key: 'base', name: 'Medium', className: 'font-size-base' },
  { key: 'lg', name: 'Large', className: 'font-size-lg' },
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  accentColor: 'indigo', // New default accent
  fontSize: 'base',
  chatBackground: 'deep_space', // New default dark background
  customChatBackgroundImage: null,
};

export const CHAT_BACKGROUND_OPTIONS = [
  { key: 'deep_space', name: 'Deep Space', class: 'bg-[#010409]' }, // Very dark
  { key: 'inkwell', name: 'Inkwell', class: 'bg-[#101014]' }, 
  { key: 'charcoal_night', name: 'Charcoal Night', class: 'bg-[#161B22]' }, // Main component bg
  { key: 'pure_black', name: 'Pure Black', class: 'bg-black' },
];
