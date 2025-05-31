import React from 'react';
import Modal from './Modal';
import { AppSettings, AccentColorKey, FontSize } from '../types';
import { ACCENT_COLORS, FONT_SIZES, CHAT_BACKGROUND_OPTIONS, DEFAULT_APP_SETTINGS } from '../constants';
import { CheckIcon, NoSymbolIcon } from './icons';
import ImageUpload from './ImageUpload'; 

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppSettings;
  onSettingsChange: (newSettings: Partial<AppSettings>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSettingsChange,
}) => {
  const handleAccentColorChange = (color: AccentColorKey) => {
    onSettingsChange({ accentColor: color });
  };

  const handleFontSizeChange = (size: FontSize) => {
    onSettingsChange({ fontSize: size });
  };

  const handleChatBgColorChange = (bgColorKey: string) => {
    onSettingsChange({ chatBackground: bgColorKey, customChatBackgroundImage: null });
  };

  const handleCustomBgImageSelected = (base64Image: string | null) => {
    onSettingsChange({ customChatBackgroundImage: base64Image, chatBackground: base64Image ? 'custom' : DEFAULT_APP_SETTINGS.chatBackground });
  };
  
  const handleClearCustomBgImage = () => {
    onSettingsChange({ customChatBackgroundImage: null, chatBackground: DEFAULT_APP_SETTINGS.chatBackground });
  };

  const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
    <h3 className="text-lg font-semibold text-neutral-200 mb-3 border-b border-neutral-700 pb-2">{children}</h3>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Application Settings" size="lg">
      <div className="space-y-8">
        {/* Accent Color Setting */}
        <section>
          <SectionTitle>Theme Accent Color</SectionTitle>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map(color => (
              <button
                key={color.key}
                onClick={() => handleAccentColorChange(color.key)}
                title={color.name}
                aria-label={`Set theme accent to ${color.name}`}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-150 ease-in-out
                            ${currentSettings.accentColor === color.key ? 'ring-2 ring-offset-2 ring-offset-neutral-800 border-white' : 'border-neutral-700 hover:border-neutral-500'} 
                            flex items-center justify-center`}
                style={{ backgroundColor: color.cssVars['--accent-color-500'], borderColor: currentSettings.accentColor === color.key ? 'white': undefined }}
              >
                {currentSettings.accentColor === color.key && <CheckIcon className="w-5 h-5 text-white" />}
              </button>
            ))}
          </div>
        </section>

        {/* Font Size Setting */}
        <section>
          <SectionTitle>Font Size</SectionTitle>
          <div className="flex space-x-3">
            {FONT_SIZES.map(size => (
              <button
                key={size.key}
                onClick={() => handleFontSizeChange(size.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${currentSettings.fontSize === size.key ? 'bg-[var(--accent-color-600)] text-white' : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'}`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </section>

        {/* Chat Background Setting */}
        <section>
          <SectionTitle>Chat Background</SectionTitle>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-neutral-400 mb-2">Background Color</h4>
              <div className="flex flex-wrap gap-3">
                {CHAT_BACKGROUND_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleChatBgColorChange(opt.key)}
                    title={opt.name}
                    aria-label={`Set chat background to ${opt.name}`}
                    className={`w-10 h-10 rounded-md border-2 transition-all duration-150 ease-in-out
                                ${currentSettings.chatBackground === opt.key && !currentSettings.customChatBackgroundImage ? 'ring-2 ring-offset-2 ring-offset-neutral-800 border-[var(--accent-color-400)]' : 'border-neutral-700 hover:border-neutral-500'}
                                ${opt.class} flex items-center justify-center`}
                  >
                    {currentSettings.chatBackground === opt.key && !currentSettings.customChatBackgroundImage && <CheckIcon className="w-5 h-5 text-[var(--accent-color-500)]" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
                <h4 className="text-sm font-medium text-neutral-400 mb-2">Custom Background Image</h4>
                <div className="flex items-center space-x-4">
                    <ImageUpload 
                        label=""
                        currentImage={currentSettings.customChatBackgroundImage}
                        onImageSelected={handleCustomBgImageSelected}
                        defaultPlaceholder={`data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%27128%27%20height%3D%27128%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Crect%20width%3D%27128%27%20height%3D%27128%27%20fill%3D%27%23374151%27/%3E%3Ctext%20x%3D%2750%25%27%20y%3D%2750%25%27%20font-family%3D%27sans-serif%27%20font-size%3D%2712%27%20fill%3D%27%23D1D5DB%27%20dominant-baseline%3D%27middle%27%20text-anchor%3D%27middle%27%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E`}
                        idSuffix="chat-bg-custom"
                    />
                    {currentSettings.customChatBackgroundImage && (
                        <button
                        onClick={handleClearCustomBgImage}
                        className="flex items-center px-3 py-2 text-sm text-red-400 bg-neutral-700 hover:bg-red-700 hover:text-red-100 rounded-md transition-colors"
                        title="Clear custom background image"
                        >
                            <NoSymbolIcon className="w-4 h-4 mr-1.5" /> Clear Image
                        </button>
                    )}
                </div>
                {currentSettings.customChatBackgroundImage && (
                     <p className="text-xs text-neutral-500 mt-1">Custom image is active.</p>
                )}
            </div>
          </div>
        </section>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
