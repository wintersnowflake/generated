import React, { useState, useEffect } from 'react';
import { BotConfig } from '../types';
import ImageUpload from './ImageUpload';
import { DEFAULT_BOT_PLACEHOLDER_IMAGE, MAX_STARTER_PROMPTS } from '../constants';
import { PlusIcon, TrashIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface BotEditorProps {
  bot: BotConfig | null; // null for creating a new bot
  onSave: (bot: BotConfig) => void;
  onClose: () => void;
}

const BotEditor: React.FC<BotEditorProps> = ({ bot, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [picture, setPicture] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState('');
  const [personalityTraits, setPersonalityTraits] = useState('');
  const [starterPrompts, setStarterPrompts] = useState<string[]>(['']);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);


  useEffect(() => {
    if (bot) {
      setName(bot.name);
      setPicture(bot.picture);
      setDescription(bot.description);
      setBackground(bot.background);
      setPersonalityTraits(bot.personalityTraits);
      setStarterPrompts(bot.starterPrompts && bot.starterPrompts.length > 0 ? bot.starterPrompts : ['']);
    } else {
      // Defaults for new bot
      setName('');
      setPicture(null);
      setDescription('');
      setBackground('');
      setPersonalityTraits('');
      setStarterPrompts(['']);
    }
  }, [bot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("Bot name cannot be empty.");
        return;
    }
    const newBot: BotConfig = {
      id: bot?.id || `bot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name.trim(),
      picture,
      description: description.trim(),
      background: background.trim(),
      personalityTraits: personalityTraits.trim(),
      starterPrompts: starterPrompts.map(p => p.trim()).filter(p => p),
    };
    onSave(newBot);
  };

  const handleStarterPromptChange = (index: number, value: string) => {
    const newPrompts = [...starterPrompts];
    newPrompts[index] = value;
    setStarterPrompts(newPrompts);
  };

  const addStarterPrompt = () => {
    if (starterPrompts.length < MAX_STARTER_PROMPTS) {
      setStarterPrompts([...starterPrompts, '']);
    }
  };

  const removeStarterPrompt = (index: number) => {
    if (starterPrompts.length > 1) {
      const newPrompts = starterPrompts.filter((_, i) => i !== index);
      setStarterPrompts(newPrompts);
    } else { // If only one prompt, clear it instead of removing the input field
      setStarterPrompts(['']);
    }
  };
  
  const inputClass = "w-full p-3 bg-neutral-800 border border-neutral-700 rounded-md shadow-sm focus:ring-1 focus:ring-[var(--accent-color-500)] focus:border-[var(--accent-color-500)] text-neutral-200 placeholder-neutral-500";
  const labelClass = "block text-sm font-medium text-neutral-400 mb-1";

  if (isGeneratingAvatar && !bot) { // Full screen loading if creating new bot and generating avatar
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-neutral-800 rounded-lg">
        <LoadingSpinner text="Generating initial avatar..." size="lg"/>
        <p className="text-neutral-400 mt-4 text-sm">This might take a moment.</p>
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit} className={`space-y-5 p-1 ${isGeneratingAvatar ? 'opacity-70 pointer-events-none' : ''}`}>
      {isGeneratingAvatar && (
         <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 z-50 rounded-lg">
            <LoadingSpinner text="Updating avatar..." />
         </div>
      )}
      <ImageUpload
        label="Bot Picture"
        currentImage={picture}
        onImageSelected={setPicture}
        defaultPlaceholder={DEFAULT_BOT_PLACEHOLDER_IMAGE}
        idSuffix="bot-editor"
        enableAIGeneration={true}
        onGenerationStart={() => setIsGeneratingAvatar(true)}
        onGenerationEnd={() => setIsGeneratingAvatar(false)}
      />
      <div>
        <label htmlFor="botName" className={labelClass}>
          Bot Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="botName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="e.g., Seraphina the Sage"
          required
        />
      </div>
      <div>
        <label htmlFor="botDescription" className={labelClass}>
          Description (Short summary)
        </label>
        <textarea
          id="botDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="A wise and enigmatic sorceress."
        />
      </div>
      <div>
        <label htmlFor="botBackground" className={labelClass}>
          Background Story
        </label>
        <textarea
          id="botBackground"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="Born in a hidden grove, trained by ancient spirits..."
        />
      </div>
      <div>
        <label htmlFor="botPersonality" className={labelClass}>
          Personality Traits (comma-separated)
        </label>
        <input
          type="text"
          id="botPersonality"
          value={personalityTraits}
          onChange={(e) => setPersonalityTraits(e.target.value)}
          className={inputClass}
          placeholder="e.g., Wise, Mysterious, Calm, Slightly mischievous"
        />
      </div>

      <div>
        <label className={labelClass}>Starter Prompts (Optional, up to {MAX_STARTER_PROMPTS})</label>
        <div className="space-y-2">
          {starterPrompts.map((prompt, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => handleStarterPromptChange(index, e.target.value)}
                className={`${inputClass} flex-grow`}
                placeholder={`Starter prompt ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeStarterPrompt(index)}
                className="p-2 text-neutral-400 hover:text-red-400 rounded-md hover:bg-neutral-700 disabled:opacity-50"
                title="Remove prompt"
                disabled={starterPrompts.length === 1 && starterPrompts[0] === ''}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          {starterPrompts.length < MAX_STARTER_PROMPTS && (
            <button
              type="button"
              onClick={addStarterPrompt}
              className="flex items-center text-sm text-[var(--accent-color-400)] hover:text-[var(--accent-color-300)] py-1"
            >
              <PlusIcon className="w-4 h-4 mr-1" /> Add another prompt
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-semibold text-white bg-[var(--accent-color-600)] hover:bg-[var(--accent-color-500)] rounded-md shadow-md transition-colors hover:scale-105 disabled:opacity-70"
          disabled={isGeneratingAvatar}
        >
          {bot ? 'Save Changes' : 'Create Bot'}
        </button>
      </div>
    </form>
  );
};

export default BotEditor;
