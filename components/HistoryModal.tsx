import React from 'react';
import Modal from './Modal';
import { BotConfig, ChatMessage } from '../types';
import { DEFAULT_BOT_PLACEHOLDER_IMAGE, MAX_CHAT_HISTORY_ITEMS_DISPLAYED } from '../constants';
import { ChatBubbleLeftRightIcon, TrashIcon } from './icons';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistories: Record<string, ChatMessage[]>;
  bots: BotConfig[];
  onSelectChat: (botId: string) => void;
  onDeleteHistory: (botId: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  chatHistories,
  bots,
  onSelectChat,
  onDeleteHistory,
}) => {
  const getBotDetails = (botId: string) => bots.find(b => b.id === botId);

  const sortedHistory = Object.entries(chatHistories)
    .map(([botId, messages]) => {
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      return {
        botId,
        botDetails: getBotDetails(botId),
        lastMessageText: lastMessage?.text.substring(0, 50) + (lastMessage && lastMessage.text.length > 50 ? '...' : ''),
        lastMessageTimestamp: lastMessage?.timestamp || 0,
      };
    })
    .filter(item => item.botDetails && item.lastMessageTimestamp > 0) 
    .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp) 
    .slice(0, MAX_CHAT_HISTORY_ITEMS_DISPLAYED);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chat History" size="lg">
      {sortedHistory.length === 0 ? (
        <p className="text-neutral-500 text-center py-8">No chat history found.</p>
      ) : (
        <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-700/50">
          {sortedHistory.map(({ botId, botDetails, lastMessageText, lastMessageTimestamp }) => (
            <li key={botId} className="bg-neutral-700 p-3 rounded-lg shadow hover:bg-neutral-600/70 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer" onClick={() => onSelectChat(botId)} role="button" tabIndex={0} onKeyPress={e => e.key === 'Enter' && onSelectChat(botId)}>
                  <img
                    src={botDetails?.picture || DEFAULT_BOT_PLACEHOLDER_IMAGE}
                    alt={botDetails?.name || 'Bot'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-neutral-600 flex-shrink-0 bg-neutral-600"
                  />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[var(--accent-color-300)] truncate">
                      {botDetails?.name || 'Unknown Bot'}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate italic">"{lastMessageText || 'No messages yet'}"</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {new Date(lastMessageTimestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 items-center ml-2">
                     <button
                        onClick={() => onSelectChat(botId)}
                        className="p-2 text-neutral-400 hover:text-[var(--accent-color-400)] transition-colors rounded-md hover:bg-neutral-600"
                        title="Resume chat"
                        aria-label={`Resume chat with ${botDetails?.name}`}
                    >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDeleteHistory(botId)}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-md hover:bg-neutral-600"
                        title="Delete this history"
                        aria-label={`Delete history with ${botDetails?.name}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
       <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-600 hover:bg-neutral-500 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
    </Modal>
  );
};

export default HistoryModal;
