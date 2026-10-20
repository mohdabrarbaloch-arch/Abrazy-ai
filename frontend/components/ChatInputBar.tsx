"use client";
import React, { useState } from "react";

interface ChatInputBarProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: () => void;
  onOpenActionHub?: () => void;
  onOpenSkillLibrary: () => void;
  onOpenConnectors: () => void;
  onToggleStudio?: () => void;
  studioEnabled?: boolean;
  onTriggerVoice?: () => void;
  isRecording?: boolean;
  onAttachFile?: () => void;
  onModeChange?: (mode: "instant" | "auto") => void;
}

export default function ChatInputBar({
  messageInput,
  setMessageInput,
  onSendMessage,
  onOpenActionHub,
  onOpenSkillLibrary,
  onOpenConnectors,
  onToggleStudio,
  studioEnabled = false,
  onTriggerVoice,
  isRecording = false,
  onAttachFile,
  onModeChange,
}: ChatInputBarProps) {
  const [mode, setMode] = useState<"instant" | "auto">("instant");
  const [showModeMenu, setShowModeMenu] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Plus Button - Action Hub */}
          {onOpenActionHub && (
            <button
              onClick={onOpenActionHub}
              className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Action Hub"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}

          {/* Skills Button */}
          <button
            onClick={onOpenSkillLibrary}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Skills Library"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Connectors / Plug Button */}
          <button
            onClick={onOpenConnectors}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Connectors (1551+ apps)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22v-5" />
              <path d="M9 8V2" />
              <path d="M15 2v6" />
              <path d="M18 8v5a6 6 0 0 1-12 0V8z" />
            </svg>
          </button>
        </div>

        {/* Message Input Field */}
        <div className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-500"
          />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Mode Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModeMenu(!showModeMenu)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors"
              title="Agent Mode"
            >
              {mode === "instant" ? "Instant" : "Auto"}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showModeMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                <button
                  onClick={() => {
                    setMode("instant");
                    onModeChange?.("instant");
                    setShowModeMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    mode === "instant"
                      ? "bg-emerald-50 text-[#00D35A] font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  ⚡ Instant
                </button>
                <button
                  onClick={() => {
                    setMode("auto");
                    onModeChange?.("auto");
                    setShowModeMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    mode === "auto"
                      ? "bg-emerald-50 text-[#00D35A] font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  🤖 Auto
                </button>
              </div>
            )}
          </div>

          {/* Studio Toggle */}
          {onToggleStudio && (
            <button
              onClick={onToggleStudio}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                studioEnabled
                  ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="Studio Mode"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </button>
          )}

          {/* Audio / Voice Recording Button */}
          <button
            type="button"
            onClick={onTriggerVoice}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            title={isRecording ? "Stop Recording" : "Voice Input"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Text Format */}
          <button
            type="button"
            onClick={() => setMessageInput(messageInput + "\n")}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            title="New Line (Shift+Enter)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          {/* Emoji */}
          <button
            type="button"
            onClick={() => setMessageInput(messageInput + " ✨")}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors text-lg"
            title="Emoji"
          >
            😊
          </button>

          {/* Send / Microphone Button */}
          {messageInput.trim() ? (
            <button
              type="button"
              onClick={onSendMessage}
              className="w-10 h-10 flex items-center justify-center bg-[#00D35A] hover:bg-[#00be51] rounded-full text-white transition-all shadow-sm active:scale-95"
              title="Send Message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={onTriggerVoice}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse shadow-md"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
              title="Voice Message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
