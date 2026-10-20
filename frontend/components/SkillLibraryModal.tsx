"use client";
import { useState } from "react";

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  installed: boolean;
  enabled?: boolean;
}

interface SkillLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_SKILLS: Skill[] = [
  { id: "1", name: "Web Search", category: "Research", description: "Search the web for information", icon: "🔍", installed: true, enabled: true },
  { id: "2", name: "Code Interpreter", category: "Development", description: "Execute Python code", icon: "🐍", installed: true, enabled: true },
  { id: "3", name: "Image Generator", category: "Creative", description: "Generate AI images", icon: "🎨", installed: false },
  { id: "4", name: "PDF Reader", category: "Document", description: "Extract text from PDFs", icon: "📄", installed: true, enabled: false },
  { id: "5", name: "Calendar Sync", category: "Productivity", description: "Sync with Google Calendar", icon: "📅", installed: false },
  { id: "6", name: "Email Assistant", category: "Communication", description: "Draft and send emails", icon: "✉️", installed: false },
  { id: "7", name: "Data Analyzer", category: "Business", description: "Analyze CSV and Excel files", icon: "📊", installed: false },
  { id: "8", name: "Voice Transcriber", category: "Productivity", description: "Transcribe audio to text", icon: "🎤", installed: false },
];

const CATEGORIES = ["All", "Productivity", "Development", "Creative", "Business", "Document", "Communication", "Research", "Automation"];

export default function SkillLibraryModal({ isOpen, onClose }: SkillLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"browse" | "upload" | "create">("browse");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [skills, setSkills] = useState(DEMO_SKILLS);

  if (!isOpen) return null;

  const installedSkills = skills.filter(s => s.installed);
  const filteredSkills = skills.filter(s => {
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleSkill = (id: string) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleInstallSkill = (id: string) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, installed: true, enabled: true } : s));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Panel - Installed Skills */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Skills Installed</h3>
            <p className="text-sm text-gray-600">{installedSkills.length} active tools</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {installedSkills.map(skill => (
              <div key={skill.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{skill.icon}</span>
                    <span className="font-semibold text-sm text-gray-900">{skill.name}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skill.enabled}
                      onChange={() => handleToggleSkill(skill.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-600">{skill.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Skill Library</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 flex gap-6">
            {[
              { id: "browse", label: "Browse" },
              { id: "upload", label: "Upload" },
              { id: "create", label: "Create" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "browse" && (
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search skills..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === cat
                          ? "bg-green-100 text-green-700 border-2 border-green-500"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {filteredSkills.map(skill => (
                    <div key={skill.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl">{skill.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{skill.name}</h4>
                          <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                            {skill.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{skill.description}</p>
                      {skill.installed ? (
                        <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Installed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInstallSkill(skill.id)}
                          className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                          + Add Skill
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "upload" && (
              <div className="space-y-6">
                {/* Dropzone */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors cursor-pointer">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop your .skill or .zip file here</h3>
                  <p className="text-sm text-gray-600 mb-4">or click to browse</p>
                  <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                    Choose File
                  </button>
                </div>

                {/* GitHub Import */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-sm text-gray-500 font-medium">OR IMPORT FROM GITHUB</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://github.com/owner/repo"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors">
                      Import
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "create" && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Create Custom Skill</h3>
                  <p className="text-sm text-blue-700">Build your own AI skill with custom prompts and behaviors</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
                    <input
                      type="text"
                      placeholder="My Custom Skill"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      placeholder="What does this skill do?"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
                    <textarea
                      placeholder="You are an AI assistant that..."
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    />
                  </div>

                  <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors">
                    Create Skill
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
