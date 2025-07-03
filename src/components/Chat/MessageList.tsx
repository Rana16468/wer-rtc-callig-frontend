import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageItem from './MessageItem';

const MessageList: React.FC = () => {
  const { user } = useAuth();
  const { activeRoom, messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomMessages = activeRoom ? messages[activeRoom._id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  if (!activeRoom) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <AnimatePresence>
        {roomMessages.map((message, index) => {
          const isOwn = message.sender.id === user?.id;
          const showAvatar = !isOwn && (
            index === 0 || 
            roomMessages[index - 1].sender.id !== message.sender.id
          );

          return (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageItem
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {roomMessages.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500">Be the first to send a message in this room!</p>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;