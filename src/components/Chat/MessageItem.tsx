import React from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { Message } from '../../types';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, showAvatar }) => {
  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {message.sender.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Message Bubble */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`relative px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          } ${!showAvatar && !isOwn ? 'ml-10' : ''}`}
        >
          {/* Sender name for group messages */}
          {!isOwn && showAvatar && (
            <p className="text-xs font-semibold text-gray-600 mb-1">
              {message.sender.username}
            </p>
          )}
          
          {/* Message content */}
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
          
          {/* Timestamp */}
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatMessageTime(new Date(message.createdAt))}
            {message.editedAt && ' (edited)'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MessageItem;