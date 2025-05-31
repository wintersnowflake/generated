
import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, FormatItalicIcon, MicrophoneIcon, MicrophoneSlashIcon } from './icons';
import { SpeechRecognitionStatus } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isSending: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isSending }) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const [speechStatus, setSpeechStatus] = useState<SpeechRecognitionStatus>('idle');

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInputText(prev => prev.substring(0, prev.length - interimTranscript.length) + finalTranscript + interimTranscript);
         if (finalTranscript) { // Auto-submit if final transcript ends with a pause or clear utterance
            // This part can be tricky; for now, let user press send
        }
      };

      recognitionRef.current.onstart = () => setSpeechStatus('listening');
      recognitionRef.current.onend = () => setSpeechStatus('idle');
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechStatus('denied');
        } else {
          setSpeechStatus('error');
        }
      };
    } else {
      setSpeechStatus('nosupport');
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (speechStatus === 'listening') {
      recognitionRef.current?.stop();
    } else if (recognitionRef.current && (speechStatus === 'idle' || speechStatus === 'error' || speechStatus === 'denied')) { // Allow retry if denied/error
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setSpeechStatus('error');
      }
    }
  };


  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim() && !isSending) {
      onSendMessage(inputText.trim());
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; 
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`; // Max height ~4-5 lines (128px)
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  const handleItalicClick = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value;
      const selectedText = text.substring(start, end);
      
      let newText;
      let cursorPos;

      if (selectedText) { 
        newText = `${text.substring(0, start)}*${selectedText}*${text.substring(end)}`;
        cursorPos = start + 1 + selectedText.length + 1; 
      } else { 
        newText = `${text.substring(0, start)}**${text.substring(end)}`;
        cursorPos = start + 1;
      }
      
      setInputText(newText);
      
      textareaRef.current.focus();
      setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    }
  };
  
  let micButtonTitle = "Start voice input";
  if (speechStatus === 'listening') micButtonTitle = "Stop voice input";
  else if (speechStatus === 'denied') micButtonTitle = "Voice input denied. Click to try requesting permission again or check browser settings.";
  else if (speechStatus === 'error') micButtonTitle = "Voice input error. Click to try again.";
  else if (speechStatus === 'nosupport') micButtonTitle = "Voice input not supported by your browser.";


  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-[#161B22] border-t border-[#30363D]">
      <div className="flex items-end bg-[#21262D] rounded-xl p-1 shadow-md">
        <button
          type="button"
          onClick={handleItalicClick}
          className="p-2 sm:p-3 text-neutral-400 hover:text-[var(--accent-color-400)] disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors rounded-md"
          aria-label="Format italic"
          title="Italic (*text*)"
          disabled={isSending || speechStatus === 'listening'}
        >
          <FormatItalicIcon className="w-5 h-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={speechStatus === 'listening' ? "Listening..." : "Type your message..."}
          className="flex-grow p-2 sm:p-3 bg-transparent text-neutral-200 placeholder-neutral-500 resize-none focus:outline-none overflow-y-auto max-h-32"
          rows={1}
          disabled={isSending}
          style={{ scrollbarWidth: 'thin' }} 
        />
        {speechStatus !== 'nosupport' && (
            <button
                type="button"
                onClick={handleToggleSpeech}
                disabled={isSending} 
                className={`p-2 sm:p-3 rounded-md transition-colors
                            ${speechStatus === 'listening' ? 'text-red-500 hover:text-red-400' : 'text-neutral-400 hover:text-[var(--accent-color-400)]'}
                            disabled:text-neutral-600 disabled:cursor-not-allowed`}
                aria-label={micButtonTitle}
                title={micButtonTitle}
            >
                {speechStatus === 'listening' ? <MicrophoneSlashIcon className="w-5 h-5 animate-pulse" /> : <MicrophoneIcon className="w-5 h-5" />}
            </button>
        )}
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="p-2 sm:p-3 text-[var(--accent-color-500)] hover:text-[var(--accent-color-400)] disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors rounded-md"
          aria-label="Send message"
        >
          {isSending ? (
            <div className="w-6 h-6 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <PaperAirplaneIcon className="w-6 h-6" />
          )}
        </button>
      </div>
      {speechStatus === 'denied' && <p className="text-xs text-red-400 text-center mt-1">Microphone access denied. Please enable it in your browser settings.</p>}
      {speechStatus === 'error' && <p className="text-xs text-yellow-400 text-center mt-1">Speech recognition error. Please try again.</p>}
    </form>
  );
};

export default ChatInput;
