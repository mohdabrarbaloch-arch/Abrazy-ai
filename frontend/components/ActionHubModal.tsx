"use client";
import React, { useState } from "react";
import {
  FileUp,
  Image as ImageIcon,
  Mic,
  Video,
  Code,
  FileText,
  Table as TableIcon,
  GitBranch,
  Search,
  Calculator,
  Languages,
  Camera,
  Layers,
  Folder,
  X,
  Sparkles,
  Wrench,
  Check,
} from "lucide-react";

interface ActionHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionSelect?: (actionId: string) => void;
}

interface Action {
  id: string;
  name: string;
  description: string;
  category: "file" | "media" | "template" | "tool";
  iconComponent: React.ComponentType<{ className?: string }>;
}

export default function ActionHubModal({ isOpen, onClose, onActionSelect }: ActionHubModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const actions: Action[] = [
    // File Actions
    {
      id: "upload_file",
      name: "Upload Document",
      description: "Attach PDF, DOCX, CSV, or code files for instant AI parsing",
      category: "file",
      iconComponent: FileUp,
    },
    {
      id: "upload_image",
      name: "Upload Image",
      description: "Add design mockups, diagrams, or screenshots to your conversation",
      category: "media",
      iconComponent: ImageIcon,
    },
    {
      id: "record_audio",
      name: "Record Voice Note",
      description: "Dictate voice prompt with automatic Urdu/English transcription",
      category: "media",
      iconComponent: Mic,
    },
    {
      id: "record_video",
      name: "Record Video Clip",
      description: "Screen record or camera message for multimodal AI analysis",
      category: "media",
      iconComponent: Video,
    },
    // Template Actions
    {
      id: "table_template",
      name: "Markdown Table",
      description: "Insert a pre-formatted markdown comparison table",
      category: "template",
      iconComponent: TableIcon,
    },
    {
      id: "diagram_template",
      name: "Mermaid Flowchart",
      description: "Generate system architecture diagram with Mermaid.js syntax",
      category: "template",
      iconComponent: GitBranch,
    },
    {
      id: "code_template",
      name: "Code Snippet",
      description: "Insert Python or TypeScript scaffold for code review",
      category: "template",
      iconComponent: Code,
    },
    {
      id: "markdown_template",
      name: "Technical Brief",
      description: "Create an executive specification document template",
      category: "template",
      iconComponent: FileText,
    },
    // Tool Actions
    {
      id: "web_search",
      name: "Live Web Search",
      description: "Query real-time web sources and synthesize citations",
      category: "tool",
      iconComponent: Search,
    },
    {
      id: "calculator",
      name: "Financial Calculator",
      description: "Compute compound interest, currency conversions, and math formulas",
      category: "tool",
      iconComponent: Calculator,
    },
    {
      id: "translator",
      name: "Bilingual Translator",
      description: "Translate high-context text between English, Urdu, and Arabic",
      category: "tool",
      iconComponent: Languages,
    },
    {
      id: "screenshot",
      name: "Viewport Screenshot",
      description: "Capture active webpage state and inspect UI layout elements",
      category: "tool",
      iconComponent: Camera,
    },
  ];

  const categories = [
    { id: "all", name: "All Actions", iconComponent: Sparkles },
    { id: "template", name: "Templates", iconComponent: FileText },
    { id: "tool", name: "Agent Tools", iconComponent: Wrench },
    { id: "file", name: "Files", iconComponent: Folder },
    { id: "media", name: "Media", iconComponent: Video },
  ];

  const filteredActions = actions.filter((action) => {
    const matchesSearch =
      searchQuery === "" ||
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in" onClick={onClose}>
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[82vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/90 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#00D35A]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Action Hub</h2>
                <p className="text-xs text-slate-500">Insert smart templates, attachments, and autonomous tools</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions (e.g. Table, Diagram, Search, Calculator)..."
              className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00D35A] focus:bg-white transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-0.5">
            {categories.map((category) => {
              const IconComp = category.iconComponent;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#00D35A] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredActions.map((action) => {
              const IconComp = action.iconComponent;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className="p-3.5 bg-white hover:bg-emerald-50/40 rounded-2xl text-left transition-all border border-slate-200/90 hover:border-[#00D35A] shadow-xs hover:shadow-md group flex items-start gap-3 active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-[#eaf8ee] flex items-center justify-center flex-shrink-0 transition">
                    <IconComp className="w-5 h-5 text-slate-600 group-hover:text-[#00D35A] transition" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#00D35A] transition">
                      {action.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredActions.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <h3 className="text-xs font-bold text-slate-700">No actions found</h3>
              <p className="text-[11px] text-slate-400 mt-1">Try searching with another keyword like &quot;table&quot; or &quot;search&quot;</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-[11px] text-slate-500">
          <span>Click any card to immediately insert template into chat</span>
          <span className="font-semibold text-slate-600">Tip: Shift+Enter for newlines</span>
        </div>
      </div>
    </div>
  );
}
