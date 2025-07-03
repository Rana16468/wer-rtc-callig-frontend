import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../context/ChatContext';

const TypingIndicator: React.FC = () => {
  const { activeRoom, typingUsers } = useChat();

  const roomTypingUsers = typingUsers.filter(user => 
    activeRoom && user.roomId === activeRoom._id
  );

  if (roomTypingUsers.length === 0) return null;

  const getTypingText = () => {
    if (roomTypingUsers.length === 1) {
      return `${roomTypingUsers[0].username} is typing...`;
    } else if (roomTypingUsers.length === 2) {
      return `${roomTypingUsers[0].username} and ${roomTypingUsers[1].username} are typing...`;
    } else {
      return `${roomTypingUsers.length} people are typing...`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="px-6 py-2"
      >
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: dot * 0.2,
                }}
                className="w-2 h-2 bg-gray-400 rounded-full"
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">{getTypingText()}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TypingIndicator;