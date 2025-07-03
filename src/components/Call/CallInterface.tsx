import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor,
  MonitorX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useCall } from '../../context/CallContext';

const CallInterface: React.FC = () => {
  const {
    activeCall,
    localStream,
    remoteStream,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare
  } = useCall();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!activeCall) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-900 flex flex-col"
      >
        {/* Header */}
        <div className="bg-black bg-opacity-50 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{activeCall.remoteUsername}</h2>
              <p className="text-sm text-gray-300">
                {activeCall.isVideo ? 'Video call' : 'Voice call'} • {remoteStream ? 'Connected' : 'Connecting...'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <Minimize2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Remote Video */}
          {remoteStream && activeCall.isVideo ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold">
                    {activeCall.remoteUsername.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{activeCall.remoteUsername}</h3>
                <p className="text-gray-300">
                  {!remoteStream ? 'Connecting...' : 'Voice only'}
                </p>
              </div>
            </div>
          )}

          {/* Local Video (Picture-in-Picture) */}
          {activeCall.isVideo && localStream && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-white"
            >
              {!activeCall.isVideoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <VideoOff className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Call Controls */}
        <div className="bg-black bg-opacity-50 p-6">
          <div className="flex items-center justify-center space-x-4">
            {/* Mute/Unmute */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className={`p-4 rounded-full transition-all duration-200 ${
                activeCall.isMuted
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={activeCall.isMuted ? 'Unmute' : 'Mute'}
            >
              {activeCall.isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </motion.button>

            {/* Video Toggle */}
            {activeCall.isVideo && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all duration-200 ${
                  activeCall.isVideoOff
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={activeCall.isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {activeCall.isVideoOff ? (
                  <VideoOff className="w-6 h-6 text-white" />
                ) : (
                  <Video className="w-6 h-6 text-white" />
                )}
              </motion.button>
            )}

            {/* Screen Share */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-all duration-200 ${
                activeCall.isScreenSharing
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={activeCall.isScreenSharing ? 'Stop screen share' : 'Share screen'}
            >
              {activeCall.isScreenSharing ? (
                <MonitorX className="w-6 h-6 text-white" />
              ) : (
                <Monitor className="w-6 h-6 text-white" />
              )}
            </motion.button>

            {/* End Call */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={endCall}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-200"
              title="End call"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallInterface;