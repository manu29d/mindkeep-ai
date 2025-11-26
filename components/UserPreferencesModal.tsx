import React, { useState, useEffect } from 'react';
import { useTodo } from '../context/TodoContext';
import { X, Key, Trash2 } from 'lucide-react';

const ModalOverlay: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="absolute inset-0" onClick={onClose} />
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 transition-colors flex flex-col">
      {children}
    </div>
  </div>
);

interface UserPreferencesModalProps {
  onClose: () => void;
}

const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({ onClose }) => {
  const { geminiApiKey, setGeminiApiKey } = useTodo();
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (geminiApiKey) {
      setApiKey(geminiApiKey);
    } else {
      setApiKey('');
    }
  }, [geminiApiKey]);

  const handleSave = () => {
    setGeminiApiKey(apiKey.trim() || null);
    onClose();
  };

  const handleClear = () => {
    setGeminiApiKey(null);
    setApiKey('');
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">User Preferences</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key size={16} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API Key"
                className="w-full pl-10 pr-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {apiKey && (
                <button 
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500"
                  title="Clear API Key"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Your API key is stored locally in your browser and used for AI features.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default UserPreferencesModal;
