import React, { useState, useEffect } from 'react';
import { UserPersona } from '../types';
import ImageUpload from './ImageUpload';
import { DEFAULT_USER_PLACEHOLDER_IMAGE } from '../constants';

interface UserPersonaEditorProps {
  persona: UserPersona | null;
  onSave: (persona: UserPersona) => void;
  onClose: () => void;
}

const UserPersonaEditor: React.FC<UserPersonaEditorProps> = ({ persona, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [picture, setPicture] = useState<string | null>(null);

  useEffect(() => {
    if (persona) {
      setName(persona.name);
      setDescription(persona.description);
      setPicture(persona.picture);
    } else {
      // Set defaults for new persona
      setName('Adventurer');
      setDescription('A curious explorer of digital realms.');
      setPicture(null);
    }
  }, [persona]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPersona: UserPersona = {
      id: persona?.id || `user-${Date.now()}`,
      name: name.trim() || 'User',
      description: description.trim() || 'A mysterious individual.',
      picture,
    };
    onSave(newPersona);
  };
  
  const inputClass = "w-full p-3 bg-neutral-800 border border-neutral-700 rounded-md shadow-sm focus:ring-1 focus:ring-[var(--accent-color-500)] focus:border-[var(--accent-color-500)] text-neutral-200 placeholder-neutral-500";
  const labelClass = "block text-sm font-medium text-neutral-400 mb-1";


  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <ImageUpload
        label="Your Picture"
        currentImage={picture}
        onImageSelected={setPicture}
        defaultPlaceholder={DEFAULT_USER_PLACEHOLDER_IMAGE}
        idSuffix="user-persona"
      />
      <div>
        <label htmlFor="personaName" className={labelClass}>
          Your Name
        </label>
        <input
          type="text"
          id="personaName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="e.g., Captain Astra"
        />
      </div>
      <div>
        <label htmlFor="personaDescription" className={labelClass}>
          Your Description (for the bot)
        </label>
        <textarea
          id="personaDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Describe yourself or your role for the bot."
        />
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
          className="px-6 py-2 text-sm font-semibold text-white bg-[var(--accent-color-600)] hover:bg-[var(--accent-color-500)] rounded-md shadow-md transition-colors hover:scale-105"
        >
          Save Persona
        </button>
      </div>
    </form>
  );
};

export default UserPersonaEditor;
