export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  publicKey?: string;
}

export interface Room {
  _id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  participants: RoomParticipant[];
  createdBy: User;
  maxParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomParticipant {
  user: User;
  joinedAt: Date;
  role: 'admin' | 'member';
}

export interface Message {
  _id: string;
  content: string;
  sender: User;
  room: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  isEncrypted: boolean;
  editedAt?: Date;
  replyTo?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Call {
  _id: string;
  caller: User;
  callee: User;
  room?: Room;
  callType: 'audio' | 'video';
  status: 'pending' | 'accepted' | 'rejected' | 'ended' | 'missed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  createdAt: Date;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}

export interface TypingUser {
  userId: string;
  username: string;
  roomId: string;
}

export interface CallOffer {
  callId: string;
  caller: {
    id: string;
    username: string;
  };
  callType: 'audio' | 'video';
  offer: RTCSessionDescriptionInit;
}