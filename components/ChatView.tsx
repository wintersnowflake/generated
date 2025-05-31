import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage as Message, BotConfig, UserPersona, AppSettings } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { createChatSession, sendMessageStream, getNewChatSessionForRegeneration } from '../services/geminiService';
import { Chat } from '@google/genai';
import { ChevronLeftIcon, PencilIcon, PaintBrushIcon } from './icons';
import { DEFAULT_BOT_PLACEHOLDER_IMAGE, CHAT_BACKGROUND_OPTIONS } from '../constants';

interface ChatViewProps {
  bot: BotConfig;
  userPersona: UserPersona;
  appSettings: AppSettings;
  initialMessages: Message[];
  onMessagesUpdate: (botId: string, messages: Message[]) => void;
  onBackToList: () => void;
  onEditBot: (botId: string) => void;
  onChatBackgroundSettingChange: (settingKey: 'chatBackground' | 'customChatBackgroundImage', value: string | null) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ 
    bot, 
    userPersona, 
    appSettings,
    initialMessages, 
    onMessagesUpdate, 
    onBackToList, 
    onEditBot,
    onChatBackgroundSettingChange
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBgOptions, setShowBgOptions] = useState(false);
  const bgOptionsRef = useRef<HTMLDivElement>(null);

  const getEffectiveBackgroundClass = useCallback((): string => {
    if (appSettings.customChatBackgroundImage) {
      return 'chat-bg-image'; 
    }
    const selectedOption = CHAT_BACKGROUND_OPTIONS.find(opt => opt.key === appSettings.chatBackground);
    return selectedOption ? selectedOption.class : CHAT_BACKGROUND_OPTIONS[0].class;
  }, [appSettings.chatBackground, appSettings.customChatBackgroundImage]);

  const currentBgClass = getEffectiveBackgroundClass();
  const currentBgStyle = appSettings.customChatBackgroundImage 
    ? { backgroundImage: `url(${appSettings.customChatBackgroundImage})` } 
    : {};

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  },[]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  useEffect(() => {
    if (bot && userPersona) {
      try {
        const historyForSession = messages.filter(m => !m.isStreaming && m.text); 
        const session = createChatSession(bot, userPersona, historyForSession);
        setChatSession(session);
        setError(null);
      } catch (e: any) {
        console.error("Failed to create chat session:", e);
        setError(`Failed to initialize chat: ${e.message}. Ensure API key is valid.`);
      }
    }
  }, [bot, userPersona, messages]); // Re-create session if messages change (e.g. edit)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bgOptionsRef.current && !bgOptionsRef.current.contains(event.target as Node)) {
        setShowBgOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!chatSession || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };
    
    const placeholderBotMessage: Message = {
        id: `bot-placeholder-${Date.now()}`,
        sender: 'bot',
        text: '',
        timestamp: Date.now() + 1,
        isStreaming: true,
    };
    setMessages(prev => [...prev, userMessage, placeholderBotMessage]);

    setIsLoading(true);
    setError(null);

    const botMessageId = `msg-${Date.now() + 1}`; 
    let currentBotResponse = '';
    
    try {
      setMessages(prev => prev.map(m => m.id === placeholderBotMessage.id ? {...m, id: botMessageId} : m));

      const stream = await sendMessageStream(chatSession, text);
      for await (const chunk of stream) {
        currentBotResponse += chunk.text;
        setMessages(prev => prev.map(m => 
            m.id === botMessageId ? {...m, text: currentBotResponse, isStreaming: true} : m
        ));
      }
    } catch (e: any) {
      console.error("Error during streaming:", e);
      setError(`AI response error: ${e.message}`);
      currentBotResponse = "Sorry, I encountered an error."; 
    } finally {
      setIsLoading(false);
      const finalBotMsgText = currentBotResponse || "...";
      setMessages(prev => {
        const finalMessages = prev.map(m => 
            m.id === botMessageId ? {...m, text: finalBotMsgText, isStreaming: false, timestamp: Date.now()} : m
        ).filter(m => m.id !== placeholderBotMessage.id); 
        onMessagesUpdate(bot.id, finalMessages);
        return finalMessages;
      });
    }
  };

  const handleStarterPromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, text: newText } : msg
    );
    setMessages(updatedMessages);
    onMessagesUpdate(bot.id, updatedMessages);
  };

  const handleRegenerateMessage = async (botMessageIdToReplace: string) => {
    if (isLoading || !userPersona) return;
  
    let userMessageForPrompt: Message | null = null;
    const messageIndex = messages.findIndex(m => m.id === botMessageIdToReplace);
  
    if (messageIndex > 0 && messages[messageIndex - 1].sender === 'user') {
      userMessageForPrompt = messages[messageIndex - 1];
    }
  
    if (!userMessageForPrompt) {
      setError("Could not find the preceding user message to regenerate response.");
      return;
    }
  
    setIsLoading(true);
    setError(null);
    let currentBotResponse = '';
  
    setMessages(prev => prev.map(m => 
      m.id === botMessageIdToReplace ? {...m, text: '', isStreaming: true} : m
    ));
  
    try {
      const historyUpToUserMessage = messages.slice(0, messageIndex -1);
      const regenChatSession = getNewChatSessionForRegeneration(bot, userPersona, historyUpToUserMessage, userMessageForPrompt);
      
      const stream = await sendMessageStream(regenChatSession, userMessageForPrompt.text);
      for await (const chunk of stream) {
        currentBotResponse += chunk.text;
        setMessages(prev => prev.map(m => 
          m.id === botMessageIdToReplace ? {...m, text: currentBotResponse, isStreaming: true} : m
        ));
      }
    } catch (e: any) {
      console.error("Error during regeneration:", e);
      setError(`AI regeneration error: ${e.message}`);
      currentBotResponse = "Sorry, I couldn't regenerate that.";
    } finally {
      setIsLoading(false);
      const finalBotResponse = currentBotResponse || "...";
      const updatedMessages = messages.map(m => 
        m.id === botMessageIdToReplace ? {...m, text: finalBotResponse, isStreaming: false, timestamp: Date.now()} : m
      );
      setMessages(updatedMessages);
      onMessagesUpdate(bot.id, updatedMessages);
    }
  };

  if (!bot || !userPersona) {
    return <div className="p-4 text-center text-neutral-500">Select a bot and set up your persona to start chatting.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#161B22]"> {/* Main component bg */}
      <header className="bg-[#1C2128]/80 backdrop-blur-md p-3 shadow-md flex items-center justify-between z-10 border-b border-[#30363D]">
        <div className="flex items-center min-w-0">
          <button 
            onClick={onBackToList} 
            className="mr-2 p-2 text-neutral-400 hover:text-[var(--accent-color-400)] rounded-full hover:bg-neutral-700 transition-colors"
            aria-label="Back to bot list"
            title="Back to bot list"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <img src={bot.picture || DEFAULT_BOT_PLACEHOLDER_IMAGE} alt={bot.name} className="w-10 h-10 rounded-full mr-3 border-2 border-neutral-700 flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--accent-color-400)] truncate">{bot.name}</h2>
            <p className="text-xs text-neutral-500 truncate">{bot.description || "Roleplaying..."}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="relative" ref={bgOptionsRef}>
                <button 
                    onClick={() => setShowBgOptions(!showBgOptions)} 
                    className="p-2 text-neutral-400 hover:text-[var(--accent-color-400)] rounded-full hover:bg-neutral-700 transition-colors" 
                    title="Change Chat Background"
                    aria-label="Change Chat Background"
                >
                    <PaintBrushIcon className="w-5 h-5" />
                </button>
                {showBgOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-xl z-50 py-1 border border-neutral-700">
                    {CHAT_BACKGROUND_OPTIONS.map(opt => (
                        <button
                        key={opt.key}
                        onClick={() => { 
                            onChatBackgroundSettingChange('chatBackground', opt.key);
                            onChatBackgroundSettingChange('customChatBackgroundImage', null); 
                            setShowBgOptions(false); 
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm rounded-sm ${appSettings.chatBackground === opt.key && !appSettings.customChatBackgroundImage ? 'bg-[var(--accent-color-700)] text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
                        >
                        {opt.name}
                        </button>
                    ))}
                    </div>
                )}
            </div>
            <button 
              onClick={() => onEditBot(bot.id)} 
              className="p-2 text-neutral-400 hover:text-[var(--accent-color-400)] rounded-full hover:bg-neutral-700 transition-colors" 
              title="Edit Bot Details"
              aria-label="Edit Bot Details"
            >
            <PencilIcon className="w-5 h-5" />
            </button>
        </div>
      </header>

      {error && <div className="p-3 bg-red-800 text-red-200 text-sm text-center border-b border-red-700">{error}</div>}
      
      <div 
        className={`flex-grow overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50 ${currentBgClass}`}
        style={currentBgStyle}
        id="chat-area"
      >
        {messages.length === 0 && !isLoading && bot.starterPrompts && bot.starterPrompts.length > 0 && (
          <div className="my-4 p-3 rounded-lg">
            <p className="text-sm text-neutral-400 mb-2 text-center">Try a starter prompt:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {bot.starterPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterPromptClick(prompt)}
                  className="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-full transition-colors shadow"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.length === 0 && !isLoading && (!bot.starterPrompts || bot.starterPrompts.length === 0) && (
          <div className="text-center text-neutral-500 pt-10">
            Start the conversation with {bot.name}!
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            userPicture={userPersona.picture}
            botPicture={bot.picture}
            onEditMessage={handleEditMessage}
            onRegenerateMessage={handleRegenerateMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isSending={isLoading} />
    </div>
  );
};

export default ChatView;
