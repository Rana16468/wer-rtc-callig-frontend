import { io, Socket } from 'socket.io-client';
import { Message, TypingUser, CallOffer } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    
    if (this.socket?.connected) {
      this.socket.disconnect();
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3082', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  // Room management
  joinRooms(roomIds: string[]) {
    this.socket?.emit('join_rooms', roomIds);
  }

  // Messaging
  sendMessage(data: {
    roomId: string;
    content: string;
    messageType?: 'text' | 'image' | 'file';
    replyTo?: string;
  }) {
    this.socket?.emit('send_message', data);
  }

  onNewMessage(callback: (message: Message) => void) {
    this.socket?.on('new_message', callback);
  }

  offNewMessage() {
    this.socket?.off('new_message');
  }

  // Typing indicators
  startTyping(roomId: string) {
    this.socket?.emit('typing_start', { roomId });
  }

  stopTyping(roomId: string) {
    this.socket?.emit('typing_stop', { roomId });
  }

  onUserTyping(callback: (data: TypingUser) => void) {
    this.socket?.on('user_typing', callback);
  }

  onUserStopTyping(callback: (data: { userId: string; roomId: string }) => void) {
    this.socket?.on('user_stop_typing', callback);
  }

  // User presence
  onUserOnline(callback: (data: { userId: string; username: string }) => void) {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback: (data: { userId: string; username: string }) => void) {
    this.socket?.on('user_offline', callback);
  }

  // Video calling
  callUser(data: {
    calleeId: string;
    callType: 'audio' | 'video';
    offer: RTCSessionDescriptionInit;
  }) {
    this.socket?.emit('call_user', data);
  }

  answerCall(data: {
    callId: string;
    accepted: boolean;
    answer?: RTCSessionDescriptionInit;
  }) {
    this.socket?.emit('answer_call', data);
  }

  endCall(callId: string) {
    this.socket?.emit('end_call', { callId });
  }

  sendIceCandidate(data: {
    callId: string;
    candidate: RTCIceCandidateInit;
  }) {
    this.socket?.emit('ice_candidate', data);
  }

  startScreenShare(callId: string) {
    this.socket?.emit('screen_share_start', { callId });
  }

  stopScreenShare(callId: string) {
    this.socket?.emit('screen_share_stop', { callId });
  }

  // Call event listeners
  onIncomingCall(callback: (data: CallOffer) => void) {
    this.socket?.on('incoming_call', callback);
  }

  onCallAccepted(callback: (data: { callId: string; answer: RTCSessionDescriptionInit }) => void) {
    this.socket?.on('call_accepted', callback);
  }

  onCallRejected(callback: (data: { callId: string }) => void) {
    this.socket?.on('call_rejected', callback);
  }

  onCallEnded(callback: (data: { callId: string }) => void) {
    this.socket?.on('call_ended', callback);
  }

  onIceCandidate(callback: (data: { callId: string; candidate: RTCIceCandidateInit }) => void) {
    this.socket?.on('ice_candidate', callback);
  }

  onScreenShareStarted(callback: (data: { callId: string; userId: string }) => void) {
    this.socket?.on('screen_share_started', callback);
  }

  onScreenShareStopped(callback: (data: { callId: string; userId: string }) => void) {
    this.socket?.on('screen_share_stopped', callback);
  }

  // Generic event listeners
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  get connected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;