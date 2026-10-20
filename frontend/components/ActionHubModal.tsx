"use client";
import { useState } from "react";

interface ActionHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionSelect?: (action: string) => void;
}

interface Action {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "file" | "media" | "template" | "tool";
}

export default function ActionHubModal({ isOpen, onClose, onActionSelect }: ActionHubModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const actions: Action[] = [
    // File Actions
    {
      id: "upload_file",
      name: "Upload File",
      description: "Upload documents, PDFs, or any file",
      icon: "📄",
      category: "file",
    },
    {
      id: "upload_image",
      name: "Upload Image",
      description: "Add images to your conversation",
      icon: "🖼️",
      category: "media",
    },
    {
      id: "record_audio",
      name: "Record Audio",
      description: "Record voice message or audio",
      icon: "🎤",
      category: "media",
    },
    {
      id: "record_video",
      name: "Record Video",
      description: "Record video message",
      icon: "🎥",
      category: "media",
    },
    // Template Actions
    {
      id: "code_template",
      name: "Code Snippet",
      description: "Insert code template",
      icon: "💻",
      category: "template",
    },
    {
      id: "markdown_template",
      name: "Markdown Doc",
      description: "Create markdown document",
      icon: "📝",
      category: "template",
    },
    {
      id: "table_template",
      name: "Table",
      description: "Insert formatted table",
      icon: "📊",
      category: "template",
    },
    {
      id: "diagram_template",
      name: "Diagram",
      description: "Create flowchart or diagram",
      icon: "📈",
      category: "template",
    },
    // Tool Actions
    {
      id: "web_search",
      name: "Web Search",
      description: "Search the web for information",
      icon: "🔍",
      category: "tool",
    },
    {
      id: "calculator",
      name: "Calculator",
      description: "Perform calculations",
      icon: "🔢",
      category: "tool",
    },
    {
      id: "translator",
      name: "Translator",
      description: "Translate text to any language",
      icon: "🌐",
      category: "tool",
    },
    {
      id: "screenshot",
      name: "Screenshot",
      description: "Take or paste screenshot",
      icon: "📸",
      category: "tool",
    },
  ];

  const categories = [
    { id: "all", name: "All", icon: "✨" },
    { id: "file", name: "Files", icon: "📁" },
    { id: "media", name: "Media", icon: "🎬" },
    { id: "template", name: "Templates", icon: "📋" },
    { id: "tool", name: "Tools", icon: "🛠️" },
  ];

  const filteredActions = actions.filter(action => {
    const matchesSearch = searchQuery === "" || 
      action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleActionClick = (actionId: string) => {
    onActionSelect?.(actionId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Action Hub</h2>
              <p className="text-sm text-slate-600 mt-1">Quick actions for your workflow</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions..."
              className="w-full px-4 py-2.5 pl-10 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00D35A] transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-[#00D35A] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            {filteredActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition-all hover:shadow-md group border border-transparent hover:border-[#00D35A]"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{action.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-[#00D35A] transition-colors">
                      {action.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredActions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No actions found</h3>
              <p className="text-sm text-slate-600">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-600 text-center">
            💡 Tip: Press <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-mono">Ctrl+K</kbd> to open Action Hub anytime
          </p>
        </div>
      </div>
    </div>
  );
}
