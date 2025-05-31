
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  textColorClass?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, textColorClass = 'text-neutral-400' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={`${sizeClasses[size]} border-[var(--accent-color-500)] border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && <p className={`${textColorClass} text-sm`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
