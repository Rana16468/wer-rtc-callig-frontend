import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Room, Message, TypingUser } from '../types';
import { roomApi } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface ChatContextType {
  rooms: Room[];
  activeRoom: Room | null;
  messages: Record<string, Message[]>;
  typingUsers: TypingUser[];
  loading: boolean;
  setActiveRoom: (room: Room | null) => void;
  sendMessage: (content: string, messageType?: 'text' | 'image' | 'file', replyTo?: string) => void;
  createRoom: (name: string, description?: string, isPrivate?: boolean) => Promise<void>;
  loadRooms: () => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load rooms on mount
  useEffect(() => {
    if (user) {
      loadRooms();
    }
  }, [user]);

  // Setup socket listeners
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prev => ({
        ...prev,
        [message.room]: [...(prev[message.room] || []), message]
      }));
    };

    const handleUserTyping = (data: TypingUser) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      }
    };

    const handleUserStopTyping = (data: { userId: string; roomId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStopTyping(handleUserStopTyping);

    return () => {
      socketService.offNewMessage();
      socketService.off('user_typing', handleUserTyping);
      socketService.off('user_stop_typing', handleUserStopTyping);
    };
  }, [user]);

  // Join rooms when rooms list changes
  useEffect(() => {
    if (rooms.length > 0 && socketService.connected) {
      const roomIds = rooms.map(room => room._id);
      socketService.joinRooms(roomIds);
    }
  }, [rooms]);

  // Load messages when active room changes
  useEffect(() => {
    if (activeRoom && !messages[activeRoom._id]) {
      loadMessages(activeRoom._id);
    }
  }, [activeRoom]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await roomApi.getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await roomApi.getMessages(roomId);
      setMessages(prev => ({
        ...prev,
        [roomId]: response.data
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = (content: string, messageType = 'text' as const, replyTo?: string) => {
    if (!activeRoom || !content.trim()) return;

    socketService.sendMessage({
      roomId: activeRoom._id,
      content: content.trim(),
      messageType,
      replyTo
    });
  };

  const createRoom = async (name: string, description = '', isPrivate = false) => {
    try {
      const response = await roomApi.createRoom({ name, description, isPrivate });
      setRooms(prev => [...prev, response.data]);
      setActiveRoom(response.data);
      toast.success('Room created successfully');
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create room');
    }
  };

  const startTyping = () => {
    if (!activeRoom) return;

    socketService.startTyping(activeRoom._id);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      stopTyping();
    }, 3000);

    setTypingTimeout(timeout);
  };

  const stopTyping = () => {
    if (!activeRoom) return;

    socketService.stopTyping(activeRoom._id);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  return (
    <ChatContext.Provider value={{
      rooms,
      activeRoom,
      messages,
      typingUsers,
      loading,
      setActiveRoom,
      sendMessage,
      createRoom,
      loadRooms,
      startTyping,
      stopTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};