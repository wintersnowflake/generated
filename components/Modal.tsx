import React from 'react';
import { XMarkIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 transition-opacity duration-300 ease-in-out" aria-modal="true" role="dialog">
      <div 
        className={`bg-neutral-800 rounded-lg shadow-xl m-4 w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] border border-neutral-700`} // Darker bg and border
      >
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-neutral-700">
          <h2 className="text-xl font-semibold text-[var(--accent-color-400)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-300 transition-colors p-1 rounded-full hover:bg-neutral-700" // Darker button colors
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow p-4 md:p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-700"> {/* Darker scrollbar */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
