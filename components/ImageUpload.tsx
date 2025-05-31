import React, { useState, useRef, useEffect } from 'react';
import { PencilIcon, WandSparklesIcon } from './icons';
import { generateBotAvatar }
 from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface ImageUploadProps {
  onImageSelected: (base64Image: string | null) => void;
  currentImage: string | null;
  label: string;
  defaultPlaceholder: string;
  idSuffix?: string;
  enableAIGeneration?: boolean;
  onGenerationStart?: () => void;
  onGenerationEnd?: (success: boolean) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelected, 
  currentImage, 
  label, 
  defaultPlaceholder,
  idSuffix = 'img-upload',
  enableAIGeneration = false,
  onGenerationStart,
  onGenerationEnd,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = `image-upload-input-${idSuffix}`;

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image size should not exceed 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageSelected(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (!isGenerating) fileInputRef.current?.click();
  };

  const handleGenerateAvatar = async () => {
    if (!aiPrompt.trim()) {
      setGenerationError("Please enter a prompt to generate an avatar.");
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    onGenerationStart?.();
    try {
      const generatedImage = await generateBotAvatar(aiPrompt);
      if (generatedImage) {
        const fullBase64Image = `data:image/png;base64,${generatedImage}`;
        setPreview(fullBase64Image);
        onImageSelected(fullBase64Image);
      } else {
        setGenerationError("AI could not generate an image for this prompt.");
      }
      onGenerationEnd?.(!!generatedImage);
    } catch (error: any) {
      setGenerationError(error.message || "An unknown error occurred during avatar generation.");
      onGenerationEnd?.(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-400 mb-1">{label}</label>
      <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
        <div
          className={`relative w-32 h-32 rounded-full overflow-hidden border-2 border-neutral-700 hover:border-[var(--accent-color-500)] cursor-pointer group flex items-center justify-center bg-neutral-800 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleImageClick}
          onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleImageClick()}
          tabIndex={isGenerating ? -1 : 0}
          role="button"
          aria-label={`Upload ${label}`}
        >
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <LoadingSpinner size="sm" />
            </div>
          )}
          <img
            src={preview || defaultPlaceholder}
            alt={preview ? "Current" : "Placeholder"}
            className="w-full h-full object-cover"
          />
          {!isGenerating && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-opacity duration-200">
              <PencilIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
        </div>
        <input
          id={inputId}
          type="file"
          accept="image/png, image/jpeg, image/gif, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          disabled={isGenerating}
        />
        {enableAIGeneration && (
          <div className="mt-3 sm:mt-0 flex-grow">
            <p className="text-xs text-neutral-500 mb-1">Or generate with AI:</p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., mystical fox spirit, glowing eyes, forest background"
              className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded-md shadow-sm focus:ring-1 focus:ring-[var(--accent-color-500)] focus:border-[var(--accent-color-500)] text-neutral-200 placeholder-neutral-500 text-sm"
              rows={2}
              disabled={isGenerating}
            />
            <button
              type="button"
              onClick={handleGenerateAvatar}
              disabled={isGenerating || !aiPrompt.trim()}
              className="mt-2 w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-[var(--accent-color-600)] hover:bg-[var(--accent-color-500)] rounded-md shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <WandSparklesIcon className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Avatar'}
            </button>
            {generationError && <p className="text-xs text-red-400 mt-1">{generationError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
