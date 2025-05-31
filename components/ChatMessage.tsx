import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as Message } from '../types';
import { PencilIcon, ArrowPathIcon } from './icons'; 
import { DEFAULT_USER_PLACEHOLDER_IMAGE, DEFAULT_BOT_PLACEHOLDER_IMAGE } from '../constants';


interface ChatMessageProps {
  message: Message;
  userPicture: string | null;
  botPicture: string | null;
  onEditMessage: (messageId: string, newText: string) => void;
  onRegenerateMessage: (messageId: string) => void; 
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, userPicture, botPicture, onEditMessage, onRegenerateMessage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isUser = message.sender === 'user';

  useEffect(() => {
    setEditText(message.text);
  }, [message.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; 
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editText.trim() !== message.text) {
      onEditMessage(message.id, editText.trim());
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const formatText = (text: string) => {
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>');       // Italic
    
    return formattedText.split('\n').map((line, index, array) => (
      <React.Fragment key={index}>
        <span dangerouslySetInnerHTML={{ __html: line }} />
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex items-end mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start max-w-[80%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <img
            src={botPicture || DEFAULT_BOT_PLACEHOLDER_IMAGE}
            alt="Bot"
            className="w-8 h-8 rounded-full mr-2 sm:mr-3 self-start flex-shrink-0 border border-neutral-700 bg-neutral-700"
          />
        )}
        {isUser && (
          <img
            src={userPicture || DEFAULT_USER_PLACEHOLDER_IMAGE}
            alt="User"
            className="w-8 h-8 rounded-full ml-2 sm:ml-3 self-start flex-shrink-0 border border-neutral-700 bg-neutral-700"
          />
        )}
        <div
          className={`relative group p-3 rounded-lg shadow ${
            isUser
              ? 'bg-[var(--accent-color-600)] text-white rounded-br-none'
              : 'bg-neutral-700 text-neutral-200 rounded-bl-none' // Bot message darker
          }`}
        >
          {isEditing && !isUser ? ( 
            <div className="w-full">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit} 
                className="w-full bg-neutral-600 text-neutral-100 p-2 rounded-md resize-none overflow-hidden focus:ring-1 focus:ring-[var(--accent-color-500)] border-transparent focus:border-transparent"
                rows={1}
              />
               <div className="mt-2 text-xs text-neutral-400">
                Enter to save, Esc to cancel.
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words min-w-[50px]">
                {formatText(message.text)}
                {message.isStreaming && <span className={`inline-block w-2 h-2 ml-1 bg-[var(--accent-color-400)] rounded-full animate-pulse`}></span>}
            </div>
          )}
          {!isUser && !isEditing && !message.isStreaming && (
            <div className="absolute -bottom-2 -right-2 md:opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-neutral-800/80 backdrop-blur-sm p-1 rounded-md shadow-lg border border-neutral-700">
              <button
                onClick={handleEdit}
                className="p-1 text-neutral-400 hover:text-[var(--accent-color-400)]"
                title="Edit message"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRegenerateMessage(message.id)}
                className="p-1 text-neutral-400 hover:text-[var(--accent-color-400)]" // Using accent for regenerate now
                title="Regenerate response"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
