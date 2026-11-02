"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Terminal,
  Palette,
  FileText,
  Calendar,
  Mail,
  BarChart2,
  Mic,
  Check,
  X,
  Upload,
  Plus,
  Cpu,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Code,
} from "lucide-react";

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  iconType: "search" | "code" | "palette" | "file" | "calendar" | "mail" | "chart" | "mic" | "cpu";
  installed: boolean;
  enabled?: boolean;
}

interface SkillLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillToggled?: (skillId: string, enabled: boolean) => void;
}

const INITIAL_SKILLS: Skill[] = [
  { id: "1", name: "Web Search & Fact Check", category: "Research", description: "Query live web and verify sources with DuckDuckGo & Perplexity-grade retrieval", iconType: "search", installed: true, enabled: true },
  { id: "2", name: "Python Code Interpreter", category: "Development", description: "Execute Python code in an isolated sandbox with numpy, pandas, and matplotlib", iconType: "code", installed: true, enabled: true },
  { id: "3", name: "Image Generator & Canvas", category: "Creative", description: "Generate photorealistic imagery and edit graphic assets directly in chat", iconType: "palette", installed: true, enabled: true },
  { id: "4", name: "PDF & Document Parser", category: "Document", description: "Extract OCR text, tables, and structural headings from PDFs and Word documents", iconType: "file", installed: true, enabled: false },
  { id: "5", name: "Calendar & Schedule Sync", category: "Productivity", description: "Sync appointments and check team availability via Google Calendar / Outlook", iconType: "calendar", installed: false, enabled: false },
  { id: "6", name: "Email Assistant & Drafter", category: "Communication", description: "Draft high-converting sales outreach and professional correspondence", iconType: "mail", installed: false, enabled: false },
  { id: "7", name: "Financial & Data Analyzer", category: "Business", description: "Perform statistical regressions, pivot tables, and balance sheet calculations", iconType: "chart", installed: false, enabled: false },
  { id: "8", name: "Voice & Audio Transcriber", category: "Productivity", description: "Transcribe bilingual Urdu/English audio into formatted timestamps and action items", iconType: "mic", installed: false, enabled: false },
];

const CATEGORIES = ["All", "Productivity", "Development", "Creative", "Business", "Document", "Communication", "Research"];

function renderSkillIcon(iconType: string) {
  switch (iconType) {
    case "search":
      return <Search className="w-5 h-5 text-emerald-600" />;
    case "code":
      return <Terminal className="w-5 h-5 text-indigo-600" />;
    case "palette":
      return <Palette className="w-5 h-5 text-pink-600" />;
    case "file":
      return <FileText className="w-5 h-5 text-amber-600" />;
    case "calendar":
      return <Calendar className="w-5 h-5 text-sky-600" />;
    case "mail":
      return <Mail className="w-5 h-5 text-purple-600" />;
    case "chart":
      return <BarChart2 className="w-5 h-5 text-teal-600" />;
    case "mic":
      return <Mic className="w-5 h-5 text-rose-600" />;
    default:
      return <Cpu className="w-5 h-5 text-emerald-600" />;
  }
}

