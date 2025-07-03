import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import UserProfile from './UserProfile';
import { useChat } from '../../context/ChatContext';

const ChatLayout: React.FC = () => {
  const { activeRoom } = useChat();

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-80 bg-white border-r border-gray-200 flex flex-col"
      >
        <Sidebar />
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <ChatArea />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a room from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Panel - Could be shown/hidden based on state */}
      <div className="w-80 bg-white border-l border-gray-200 hidden lg:block">
        <UserProfile />
      </div>
    </div>
  );
};

export default ChatLayout;