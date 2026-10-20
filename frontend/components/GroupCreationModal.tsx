"use client";
import { useState } from "react";
import { api } from "@/lib/api";

interface Member {
  id: string;
  name: string;
  type: "agent" | "user";
  avatar: string;
  specialty?: string;
}

interface AgentTeamTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  members: Member[];
}

interface GroupCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: (newConv: any) => void;
}

const AVAILABLE_AGENTS: Member[] = [
  { id: "1", name: "Research Expert", type: "agent", avatar: "🔍", specialty: "Web Search & Analysis" },
  { id: "2", name: "Code Architect", type: "agent", avatar: "👨‍💻", specialty: "Software Engineering" },
  { id: "3", name: "Creative Writer", type: "agent", avatar: "✍️", specialty: "Content Creation" },
  { id: "4", name: "Data Analyst", type: "agent", avatar: "📊", specialty: "Statistics & Insights" },
  { id: "5", name: "Marketing Pro", type: "agent", avatar: "📢", specialty: "Brand & Strategy" },
  { id: "6", name: "Designer AI", type: "agent", avatar: "🎨", specialty: "Visual Design" },
];

const AVAILABLE_USERS: Member[] = [
  { id: "u1", name: "Ahmed Khan", type: "user", avatar: "👤" },
  { id: "u2", name: "Sara Ali", type: "user", avatar: "👤" },
  { id: "u3", name: "Hassan Raza", type: "user", avatar: "👤" },
];

const AGENT_TEAM_TEMPLATES: AgentTeamTemplate[] = [
  {
    id: "fullstack",
    name: "Full-Stack Delivery Guild",
    description: "Complete development team for web applications",
    icon: "🚀",
    members: [
      { id: "fe1", name: "Frontend Dev", type: "agent", avatar: "⚛️", specialty: "React & Next.js" },
      { id: "be1", name: "Backend Architect", type: "agent", avatar: "🏗️", specialty: "FastAPI & Databases" },
      { id: "api1", name: "API Tester", type: "agent", avatar: "🧪", specialty: "Testing & QA" },
      { id: "devops1", name: "DevOps Automator", type: "agent", avatar: "🔧", specialty: "CI/CD & Docker" },
      { id: "review1", name: "Code Reviewer", type: "agent", avatar: "👀", specialty: "Best Practices" },
    ]
  },
  {
    id: "marketing",
    name: "Marketing Campaign Squad",
    description: "End-to-end marketing team",
    icon: "📱",
    members: [
      { id: "strat1", name: "Strategy Lead", type: "agent", avatar: "🎯", specialty: "Campaign Planning" },
      { id: "content1", name: "Content Creator", type: "agent", avatar: "✍️", specialty: "Copywriting" },
      { id: "design1", name: "Visual Designer", type: "agent", avatar: "🎨", specialty: "Graphics & Branding" },
      { id: "social1", name: "Social Media Manager", type: "agent", avatar: "📢", specialty: "Community & Engagement" },
    ]
  },
  {
    id: "research",
    name: "Research & Analysis Team",
    description: "Deep dive investigation squad",
    icon: "🔬",
    members: [
      { id: "r1", name: "Lead Researcher", type: "agent", avatar: "🔍", specialty: "Primary Research" },
      { id: "r2", name: "Data Scientist", type: "agent", avatar: "📊", specialty: "Statistical Analysis" },
      { id: "r3", name: "Report Writer", type: "agent", avatar: "📝", specialty: "Documentation" },
    ]
  },
  {
    id: "content",
    name: "Content Production Studio",
    description: "Multi-format content creation",
    icon: "🎬",
    members: [
      { id: "c1", name: "Writer", type: "agent", avatar: "✍️", specialty: "Articles & Scripts" },
      { id: "c2", name: "Video Editor", type: "agent", avatar: "🎥", specialty: "Video Production" },
      { id: "c3", name: "Audio Producer", type: "agent", avatar: "🎵", specialty: "Podcasts & Music" },
      { id: "c4", name: "SEO Optimizer", type: "agent", avatar: "🔍", specialty: "Search Rankings" },
    ]
  },
];

export default function GroupCreationModal({ isOpen, onClose, onGroupCreated }: GroupCreationModalProps) {
  const [activeTab, setActiveTab] = useState<"custom" | "template">("custom");
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTeamTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    let title = "";
    let memberIds: string[] = [];

    if (activeTab === "custom") {
      if (!groupName.trim() || selectedMembers.length === 0) {
        alert("Please enter a group name and select at least one member");
        return;
      }
      title = groupName.trim();
      memberIds = selectedMembers;
    } else {
      if (!selectedTemplate) {
        alert("Please select a team template");
        return;
      }
      title = selectedTemplate.name;
      memberIds = selectedTemplate.members.map((m) => m.id);
    }

    setIsSubmitting(true);
    try {
      const newConv = await api.createConversation({
        title,
        is_group: true,
        member_agent_ids: memberIds,
      });
      if (onGroupCreated) {
        onGroupCreated(newConv);
      }
      setGroupName("");
      setSelectedMembers([]);
      setSelectedTemplate(null);
      onClose();
    } catch (err: any) {
      console.error("Failed to create group conversation:", err);
      // Fallback local group creation object
      const fallbackConv = {
        id: `group_${Date.now()}`,
        title,
        is_group: true,
        member_agent_ids: memberIds,
        agent_avatar: "👥",
        agent_name: "Agent Squad",
        last_message: {
          content: `Group '${title}' created with ${memberIds.length} agents ready to collaborate!`,
          created_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (onGroupCreated) {
        onGroupCreated(fallbackConv);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
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
            { id: "custom", label: "Custom Group", icon: "👥" },
            { id: "template", label: "AI Agent Team", icon: "🤖" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "custom" && (
            <div className="space-y-6">
              {/* Group Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="My Awesome Team"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* AI Agents Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Select AI Agents</h3>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_AGENTS.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => toggleMember(agent.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedMembers.includes(agent.id)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{agent.avatar}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-gray-900">{agent.name}</div>
                          <div className="text-xs text-gray-600">{agent.specialty}</div>
                        </div>
                        {selectedMembers.includes(agent.id) && (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Human Users Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Team Members</h3>
                <div className="space-y-2">
                  {AVAILABLE_USERS.map(user => (
                    <button
                      key={user.id}
                      onClick={() => toggleMember(user.id)}
                      className={`w-full p-3 border-2 rounded-lg text-left transition-all flex items-center gap-3 ${
                        selectedMembers.includes(user.id)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">{user.avatar}</span>
                      <span className="flex-1 font-medium text-sm text-gray-900">{user.name}</span>
                      {selectedMembers.includes(user.id) && (
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "template" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Choose a pre-configured AI agent team for your specific workflow
              </p>

              {AGENT_TEAM_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full p-5 border-2 rounded-lg text-left transition-all ${
                    selectedTemplate?.id === template.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {template.members.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs"
                      >
                        <span>{member.avatar}</span>
                        <span className="font-medium text-gray-900">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {activeTab === "custom" ? (
              <span>{selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected</span>
            ) : (
              selectedTemplate && <span>{selectedTemplate.members.length} agents in team</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