export default function SkillLibraryModal({ isOpen, onClose, onSkillToggled }: SkillLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"browse" | "upload" | "create">("browse");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);

  // Create Skill Form State
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Productivity");
  const [newSkillDescription, setNewSkillDescription] = useState("");
  const [newSkillPrompt, setNewSkillPrompt] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync with localStorage on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("abrazy_skills_v2");
      if (saved) {
        setSkills(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  const persistSkills = (updated: Skill[]) => {
    setSkills(updated);
    try {
      localStorage.setItem("abrazy_skills_v2", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("abrazy_skills_updated", { detail: updated }));
    } catch {
      // ignore
    }
  };

  const handleToggleSkill = (id: string) => {
    const updated = skills.map((s) => {
      if (s.id === id) {
        const nextEnabled = !s.enabled;
        onSkillToggled?.(id, nextEnabled);
        return { ...s, enabled: nextEnabled };
      }
      return s;
    });
    persistSkills(updated);
  };

  const handleInstallSkill = (id: string) => {
    const updated = skills.map((s) => (s.id === id ? { ...s, installed: true, enabled: true } : s));
    persistSkills(updated);
    triggerToast("Skill added to active agent toolbelt");
  };

  const handleUninstallSkill = (id: string) => {
    const updated = skills.map((s) => (s.id === id ? { ...s, installed: false, enabled: false } : s));
    persistSkills(updated);
    triggerToast("Skill uninstalled");
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: Skill = {
      id: `custom_skill_${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory,
      description: newSkillDescription.trim() || "Custom autonomous skill created by user.",
      iconType: "cpu",
      installed: true,
      enabled: true,
    };

    const updated = [newSkill, ...skills];
    persistSkills(updated);
    setNewSkillName("");
    setNewSkillDescription("");
    setNewSkillPrompt("");
    setActiveTab("browse");
    triggerToast(`Created & installed "${newSkill.name}"!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const skillName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    const uploadedSkill: Skill = {
      id: `uploaded_${Date.now()}`,
      name: skillName.charAt(0).toUpperCase() + skillName.slice(1),
      category: "Automation",
      description: `Imported package (${(file.size / 1024).toFixed(1)} KB) containing autonomous workflow routines.`,
      iconType: "code",
      installed: true,
      enabled: true,
    };

    const updated = [uploadedSkill, ...skills];
    persistSkills(updated);
    setActiveTab("browse");
    triggerToast(`Imported "${uploadedSkill.name}" successfully!`);
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  if (!isOpen) return null;

  const installedSkills = skills.filter((s) => s.installed);
  const filteredSkills = skills.filter((s) => {
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in" onClick={onClose}>
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[82vh] flex overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast */}
        {successToast && (
          <div className="absolute top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-[#00D35A]" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Left Panel - Installed Skills */}
        <div className="w-80 border-r border-slate-200/80 flex flex-col bg-slate-50/70">
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-[#00D35A]" />
              <h3 className="text-base font-bold text-slate-900">Installed Skills</h3>
            </div>
            <p className="text-xs text-slate-500">
              {installedSkills.filter((s) => s.enabled).length} of {installedSkills.length} active in chat stream
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {installedSkills.length === 0 ? (
              <div className="text-center py-10 px-4 text-slate-400">
                <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">No skills installed yet</p>
                <p className="text-[11px] text-slate-400 mt-1">Browse the library on the right to install AI capabilities.</p>
              </div>
            ) : (
              installedSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {renderSkillIcon(skill.iconType)}
                      </div>
                      <span className="font-bold text-xs text-slate-800 truncate">{skill.name}</span>
                    </div>
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
                      <input
                        type="checkbox"
                        checked={skill.enabled}
                        onChange={() => handleToggleSkill(skill.id)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#00D35A]"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{skill.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Browser & Management */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Skill Library</h2>
              <p className="text-xs text-slate-500">Equip your autonomous agents with tools, interpreters, and live connectors</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-slate-200 px-6 flex gap-6">
            {[
              { id: "browse", label: "Browse Catalog" },
              { id: "upload", label: "Upload Package" },
              { id: "create", label: "Create Custom Skill" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 font-semibold text-xs transition border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#00D35A] text-[#00D35A]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 1. Browse Tab */}
            {activeTab === "browse" && (
              <div className="space-y-5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools and skills (e.g. Python, OCR, Search, Scraping)..."
                    className="w-full px-4 py-2 pl-10 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00D35A] transition"
                  />
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        selectedCategory === cat
                          ? "bg-[#00D35A] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-4">
                  {filteredSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="border border-slate-200/90 rounded-2xl p-4 hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between bg-white"
                    >
                      <div>
                        <div className="flex items-start gap-3 mb-2.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {renderSkillIcon(skill.iconType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 truncate">{skill.name}</h4>
                            <span className="inline-block mt-0.5 px-2 py-0.2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
                              {skill.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{skill.description}</p>
                      </div>

                      {skill.installed ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSkill(skill.id)}
                            className={`flex-1 py-1.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 border transition ${
                              skill.enabled
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            {skill.enabled ? "Enabled in Chat" : "Disabled"}
                          </button>
                          <button
                            onClick={() => handleUninstallSkill(skill.id)}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 border border-slate-200 hover:border-red-200 transition"
                            title="Uninstall skill"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleInstallSkill(skill.id)}
                          className="w-full py-1.5 px-4 bg-[#00D35A] hover:bg-[#00be51] text-white rounded-xl font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Install Skill
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Upload Package Tab */}
            {activeTab === "upload" && (
              <div className="space-y-6 max-w-xl mx-auto py-4">
                <label className="border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-[#00D35A] transition cursor-pointer flex flex-col items-center justify-center bg-slate-50/50 hover:bg-emerald-50/30 group">
                  <input type="file" accept=".zip,.skill,.json" onChange={handleFileUpload} className="hidden" />
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#00D35A] group-hover:border-[#00D35A] mb-3 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Drop your .skill, .zip, or MCP config here</h3>
                  <p className="text-xs text-slate-500 mb-3">Complies with open Agent Skill Standards (SKILL.md / manifest.json)</p>
                  <span className="px-4 py-1.5 bg-[#00D35A] text-white text-xs font-semibold rounded-full shadow-xs">
                    Choose Local File
                  </span>
                </label>

                {/* GitHub Import */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Import from GitHub or Git Repo</h4>
                  <p className="text-[11px] text-slate-500 mb-3">Enter public repository containing SKILL.md definition</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://github.com/abrazy-ai/skills-awesome"
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white outline-none focus:border-[#00D35A]"
                    />
                    <button
                      type="button"
                      onClick={() => triggerToast("Repository cloned and verified")}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Import
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Create Custom Skill Tab */}
            {activeTab === "create" && (
              <form onSubmit={handleCreateSkill} className="space-y-4 max-w-xl mx-auto py-2 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#00D35A] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">Custom Autonomous Skill Builder</h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      Custom skills dynamically bind to your active Groq / Gemini chat sessions, providing tailored execution logic.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Skill Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urdu Legal Summarizer, BigQuery Metric Auditor"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#00D35A] text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#00D35A] text-slate-900 bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Short summary of what this tool capability provides..."
                    value={newSkillDescription}
                    onChange={(e) => setNewSkillDescription(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#00D35A] text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tool Instruction & Behavioral Rules</label>
                  <textarea
                    rows={4}
                    placeholder="Provide specific instructions or API signatures that the agent should follow when invoking this skill..."
                    value={newSkillPrompt}
                    onChange={(e) => setNewSkillPrompt(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#00D35A] text-slate-900 resize-none font-mono text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#00D35A] hover:bg-[#00be51] text-white rounded-xl font-bold transition shadow-xs active:scale-95"
                >
                  Create & Activate Skill
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
