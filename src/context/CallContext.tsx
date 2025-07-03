import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { CallOffer } from '../types';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CallContextType {
  incomingCall: CallOffer | null;
  activeCall: {
    callId: string;
    isVideo: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
    isScreenSharing: boolean;
    remoteUserId: string;
    remoteUsername: string;
  } | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  answerCall: (accepted: boolean) => void;
  startCall: (userId: string, username: string, isVideo: boolean) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

interface CallProviderProps {
  children: ReactNode;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState<CallOffer | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Cleanup function
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    setRemoteStream(null);
    pendingIceCandidates.current = [];
  };

  // Setup socket listeners
  useEffect(() => {
    if (!user) return;

    const handleIncomingCall = (data: CallOffer) => {
      console.log('Incoming call:', data);
      setIncomingCall(data);
      
      // Play incoming call sound
      const audio = new Audio('/sounds/incoming-call.mp3');
      audio.play().catch(console.error);
      
      toast.success(`Incoming ${data.callType} call from ${data.caller.username}`, {
        duration: 10000,
      });
    };

    const handleCallAccepted = async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
      console.log('Call accepted:', data);
      
      if (peerConnection.current && activeCall?.callId === data.callId) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          
          // Add pending ICE candidates
          for (const candidate of pendingIceCandidates.current) {
            try {
              await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
          }
          pendingIceCandidates.current = [];
          
          toast.success('Call connected!');
        } catch (error) {
          console.error('Error handling call accepted:', error);
          toast.error('Failed to establish connection');
          endCall();
        }
      }
    };

    const handleCallRejected = (data: { callId: string }) => {
      console.log('Call rejected:', data);
      if (activeCall?.callId === data.callId) {
        cleanup();
        setActiveCall(null);
        toast.error('Call was rejected');
      }
    };

    const handleCallEnded = (data: { callId: string }) => {
      console.log('Call ended:', data);
      if (activeCall?.callId === data.callId || incomingCall?.callId === data.callId) {
        cleanup();
        setActiveCall(null);
        setIncomingCall(null);
        toast.success('Call ended');
      }
    };

    const handleIceCandidate = async (data: { callId: string; candidate: RTCIceCandidateInit }) => {
      console.log('Received ICE candidate:', data);
      
      if (peerConnection.current && (activeCall?.callId === data.callId || incomingCall?.callId === data.callId)) {
        try {
          if (peerConnection.current.remoteDescription) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else {
            pendingIceCandidates.current.push(data.candidate);
          }
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    };

    const handleCallInitiated = (data: { callId: string; calleeId: string }) => {
      console.log('Call initiated:', data);
      if (activeCall) {
        setActiveCall((prev:any) => prev ? { ...prev, callId: data.callId } : null);
      }
    };

    socketService.onIncomingCall(handleIncomingCall);
    socketService.onCallAccepted(handleCallAccepted);
    socketService.onCallRejected(handleCallRejected);
    socketService.onCallEnded(handleCallEnded);
    socketService.onIceCandidate(handleIceCandidate);
    socketService.on('call_initiated', handleCallInitiated);

    return () => {
      socketService.off('incoming_call', handleIncomingCall);
      socketService.off('call_accepted', handleCallAccepted);
      socketService.off('call_rejected', handleCallRejected);
      socketService.off('call_ended', handleCallEnded);
      socketService.off('ice_candidate', handleIceCandidate);
      socketService.off('call_initiated', handleCallInitiated);
    };
  }, [user, activeCall, incomingCall]);

  const createPeerConnection = () => {
    console.log('Creating peer connection...');
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      console.log('ICE candidate generated:', event.candidate);
      if (event.candidate && (activeCall || incomingCall)) {
        const callId = activeCall?.callId || incomingCall?.callId;
        if (callId) {
          socketService.sendIceCandidate({
            callId,
            candidate: event.candidate.toJSON()
          });
        }
      }
    };

    pc.ontrack = (event) => {
      console.log('Remote track received:', event);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state changed:', pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        toast.error('Connection lost');
        endCall();
      } else if (pc.connectionState === 'connected') {
        toast.success('Connected!');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state changed:', pc.iceConnectionState);
    };

    return pc;
  };

  const getLocalStream = async (isVideo: boolean) => {
    try {
      console.log('Getting local stream, video:', isVideo);
      const constraints = {
        video: isVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Local stream obtained:', stream);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      toast.error('Failed to access camera/microphone. Please check permissions.');
      throw error;
    }
  };

  const startCall = async (userId: string, username: string, isVideo: boolean) => {
    try {
      console.log('Starting call to:', userId, username, 'video:', isVideo);
      
      // Check if user is online
      if (!socketService.connected) {
        toast.error('Not connected to server');
        return;
      }

      const stream = await getLocalStream(isVideo);
      const pc = createPeerConnection();
      peerConnection.current = pc;

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track);
        pc.addTrack(track, stream);
      });

      // Create offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: isVideo
      });
      await pc.setLocalDescription(offer);

      console.log('Offer created:', offer);

      // Set active call state
      setActiveCall({
        callId: '', // Will be set when server responds
        isVideo,
        isMuted: false,
        isVideoOff: !isVideo,
        isScreenSharing: false,
        remoteUserId: userId,
        remoteUsername: username
      });

      // Send call request to server
      socketService.callUser({
        calleeId: userId,
        callType: isVideo ? 'video' : 'audio',
        offer
      });

      toast.success(`Calling ${username}...`);
    } catch (error) {
      console.error('Error starting call:', error);
      cleanup();
      setActiveCall(null);
      toast.error('Failed to start call');
    }
  };

  const answerCall = async (accepted: boolean) => {
    if (!incomingCall) return;

    console.log('Answering call:', accepted);

    if (!accepted) {
      socketService.answerCall({
        callId: incomingCall.callId,
        accepted: false
      });
      setIncomingCall(null);
      return;
    }

    try {
      const stream = await getLocalStream(incomingCall.callType === 'video');
      const pc = createPeerConnection();
      peerConnection.current = pc;

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track);
        pc.addTrack(track, stream);
      });

      // Set remote description from offer
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log('Answer created:', answer);

      // Set active call state
      setActiveCall({
        callId: incomingCall.callId,
        isVideo: incomingCall.callType === 'video',
        isMuted: false,
        isVideoOff: incomingCall.callType !== 'video',
        isScreenSharing: false,
        remoteUserId: incomingCall.caller.id,
        remoteUsername: incomingCall.caller.username
      });

      // Send answer to server
      socketService.answerCall({
        callId: incomingCall.callId,
        accepted: true,
        answer
      });

      setIncomingCall(null);
      toast.success('Call answered!');
    } catch (error) {
      console.error('Error answering call:', error);
      cleanup();
      setActiveCall(null);
      setIncomingCall(null);
      toast.error('Failed to answer call');
    }
  };

  const endCall = () => {
    console.log('Ending call');
    
    if (activeCall) {
      socketService.endCall(activeCall.callId);
    }

    cleanup();
    setActiveCall(null);
    setIncomingCall(null);
  };

  const toggleMute = () => {
    if (localStream && activeCall) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setActiveCall((prev :any)=> prev ? { ...prev, isMuted: !audioTrack.enabled } : null);
        toast.success(audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted');
      }
    }
  };

  const toggleVideo = () => {
    if (localStream && activeCall) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setActiveCall((prev :any)=> prev ? { ...prev, isVideoOff: !videoTrack.enabled } : null);
        toast.success(videoTrack.enabled ? 'Camera on' : 'Camera off');
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!activeCall || !peerConnection.current) return;

    try {
      if (activeCall.isScreenSharing) {
        // Stop screen sharing - switch back to camera
        const stream = await getLocalStream(activeCall.isVideo);
        const videoTrack = stream.getVideoTracks()[0];
        
        const sender = peerConnection.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }

        setActiveCall((prev:any) => prev ? { ...prev, isScreenSharing: false } : null);
        toast.success('Screen sharing stopped');
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true 
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        const sender = peerConnection.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
        }

        // Handle screen share ending
        screenTrack.onended = () => {
          toggleScreenShare(); // This will stop screen sharing
        };

        setActiveCall((prev:any) => prev ? { ...prev, isScreenSharing: true } : null);
        toast.success('Screen sharing started');
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  return (
    <CallContext.Provider value={{
      incomingCall,
      activeCall,
      localStream,
      remoteStream,
      answerCall,
      startCall,
      endCall,
      toggleMute,
      toggleVideo,
      toggleScreenShare
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};