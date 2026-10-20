"use client";
import { useState } from "react";

interface ChatHeaderFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: () => void;
  agentName?: string;
  agentAvatar?: string;
}

export default function ChatHeaderFlyout({
  isOpen,
  onClose,
  onCreateGroup,
  agentName = "AI Assistant",
  agentAvatar = "🤖"
}: ChatHeaderFlyoutProps) {
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [pinToTop, setPinToTop] = useState(false);

  if (!isOpen) return null;

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear this chat history?")) {
      console.log("Clearing chat history...");
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Flyout Panel */}
      <div 
        className="fixed top-16 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Agent Info Header */}
        <div className="p-5 border-b border-gray-200 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
              {agentAvatar}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{agentName}</h3>
              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded mt-1">
                AI AGENT
              </span>
            </div>
          </div>
        </div>

        {/* Options Section */}
        <div className="p-4 space-y-3">
          {/* Create Group Button */}
          <button
            onClick={() => {
              onCreateGroup();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
          >
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-green-700 group-hover:text-green-800">Create New Group</span>
          </button>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {/* Auto-translate */}
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">🌐</span>
                <span className="text-sm font-medium text-gray-900">Auto-translate</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {/* Mute Notifications */}
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">🔕</span>
                <span className="text-sm font-medium text-gray-900">Mute Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={muteNotifications}
                  onChange={(e) => setMuteNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {/* Pin to Top */}
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">📌</span>
                <span className="text-sm font-medium text-gray-900">Pin to Top</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinToTop}
                  onChange={(e) => setPinToTop(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          {/* Danger Actions */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={handleClearChat}
              className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-sm font-medium">Clear Chat History</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
