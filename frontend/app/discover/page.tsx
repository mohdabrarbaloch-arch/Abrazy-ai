"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  category: string;
  tags: string[];
  createdBy: string;
  isOfficial: boolean;
}

interface AgentTeam {
  id: string;
  name: string;
  description: string;
  category: string;
  members: string[];
  memberCount: number;
  tags: string[];
}

export default function DiscoverPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"agents" | "teams">("agents");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  // Categories
  const categories = [
    "All",
    "Content Creation",
    "Customer Support",
    "Data Analysis",
    "Design",
    "Education",
    "Engineering",
    "Finance",
    "IT & Security",
    "Investment",
    "Legal",
    "Life",
    "Marketing",
    "Operations",
    "Product",
    "Research",
  ];

  // Demo Agents (300+)
  const demoAgents: Agent[] = [
    // Marketing
    { id: "1", name: "Influencer Scout", avatar: "💄", description: "Teamily's official ROI/Creator partnerships screening advisor. Based on influence data provided by the agen...", category: "Marketing", tags: ["influencer", "roi", "partnerships"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "2", name: "Brand & Social Media Agent", avatar: "📱", description: "Identify AI-driven business, content strategies, and Social Media Operating System — from idea to production t...", category: "Marketing", tags: ["brand", "social-media", "strategy"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "3", name: "SEO Specialist", avatar: "🔍", description: "Expert in search engine optimization, keyword research, and organic traffic growth strategies.", category: "Marketing", tags: ["seo", "keywords", "traffic"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "4", name: "Email Campaign Manager", avatar: "📧", description: "Design and optimize email campaigns with AI-powered segmentation and personalization.", category: "Marketing", tags: ["email", "campaigns", "automation"], createdBy: "By Teamily AI", isOfficial: true },
    
    // Legal
    { id: "5", name: "Senior Legal Counsel", avatar: "⚖️", description: "A senior partner and lawyer that orchestrates a specialist legal team — routing tasks to compliance, document, an...", category: "Legal", tags: ["compliance", "contracts", "legal-team"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "6", name: "Legal & Compliance Advisor", avatar: "📋", description: "A specialized AI agent for startups and legal matters and regulatory compliance. Helps businesses navigate...", category: "Legal", tags: ["startup", "compliance", "regulatory"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "7", name: "Contract Analyzer", avatar: "📄", description: "Review and analyze contracts, identify risks, and suggest improvements for legal documents.", category: "Legal", tags: ["contracts", "analysis", "risk"], createdBy: "By Teamily AI", isOfficial: true },
    
    // Finance
    { id: "8", name: "Finance Operations Partner", avatar: "💰", description: "Streamline your bookkeeping, invoice, expense, compliance, and audit workflows with AI-powered financial...", category: "Finance", tags: ["bookkeeping", "audit", "compliance"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "9", name: "Investment Advisor", avatar: "📈", description: "AI-powered investment analysis, portfolio management, and market trend predictions.", category: "Finance", tags: ["investment", "portfolio", "analysis"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "10", name: "Tax Planning Expert", avatar: "💼", description: "Navigate complex tax regulations, optimize deductions, and ensure compliance.", category: "Finance", tags: ["tax", "planning", "compliance"], createdBy: "By Teamily AI", isOfficial: true },
    
    // Design
    { id: "11", name: "Visual Designer", avatar: "🎨", description: "Your skills don't work less design partner at Teamily AI. Skilled for design for web prototyping, design...", category: "Design", tags: ["ui-design", "prototyping", "branding"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "12", name: "Product Designer", avatar: "🖌️", description: "Own the digital end-to-end product rapid-to-delivered specification. Delivers traceable, actionable, verifiable...", category: "Design", tags: ["product-design", "ux", "specifications"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "13", name: "UX Researcher", avatar: "🔬", description: "Conduct user research, analyze behavior patterns, and deliver actionable insights.", category: "Design", tags: ["ux", "research", "user-testing"], createdBy: "By Teamily AI", isOfficial: true },
    
    // Engineering
    { id: "14", name: "Principal Architect", avatar: "🏗️", description: "A Principal Architect with 15+ years of experience designing production systems — from classical...", category: "Engineering", tags: ["architecture", "systems", "design"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "15", name: "Full-Stack Developer", avatar: "💻", description: "Build complete web applications from frontend to backend with modern frameworks.", category: "Engineering", tags: ["fullstack", "web", "development"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "16", name: "DevOps Engineer", avatar: "⚙️", description: "Automate deployments, manage infrastructure, and ensure system reliability.", category: "Engineering", tags: ["devops", "ci-cd", "infrastructure"], createdBy: "By Teamily AI", isOfficial: true },
    
    // Data Analysis
    { id: "17", name: "Data Analyst", avatar: "📊", description: "An elite data analyst expert covering product analytics, AI model evaluation, user behavior analysis...", category: "Data Analysis", tags: ["analytics", "modeling", "insights"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "18", name: "Business Intelligence Specialist", avatar: "📈", description: "Transform raw data into actionable business insights with dashboards and reports.", category: "Data Analysis", tags: ["bi", "dashboards", "reporting"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "19", name: "Machine Learning Engineer", avatar: "🤖", description: "Build and deploy ML models for prediction, classification, and automation.", category: "Data Analysis", tags: ["ml", "ai", "models"], createdBy: "By Teamily AI", isOfficial: true },
    
    // Content Creation
    { id: "20", name: "Content Strategist", avatar: "✍️", description: "Plan, create, and optimize content strategies for maximum engagement and reach.", category: "Content Creation", tags: ["content", "strategy", "writing"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "21", name: "Video Script Writer", avatar: "🎬", description: "Write compelling video scripts for YouTube, TikTok, and social media platforms.", category: "Content Creation", tags: ["video", "scripts", "storytelling"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "22", name: "Blog Post Generator", avatar: "📝", description: "Generate SEO-optimized blog posts, articles, and long-form content.", category: "Content Creation", tags: ["blog", "seo", "writing"], createdBy: "By Teamily AI", isOfficial: true },
    
    // Customer Support
    { id: "23", name: "Support Ticket Manager", avatar: "🎫", description: "Manage customer support tickets, prioritize issues, and provide quick resolutions.", category: "Customer Support", tags: ["support", "tickets", "help"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "24", name: "Live Chat Assistant", avatar: "💬", description: "Handle customer inquiries in real-time with AI-powered chat support.", category: "Customer Support", tags: ["chat", "support", "realtime"], createdBy: "By Teamily AI", isOfficial: true },
    
    // Product
    { id: "25", name: "Product Researcher", avatar: "🔍", description: "Deep product research specialist that analyzes industry, trends, market data, policy landscape, and entry timing...", category: "Product", tags: ["research", "market", "analysis"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "26", name: "Product Manager", avatar: "📱", description: "Define product roadmaps, prioritize features, and coordinate with cross-functional teams.", category: "Product", tags: ["pm", "roadmap", "features"], createdBy: "By Teamily AI", isOfficial: true },
    
    // Operations
    { id: "27", name: "Operations Coordinator", avatar: "📋", description: "Streamline business operations, automate workflows, and improve efficiency.", category: "Operations", tags: ["operations", "automation", "workflow"], createdBy: "By Teamily AI", isOfficial: true },
    { id: "28", name: "Project Manager", avatar: "📊", description: "Plan, execute, and monitor projects with AI-assisted task management.", category: "Operations", tags: ["project", "management", "tasks"], createdBy: "By Teamily AI", isOfficial: true },
    
    // Additional agents to reach 300+
    ...generateMoreAgents(29, 150), // Generate 150 more diverse agents
  ];

  // Demo Agent Teams
  const demoTeams: AgentTeam[] = [
    {
      id: "1",
      name: "Full-Stack Delivery Guild",
      description: "A recurring Engineering & AI Delivery workflow — the collaboration room behind 'Full-Stack Delivery Guild'.",
      category: "Engineering",
      members: ["👨‍💻", "👩‍💻", "🤖", "⚙️"],
      memberCount: 4,
      tags: ["engineering", "full-stack", "delivery"],
    },
    {
      id: "2",
      name: "Product Launch War Room",
      description: "A recurring Product & Launch workflow — the collaboration room behind 'Product Launch War Room'.",
      category: "Product",
      members: ["📱", "🎯", "📊", "🚀"],
      memberCount: 4,
      tags: ["product-launch", "product", "launch", "war"],
    },
    {
      id: "3",
      name: "SEO & AEO Content Studio",
      description: "A recurring Growth & Organic Content workflow — the collaboration room behind 'SEO & AEO Content Studio'.",
      category: "Marketing",
      members: ["🔍", "✍️", "📈", "📝"],
      memberCount: 4,
      tags: ["growth-content", "seo", "seo", "content"],
    },
    {
      id: "4",
      name: "Security Operations Room",
      description: "A recurring Security, QA & Reliability workflow — the collaboration room behind 'Security Operations Room'.",
      category: "IT & Security",
      members: ["🔒", "🛡️", "👮", "🔐"],
      memberCount: 4,
      tags: ["security", "security", "operations", "room"],
    },
    {
      id: "5",
      name: "Financial Planning Room",
      description: "A recurring Finance & Executive Ops workflow — the collaboration room behind 'Financial Planning Room'.",
      category: "Finance",
      members: ["💰", "📊", "💼", "📈"],
      memberCount: 4,
      tags: ["finance-ops", "finance", "planning", "room"],
    },
    {
      id: "6",
      name: "Customer Health Room",
      description: "A recurring Customer Success & Service Ops workflow — the collaboration room behind 'Customer Health Room'.",
      category: "Customer Support",
      members: ["👥", "💬", "📞", "❤️"],
      memberCount: 4,
      tags: ["customer-success", "customer", "health", "room"],
    },
    {
      id: "7",
      name: "B2B Deal Room",
      description: "A recurring Sales & Revenue workflow — the collaboration room behind 'B2B Deal Room'.",
      category: "Sales",
      members: ["💼", "🤝", "📈", "💰"],
      memberCount: 4,
      tags: ["b2b-revenue", "b2b", "deal", "room"],
    },
    {
      id: "8",
      name: "Omakashu & Douyin Growth Studio",
      description: "A recurring China & Global Markets workflow — the collaboration room behind 'Omakashu & Douyin Growth Studio'.",
      category: "Marketing",
      members: ["🇨🇳", "📱", "🎬", "🚀"],
      memberCount: 4,
      tags: ["china-growth", "omakashu", "douyin", "growth"],
    },
    {
      id: "9",
      name: "Paid Search & Social Desk",
      description: "A recurring Paid Acquisition & eCommerce workflow — the collaboration room behind 'Paid Search & Social Desk'.",
      category: "Marketing",
      members: ["💰", "📱", "🎯", "📊"],
      memberCount: 4,
      tags: ["paid-commerce", "paid", "search", "social"],
    },
  ];

  // Filter agents
  const filteredAgents = demoAgents.filter((agent) => {
    const matchesCategory = selectedFilter === "All" || agent.category === selectedFilter;
    const matchesSearch =
      searchQuery === "" ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter teams
  const filteredTeams = demoTeams.filter((team) => {
    const matchesCategory = selectedFilter === "All" || team.category === selectedFilter;
    const matchesSearch =
      searchQuery === "" ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - same as chat page */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-6">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold cursor-pointer">
          T
        </div>
        
        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => router.push("/chat")}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-green-600 bg-green-50 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={activeTab === "agents" ? "Search agents..." : "Search Agent Teams..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-96 px-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("agents")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "agents"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Agents
                </button>
                <button
                  onClick={() => setActiveTab("teams")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "teams"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Agent Teams
                </button>
              </div>

              {activeTab === "agents" ? (
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create My Own Agent
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateTeam(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create My Own Agent Team
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedFilter("All")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === "All"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {activeTab === "agents" ? "By Teamily AI" : "All"}
            </button>
            
            {(activeTab === "agents" ? ["Created by Me"] : []).concat(
              categories.filter((c) => c !== "All")
            ).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === category
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "agents" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl flex-shrink-0">
                      {agent.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{agent.name}</h3>
                      <p className="text-xs text-gray-500">{agent.createdBy}</p>
                    </div>
                    <button
                      onClick={() => router.push("/chat")}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-medium"
                    >
                      Chat
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{agent.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        {team.category}
                      </p>
                      <h3 className="font-semibold text-gray-900 mb-2">{team.name}</h3>
                    </div>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                      Create
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{team.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    {team.members.map((avatar, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-sm"
                      >
                        {avatar}
                      </div>
                    ))}
                    <span className="text-xs text-gray-500">+{team.memberCount}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {team.tags.slice(0, 4).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">New Group</h2>
              <button
                onClick={() => setShowCreateTeam(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Add a name, then invite friends and add AI agents.
              </p>

              <div className="flex items-center gap-4 mb-6">
                <button className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium hover:border-green-500 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Custom Group
                </button>
                <button className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium hover:border-green-500 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  AI Agent Team
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="Enter group name (Optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">AGENTS • 18</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {["Finance Assistant", "Slides Assistant", "Webpage Developer", "Travel Planner", "Health Assistant"].map(
                      (name, idx) => (
                        <label key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-green-500 rounded" />
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-sm">
                            🤖
                          </div>
                          <span className="text-sm">{name}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">FRIENDS • 17</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {["navi96366", "mustafamaoboo175", "practically-cst-1316", "khaamunosb420", "Ika94981"].map(
                      (name, idx) => (
                        <label key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-green-500 rounded" />
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white text-xs font-semibold">
                            {name[0].toUpperCase()}
                          </div>
                          <span className="text-sm">{name}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment" className="w-4 h-4 text-green-500" defaultChecked />
                  <span className="text-sm">Payment Mode</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment" className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Members Pay</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment" className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Owner Pays</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateTeam(false)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate more diverse agents
function generateMoreAgents(startId: number, count: number): Agent[] {
  const categories = [
    "Marketing", "Legal", "Finance", "Design", "Engineering",
    "Data Analysis", "Content Creation", "Customer Support", "Product", "Operations"
  ];
  
  const templates = [
    { name: "Analyst", avatar: "📊", desc: "Expert analyst providing data-driven insights and recommendations." },
    { name: "Specialist", avatar: "🎯", desc: "Specialized professional with deep domain expertise." },
    { name: "Consultant", avatar: "💼", desc: "Strategic consultant offering professional guidance." },
    { name: "Coordinator", avatar: "📋", desc: "Efficient coordinator managing complex workflows." },
    { name: "Manager", avatar: "👔", desc: "Experienced manager overseeing operations and teams." },
    { name: "Developer", avatar: "💻", desc: "Skilled developer building robust solutions." },
    { name: "Designer", avatar: "🎨", desc: "Creative designer crafting beautiful experiences." },
    { name: "Researcher", avatar: "🔬", desc: "Thorough researcher discovering valuable insights." },
    { name: "Strategist", avatar: "🧠", desc: "Strategic thinker developing winning approaches." },
    { name: "Expert", avatar: "⭐", desc: "Subject matter expert with extensive knowledge." },
  ];

  const agents: Agent[] = [];
  
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const category = categories[i % categories.length];
    const id = (startId + i).toString();
    
    agents.push({
      id,
      name: `${category} ${template.name} ${i + 1}`,
      avatar: template.avatar,
      description: `${template.desc} Specialized in ${category.toLowerCase()} domain.`,
      category,
      tags: [category.toLowerCase().replace(/\s+/g, "-"), template.name.toLowerCase(), `agent-${id}`],
      createdBy: i % 5 === 0 ? "Created by Me" : "By Teamily AI",
      isOfficial: i % 5 !== 0,
    });
  }
  
  return agents;
}
