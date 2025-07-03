import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Camera, Phone, Video, Mail, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { format } from 'date-fns';

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { startCall } = useCall();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || ''
  });

  const handleSave = async () => {
    if (editData.username.trim()) {
      updateUser({ username: editData.username.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      username: user?.username || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Profile</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Edit className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Profile Picture */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-4 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </motion.button>
            )}
            <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-white absolute bottom-2 right-2"></div>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editData.username}
                onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-900">{user.username}</h3>
              <p className="text-sm text-green-600 font-medium">Online</p>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startCall(user.id, user.username, false)}
            className="flex-1 p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Phone className="w-5 h-5" />
            <span className="text-sm font-medium">Call</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startCall(user.id, user.username, true)}
            className="flex-1 p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Video className="w-5 h-5" />
            <span className="text-sm font-medium">Video</span>
          </motion.button>
        </div>
      </div>

      {/* User Details */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Last Seen</p>
              <p className="text-sm text-gray-600">
                {format(new Date(user.lastSeen), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-6 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </motion.button>
      </div>
    </div>
  );
};

export default UserProfile;