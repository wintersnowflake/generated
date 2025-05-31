import React from 'react';
import { BotConfig } from '../types';
import { PencilIcon, TrashIcon, ChatBubbleLeftRightIcon } from './icons';
import { DEFAULT_BOT_PLACEHOLDER_IMAGE } from '../constants';

interface BotCardProps {
  bot: BotConfig;
  onSelect: (botId: string) => void;
  onEdit: (botId: string) => void;
  onDelete: (botId: string) => void;
}

const BotCard: React.FC<BotCardProps> = ({ bot, onSelect, onEdit, onDelete }) => {
  return (
    <div className="bg-neutral-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_15px_3px_var(--accent-color-700)] hover:scale-[1.02] border border-neutral-700 hover:border-[var(--accent-color-600)]">
      <div className="p-5">
        <div className="flex items-start space-x-4">
          <img
            src={bot.picture || DEFAULT_BOT_PLACEHOLDER_IMAGE}
            alt={bot.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-neutral-700 flex-shrink-0 bg-neutral-700" // Added bg for placeholder visibility
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-[var(--accent-color-400)] truncate" title={bot.name}>{bot.name}</h3>
            <p className="text-sm text-neutral-400 mt-1 h-10 overflow-hidden text-ellipsis line-clamp-2">
              {bot.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-neutral-700/50 px-5 py-3 flex justify-between items-center border-t border-neutral-700">
        <button
          onClick={() => onSelect(bot.id)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--accent-color-600)] hover:bg-[var(--accent-color-500)] rounded-md shadow-sm transition-colors"
          title="Chat with this bot"
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
          Chat
        </button>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(bot.id)}
            className="p-2 text-neutral-400 hover:text-[var(--accent-color-400)] transition-colors rounded-md hover:bg-neutral-600/50"
            title="Edit bot"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(bot.id)}
            className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-md hover:bg-neutral-600/50"
            title="Delete bot"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotCard;
