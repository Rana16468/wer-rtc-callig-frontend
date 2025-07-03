import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCall } from '../../context/CallContext';

const IncomingCallModal: React.FC = () => {
  const { incomingCall, answerCall } = useCall();

  if (!incomingCall) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl"
        >
          {/* Caller Avatar */}
          <div className="relative mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto"
            >
              <span className="text-white text-2xl font-bold">
                {incomingCall.caller.username.charAt(0).toUpperCase()}
              </span>
            </motion.div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className={`p-2 rounded-full ${
                incomingCall.callType === 'video' ? 'bg-blue-600' : 'bg-green-600'
              }`}>
                {incomingCall.callType === 'video' ? (
                  <Video className="w-4 h-4 text-white" />
                ) : (
                  <Phone className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Call Info */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {incomingCall.caller.username}
            </h3>
            <p className="text-gray-600">
              Incoming {incomingCall.callType} call...
            </p>
          </div>

          {/* Call Actions */}
          <div className="flex items-center justify-center space-x-4">
            {/* Decline */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => answerCall(false)}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </motion.button>

            {/* Accept */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => answerCall(true)}
              className="p-4 bg-green-600 hover:bg-green-700 rounded-full shadow-lg transition-colors"
            >
              <Phone className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCallModal;