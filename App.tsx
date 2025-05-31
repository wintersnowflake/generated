
import React, { useState, useEffect, useCallback } from 'react';
import { UserPersona, BotConfig, ChatMessage, AppView, AppSettings } from './types';
import { 
  LOCAL_STORAGE_USER_PERSONA_KEY, 
  LOCAL_STORAGE_BOTS_KEY, 
  LOCAL_STORAGE_CHAT_HISTORIES_KEY,
  LOCAL_STORAGE_APP_SETTINGS_KEY,
  DEFAULT_APP_SETTINGS,
  ACCENT_COLORS, FONT_SIZES
} from './constants';
import UserPersonaEditor from './components/UserPersonaEditor';
import BotEditor from './components/BotEditor';
import BotCard from './components/BotCard';
import ChatView from './components/ChatView';
import Modal from './components/Modal';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';
import { PlusIcon, UserCircleIcon, SparklesIcon, SingleSpeechBubbleIcon, SearchIcon, HistoryIcon, SettingsIcon } from './components/icons';

const App: React.FC = () => {
  const [userPersona, setUserPersona] = useState<UserPersona | null>(null);
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [activeBotId, setActiveBotId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('botList');
  
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isBotEditorModalOpen, setIsBotEditorModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [editingBot, setEditingBot] = useState<BotConfig | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const storedPersona = localStorage.getItem(LOCAL_STORAGE_USER_PERSONA_KEY);
    if (storedPersona) setUserPersona(JSON.parse(storedPersona));
    else setIsPersonaModalOpen(true); 

    const storedBots = localStorage.getItem(LOCAL_STORAGE_BOTS_KEY);
    if (storedBots) setBots(JSON.parse(storedBots));
    
    const storedChatHistories = localStorage.getItem(LOCAL_STORAGE_CHAT_HISTORIES_KEY);
    if (storedChatHistories) setChatHistories(JSON.parse(storedChatHistories));

    const storedSettings = localStorage.getItem(LOCAL_STORAGE_APP_SETTINGS_KEY);
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        // Ensure parsedSettings is an object and not an array before proceeding
        if (parsedSettings && typeof parsedSettings === 'object' && !Array.isArray(parsedSettings)) {
            const currentDefaultKeys = Object.keys(DEFAULT_APP_SETTINGS) as (keyof AppSettings)[];
            
            const validParsedSettings = currentDefaultKeys.reduce<Partial<AppSettings>>((acc, key) => {
                if (Object.prototype.hasOwnProperty.call(parsedSettings, key)) {
                    (acc as any)[key] = parsedSettings[key];
                }
                return acc;
            }, {});
            setAppSettings(prev => ({ ...DEFAULT_APP_SETTINGS, ...prev, ...validParsedSettings }));
        } else {
          setAppSettings(DEFAULT_APP_SETTINGS); // Fallback if parsedSettings is not a valid object
        }
      } catch (e) {
        console.error("Error parsing app settings from localStorage:", e);
        // Fallback to default settings if parsing fails or data is malformed
        setAppSettings(DEFAULT_APP_SETTINGS);
      }
    }
  }, []);

  // Apply settings (theme, font)
  useEffect(() => {
    // Accent Color
    const selectedAccent = ACCENT_COLORS.find(ac => ac.key === appSettings.accentColor) || ACCENT_COLORS[0];
    Object.entries(selectedAccent.cssVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Font Size
    const selectedFont = FONT_SIZES.find(fs => fs.key === appSettings.fontSize) || FONT_SIZES[1];
    document.documentElement.className = selectedFont.className; 

    localStorage.setItem(LOCAL_STORAGE_APP_SETTINGS_KEY, JSON.stringify(appSettings));
  }, [appSettings]);


  // Save persona, bots, chat histories
  useEffect(() => {
    if (userPersona) localStorage.setItem(LOCAL_STORAGE_USER_PERSONA_KEY, JSON.stringify(userPersona));
  }, [userPersona]);
  useEffect(() => localStorage.setItem(LOCAL_STORAGE_BOTS_KEY, JSON.stringify(bots)), [bots]);
  useEffect(() => localStorage.setItem(LOCAL_STORAGE_CHAT_HISTORIES_KEY, JSON.stringify(chatHistories)), [chatHistories]);


  const handleSavePersona = (persona: UserPersona) => {
    setUserPersona(persona);
    setIsPersonaModalOpen(false);
  };

  const handleSaveBot = (bot: BotConfig) => {
    setBots(prevBots => {
      const index = prevBots.findIndex(b => b.id === bot.id);
      if (index > -1) return prevBots.map(b => b.id === bot.id ? bot : b);
      return [...prevBots, bot];
    });
    setIsBotEditorModalOpen(false);
    setEditingBot(null);
  };

  const handleDeleteBot = (botId: string) => {
    if (window.confirm("Are you sure you want to delete this bot and its chat history?")) {
      setBots(prevBots => prevBots.filter(b => b.id !== botId));
      setChatHistories(prevHistories => {
        const newHistories = {...prevHistories};
        delete newHistories[botId];
        return newHistories;
      });
      if (activeBotId === botId) {
        setActiveBotId(null);
        setCurrentView('botList');
      }
    }
  };
  
  const handleUpdateAppSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => ({...prev, ...newSettings}));
  };

  const handleChatBackgroundSettingChange = (
    settingKey: 'chatBackground' | 'customChatBackgroundImage', 
    value: string | null
  ) => {
    setAppSettings(prev => ({ ...prev, [settingKey]: value }));
  };


  const openBotEditorForNew = () => {
    if (!userPersona) { setIsPersonaModalOpen(true); alert("Please set up your persona first."); return; }
    setEditingBot(null); setIsBotEditorModalOpen(true);
  };
  
  const openBotEditorForEdit = (botId: string) => {
    const botToEdit = bots.find(b => b.id === botId);
    if (botToEdit) { setEditingBot(botToEdit); setIsBotEditorModalOpen(true); }
  };
  
  const handleSelectBotToChat = (botId: string) => {
    if (!userPersona) { setIsPersonaModalOpen(true); alert("Please set up your persona first."); return; }
    setActiveBotId(botId);
    setCurrentView('chatView');
    setIsHistoryModalOpen(false); 
  };

  const handleUpdateChatHistory = useCallback((botId: string, messages: ChatMessage[]) => {
    setChatHistories(prev => ({ ...prev, [botId]: messages }));
  }, []);

  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bot.description && bot.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const activeBotConfig = bots.find(b => b.id === activeBotId);

  const renderView = () => {
    if (!userPersona && !isPersonaModalOpen && currentView !== 'personaEditor') { 
        return <div className="p-8 text-center text-neutral-500">Loading persona... If this persists, try setting your persona via the icon in the header.</div>;
    }

    switch (currentView) {
      case 'chatView':
        if (activeBotConfig && userPersona) {
          return (
            <ChatView
              bot={activeBotConfig}
              userPersona={userPersona}
              appSettings={appSettings}
              initialMessages={chatHistories[activeBotConfig.id] || []}
              onMessagesUpdate={handleUpdateChatHistory}
              onBackToList={() => { setCurrentView('botList'); setActiveBotId(null); }}
              onEditBot={() => openBotEditorForEdit(activeBotConfig.id)}
              onChatBackgroundSettingChange={handleChatBackgroundSettingChange}
            />
          );
        }
        setCurrentView('botList'); 
        return null; 
      case 'botList':
      default:
        return (
          <div className="p-4 md:p-6 lg:p-8">
            {bots.length === 0 && !searchTerm && (
              <div className="text-center py-12 md:py-16">
                <SparklesIcon className="w-16 h-16 text-[var(--accent-color-500)] mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-neutral-200 mb-2">No Bots Yet!</h2>
                <p className="text-neutral-400 mb-6">Create your first AI roleplaying bot to start chatting.</p>
                <button
                  onClick={openBotEditorForNew}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-[var(--accent-color-600)] hover:bg-[var(--accent-color-500)] rounded-lg shadow-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1117] focus:ring-[var(--accent-color-500)]"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create New Bot
                </button>
              </div>
            )}
            {bots.length > 0 && filteredBots.length === 0 && searchTerm && (
                 <div className="text-center py-12 md:py-16">
                    <SearchIcon className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-neutral-300 mb-2">No Bots Found</h2>
                    <p className="text-neutral-400">Try a different search term.</p>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredBots.map(bot => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  onSelect={handleSelectBotToChat}
                  onEdit={openBotEditorForEdit}
                  onDelete={handleDeleteBot}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  // Calculate header height based on currentView and window width for main content height adjustment
  const isMobileSize = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const effectiveHeaderHeight = (currentView === 'botList' && isMobileSize) ? 108 : 60; // Use numbers for calculation
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0D1117] text-neutral-200"> {/* Main background to near black */}
      <header className="bg-[#161B22]/80 backdrop-blur-md shadow-lg sticky top-0 z-20 border-b border-[#30363D]"> {/* Header charcoal, border dark gray */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-xl font-bold text-[var(--accent-color-400)]">
              <SingleSpeechBubbleIcon className="w-8 h-8" />
              <h1 className="hidden sm:block">AI Roleplay Bots</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              {currentView === 'botList' && (
                <div className="relative">
                  <input 
                    type="search"
                    placeholder="Search bots..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="hidden md:block w-48 lg:w-64 p-2 pl-8 text-sm bg-neutral-800 text-neutral-300 placeholder-neutral-500 rounded-md focus:ring-1 focus:ring-[var(--accent-color-500)] focus:bg-neutral-700 border border-neutral-700"
                  />
                   <SearchIcon className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"/>
                </div>
              )}
               <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="p-2 text-neutral-400 hover:text-[var(--accent-color-400)] rounded-full hover:bg-neutral-700 transition-colors"
                title="Chat History" aria-label="Chat History"
              >
                <HistoryIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 text-neutral-400 hover:text-[var(--accent-color-400)] rounded-full hover:bg-neutral-700 transition-colors"
                title="Settings" aria-label="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPersonaModalOpen(true)}
                className="flex items-center space-x-2 text-neutral-400 hover:text-[var(--accent-color-400)] transition-colors p-1 pr-2 rounded-md hover:bg-neutral-700"
                title="Edit Your Persona" aria-label="Edit Your Persona"
              >
                {userPersona?.picture ? (
                  <img src={userPersona.picture} alt="User Persona" className="w-7 h-7 rounded-full border-2 border-neutral-700" />
                ) : (
                  <UserCircleIcon className="w-7 h-7" />
                )}
                <span className="hidden lg:inline text-sm">{userPersona?.name || "Set Persona"}</span>
              </button>
            </div>
          </div>
           {currentView === 'botList' && (
             <div className="mt-3 md:hidden"> 
                <div className="relative">
                  <input 
                    type="search"
                    placeholder="Search bots..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-8 text-sm bg-neutral-800 text-neutral-300 placeholder-neutral-500 rounded-md focus:ring-1 focus:ring-[var(--accent-color-500)] focus:bg-neutral-700 border border-neutral-700"
                  />
                   <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"/>
                </div>
            </div>
           )}
        </div>
      </header>

      <main 
        className="flex-grow overflow-auto" 
        style={{ height: currentView === 'chatView' ? `calc(100vh - ${effectiveHeaderHeight}px)` : 'auto' }}
      >
       {currentView === 'botList' && (
          <button
            onClick={openBotEditorForNew}
            className="sm:hidden fixed bottom-6 right-6 bg-[var(--accent-color-600)] hover:bg-[var(--accent-color-500)] text-white p-4 rounded-full shadow-xl z-30 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1117] focus:ring-[var(--accent-color-500)]"
            title="Create New Bot" aria-label="Create New Bot"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        )}
        {renderView()}
      </main>
      
      <footer className="p-3 text-center text-xs text-neutral-600 border-t border-[#30363D] bg-[#161B22]">
        This bot is not real and is entirely fictional, anything it says is not real and should not be relied on under any circumstances.
      </footer>


      <Modal
        isOpen={isPersonaModalOpen}
        onClose={() => { if (userPersona) setIsPersonaModalOpen(false); else alert("Please set up your persona."); }}
        title={userPersona ? "Edit Your Persona" : "Create Your Persona"}
      >
        <UserPersonaEditor persona={userPersona} onSave={handleSavePersona} onClose={() => {if (userPersona) setIsPersonaModalOpen(false); else alert("Persona setup is required.");}} />
      </Modal>

      <Modal
        isOpen={isBotEditorModalOpen}
        onClose={() => { setIsBotEditorModalOpen(false); setEditingBot(null);}}
        title={editingBot ? "Edit Bot" : "Create New Bot"}
        size="lg"
      >
        <BotEditor bot={editingBot} onSave={handleSaveBot} onClose={() => { setIsBotEditorModalOpen(false); setEditingBot(null);}} />
      </Modal>

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        chatHistories={chatHistories}
        bots={bots}
        onSelectChat={handleSelectBotToChat}
        onDeleteHistory={(botId) => {
          if (window.confirm("Delete this chat history? The bot will remain.")) {
            setChatHistories(prev => {
              const updated = { ...prev };
              delete updated[botId];
              return updated;
            });
          }
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentSettings={appSettings}
        onSettingsChange={handleUpdateAppSettings}
      />
    </div>
  );
};

export default App;
