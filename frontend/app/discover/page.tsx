"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavigationRail from "@/components/NavigationRail";
import { API_URL } from "@/lib/config";

interface Agent {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  description: string;
  category: string;
  tags: string[];
  createdBy: "official" | "custom";
  isOfficial?: boolean;
}

interface AgentTeam {
  id: string;
  name: string;
  description: string;
  category: string;
  avatars: string[];
  memberCount: number;
  tags: string[];
}

function DiscoverPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams ? searchParams.get("tab") : "agents";

  const [activeMainTab, setActiveMainTab] = useState<"agents" | "teams">(
    initialTab === "teams" ? "teams" : "agents"
  );
  const [sourceFilter, setSourceFilter] = useState<"official" | "custom">("official");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create Agent Modal state
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentCategory, setNewAgentCategory] = useState("Engineering");
  const [newAgentDescription, setNewAgentDescription] = useState("");
  const [newAgentAvatar, setNewAgentAvatar] = useState("🤖");
  const [newAgentAvatarBg, setNewAgentAvatarBg] = useState("bg-emerald-100/80");
  const [newAgentSystemPrompt, setNewAgentSystemPrompt] = useState("");
  const [newAgentModel, setNewAgentModel] = useState("Claude 3.5 Sonnet");
  const [isSubmittingAgent, setIsSubmittingAgent] = useState(false);

  // Category horizontal scroll ref
  const categoryScrollRef = useRef<HTMLDivElement>(null);

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
  ];

  // Official Agents matching reference screenshot from teamily.ai/discover?tab=agents
  const officialAgents: Agent[] = [
    {
      id: "agent_bookkeeper",
      name: "Bookkeeper & Controller",
      avatar: "📚",
      avatarBg: "bg-amber-100/80",
      description: "Expert bookkeeper and controller specializing in day-to-day accounting operations, financial reporting, and invoice reconciliation.",
      category: "Finance",
      tags: ["accounting", "bookkeeping", "finance", "audit"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_finance_ops",
      name: "Finance Operations Partner",
      avatar: "💼",
      avatarBg: "bg-rose-100/80",
      description: "Streamlines expense, accounting, treasury, compliance, and audit workflows with AI-powered financial precision.",
      category: "Finance",
      tags: ["treasury", "compliance", "expenses", "audit"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_event_finder",
      name: "AI Event Finder",
      avatar: "🚀",
      avatarBg: "bg-amber-100/90",
      description: "Weekly AI event scanner that discovers, curates, and broadcasts important AI events to the Teamily community.",
      category: "Operations",
      tags: ["events", "ai", "curation", "calendar"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_customer_service",
      name: "Customer Service",
      avatar: "🎧",
      avatarBg: "bg-emerald-100/80",
      description: "Friendly, professional customer service specialist for any industry — handling inquiries, complaints, and ticket resolution.",
      category: "Customer Support",
      tags: ["support", "tickets", "chat", "resolution"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_threat_intel",
      name: "Threat Intelligence Analyst",
      avatar: "🛡️",
      avatarBg: "bg-purple-100/80",
      description: "Cyber threat intelligence specialist who tracks adversary groups, maps attack campaigns to MITRE ATT&CK, and assesses risk.",
      category: "IT & Security",
      tags: ["cybersecurity", "threat-intel", "mitre", "infosec"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_compliance_auditor",
      name: "Compliance Auditor",
      avatar: "📋",
      avatarBg: "bg-lime-100/80",
      description: "Expert technical compliance auditor specializing in SOC 2, ISO 27001, HIPAA, and PCI-DSS audits and control testing.",
      category: "IT & Security",
      tags: ["soc2", "iso27001", "hipaa", "audit"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_security_architect",
      name: "Security Architect",
      avatar: "🏰",
      avatarBg: "bg-pink-100/80",
      description: "Expert security architect specializing in threat modeling, secure-by-design architecture, trust boundaries, and zero-trust systems.",
      category: "IT & Security",
      tags: ["zero-trust", "threat-modeling", "architecture"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_video_opt",
      name: "Video Optimization Specialist",
      avatar: "🎬",
      avatarBg: "bg-rose-100/80",
      description: "Video marketing strategist specializing in YouTube algorithm optimization, audience retention, and high-CTR hooks.",
      category: "Content Creation",
      tags: ["youtube", "video", "retention", "reels"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_brand_guardian",
      name: "Brand Guardian",
      avatar: "💎",
      avatarBg: "bg-indigo-100/80",
      description: "Expert brand strategist and guardian specializing in brand identity development, consistency enforcement, and tone of voice.",
      category: "Design",
      tags: ["branding", "identity", "guidelines", "design"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_whimsy_injector",
      name: "Whimsy Injector",
      avatar: "✨",
      avatarBg: "bg-fuchsia-100/80",
      description: "Expert creative specialist focused on adding personality, delight, and playful elements to brand copy and user journeys.",
      category: "Marketing",
      tags: ["creative", "copywriting", "delight", "whimsy"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_incident_responder",
      name: "Incident Responder",
      avatar: "🚨",
      avatarBg: "bg-cyan-100/80",
      description: "Digital forensics and incident response specialist who leads breach investigations, contains active threats, and hardens systems.",
      category: "IT & Security",
      tags: ["dfir", "forensics", "incident-response", "breach"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_secops_engineer",
      name: "Senior SecOps Engineer",
      avatar: "💻",
      avatarBg: "bg-amber-100/80",
      description: "Defensive application security specialist who scans every code submission for secrets, vulnerable dependencies, and logic flaws.",
      category: "IT & Security",
      tags: ["secops", "sast", "dependencies", "appsec"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_threat_detection",
      name: "Threat Detection Engineer",
      avatar: "📡",
      avatarBg: "bg-teal-100/80",
      description: "Expert detection engineer specializing in SIEM rule development, MITRE ATT&CK coverage mapping, and alert triage automation.",
      category: "IT & Security",
      tags: ["siem", "detection", "rules", "triage"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_influencer_scout",
      name: "Influencer Scout",
      avatar: "📱",
      avatarBg: "bg-pink-100/80",
      description: "Teamily's official KOL/Creator partnership screening advisor. Based on influencer metrics, engagement ratios, and brand affinity.",
      category: "Marketing",
      tags: ["kol", "creator", "influencer", "outreach"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_game_designer",
      name: "Game Designer",
      avatar: "🎮",
      avatarBg: "bg-yellow-100/80",
      description: "Systems and mechanics architect - Masters GDD authorship, player psychology, economy balancing, and gameplay loops.",
      category: "Engineering",
      tags: ["gamedev", "economy", "mechanics", "gdd"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_appsec_engineer",
      name: "Application Security Engineer",
      avatar: "🔒",
      avatarBg: "bg-sky-100/80",
      description: "AppSec specialist who secures the software development lifecycle through threat modeling, SAST/DAST reviews, and security pipelines.",
      category: "IT & Security",
      tags: ["appsec", "dast", "threat-model", "cicd"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_penetration_tester",
      name: "Penetration Tester",
      avatar: "🎯",
      avatarBg: "bg-rose-100/80",
      description: "Offensive security specialist conducting authorized penetration tests, red team operations, and vulnerability assessments.",
      category: "IT & Security",
      tags: ["redteam", "pentest", "exploit", "cve"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_cloud_sec_architect",
      name: "Cloud Security Architect",
      avatar: "☁️",
      avatarBg: "bg-amber-100/80",
      description: "Cloud-native security specialist designing zero trust architectures, implementing defense-in-depth across AWS, GCP, and Azure.",
      category: "IT & Security",
      tags: ["cloud", "aws", "gcp", "iam", "kubernetes"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_content_strategist",
      name: "Content Strategist & SEO",
      avatar: "✍️",
      avatarBg: "bg-teal-100/80",
      description: "Strategic growth hacker driving search intent analysis, programmatic SEO architectures, and viral blog conversions.",
      category: "Content Creation",
      tags: ["seo", "blogging", "intent", "growth"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_legal_counsel",
      name: "Legal Contract Reviewer",
      avatar: "⚖️",
      avatarBg: "bg-blue-100/80",
      description: "Analyzes NDAs, master services agreements, enterprise software licenses, and liability clauses with strict jurisdictional accuracy.",
      category: "Legal",
      tags: ["contracts", "nda", "msa", "law"],
      createdBy: "official",
      isOfficial: true,
    },
    {
      id: "agent_data_analyst",
      name: "Lead Data Scientist",
      avatar: "📊",
      avatarBg: "bg-purple-100/80",
      description: "Transforms messy raw data into predictive machine learning pipelines, BigQuery SQL data models, and executive dashboards.",
      category: "Data Analysis",
      tags: ["sql", "python", "machine-learning", "dashboards"],
      createdBy: "official",
      isOfficial: true,
    },
  ];

  // Custom User Agents (Persistent in state + LocalStorage)
  const [customAgents, setCustomAgents] = useState<Agent[]>([
    {
      id: "custom_1",
      name: "Python Slideshow Producer",
      avatar: "🐍",
      avatarBg: "bg-emerald-100/80",
      description: "Generates step-by-step programming tutorial slides with Urdu voiceover phonemes and local ffmpeg compilation.",
      category: "Engineering",
      tags: ["python", "ffmpeg", "slideshow"],
      createdBy: "custom",
    },
    {
      id: "custom_2",
      name: "Reels & Shorts Hook Editor",
      avatar: "✂️",
      avatarBg: "bg-pink-100/80",
      description: "Cuts long-form technical talks into 15-second high-energy vertical teasers with dynamic subtitle animations.",
      category: "Content Creation",
      tags: ["reels", "tiktok", "hooks"],
      createdBy: "custom",
    },
  ]);

  // Load custom agents from Database + LocalStorage fallback on mount
  useEffect(() => {
    const fetchCustomAgents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/agents?is_official=false`);
        if (res.ok) {
          const dbAgents = await res.json();
          if (Array.isArray(dbAgents)) {
            const mapped: Agent[] = dbAgents.map((a: any) => ({
              id: a.id,
              name: a.name,
              category: a.category || "General",
              description: a.description || "",
              avatar: a.avatar || "🤖",
              avatarBg: "bg-emerald-100/80",
              tags: a.tags || ["custom-agent"],
              createdBy: "custom",
            }));

            // Sync into state and cache in localStorage
            setCustomAgents(mapped);
            try {
              localStorage.setItem("abrazy_custom_agents", JSON.stringify(mapped));
            } catch {
              // ignore
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Backend unavailable, using cached local agents:", err);
      }

      // Local storage fallback if backend is offline
      try {
        const saved = localStorage.getItem("abrazy_custom_agents");
        if (saved) {
          setCustomAgents(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    };

    fetchCustomAgents();
  }, []);

  // Save custom agents to LocalStorage
  const saveCustomAgents = (agents: Agent[]) => {
    setCustomAgents(agents);
    try {
      localStorage.setItem("abrazy_custom_agents", JSON.stringify(agents));
    } catch {
      // ignore
    }
  };

  // Delete custom agent from Database and Local State
  const handleDeleteAgent = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/api/agents/${agentId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Could not delete from backend:", err);
    }

    const updated = customAgents.filter((a) => a.id !== agentId);
    saveCustomAgents(updated);
    showToast("Agent deleted from database");
  };

  // Demo Teams
  const agentTeams: AgentTeam[] = [
    {
      id: "team_1",
      name: "Full-Stack Delivery Guild",
      description: "Collaborative engineering cluster combining System Architect, Code Reviewer, and Automated DevOps CI/CD pipeline agent.",
      category: "Engineering",
      avatars: ["🏗️", "💻", "⚙️", "🔒"],
      memberCount: 4,
      tags: ["fullstack", "architecture", "devops"],
    },
    {
      id: "team_2",
      name: "Product Launch War Room",
      description: "High-cadence team executing GTM product launches, App Store asset preparation, and multi-channel marketing campaigns.",
      category: "Marketing",
      avatars: ["🚀", "📱", "🎯", "📊"],
      memberCount: 4,
      tags: ["gtm", "launch", "marketing"],
    },
    {
      id: "team_3",
      name: "SEO & AEO Content Studio",
      description: "Generates high-ranking programmatic blog posts, Answer Engine Optimization (AEO) citations, and video teasers.",
      category: "Content Creation",
      avatars: ["✍️", "🔍", "📈", "🎬"],
      memberCount: 4,
      tags: ["seo", "content", "aeo"],
    },
    {
      id: "team_4",
      name: "Security Operations Room",
      description: "Continuous 24/7 security cluster monitoring attack vectors, zero-day CVE advisories, and dependency vulnerabilities.",
      category: "IT & Security",
      avatars: ["🛡️", "🚨", "📡", "💻"],
      memberCount: 4,
      tags: ["secops", "threats", "triage"],
    },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Handle Chat Navigation
  const handleOpenChat = (agent: Agent) => {
    router.push(
      `/chat?agentId=${encodeURIComponent(agent.id)}&agentName=${encodeURIComponent(
        agent.name
      )}&agentAvatar=${encodeURIComponent(agent.avatar)}`
    );
  };

  // Handle Agent Creation with Database Sync
  const handleCreateAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) {
      showToast("Please enter an agent name");
      return;
    }

    setIsSubmittingAgent(true);
    let assignedId = `custom_${Date.now()}`;

    // Attempt to persist to backend API
    try {
      const res = await fetch(`${API_URL}/api/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAgentName.trim(),
          category: newAgentCategory,
          description: newAgentDescription.trim() || `Specialized autonomous agent for ${newAgentCategory} tasks.`,
          avatar: newAgentAvatar,
          system_prompt: newAgentSystemPrompt || `You are ${newAgentName.trim()}, a specialized autonomous AI agent.`,
          model: newAgentModel,
          is_public: false,
        }),
      });

      if (res.ok) {
        const savedDbAgent = await res.json();
        if (savedDbAgent && savedDbAgent.id) {
          assignedId = savedDbAgent.id;
        }
      }
    } catch (err) {
      console.warn("Backend unavailable, saving locally:", err);
    }

    const createdAgent: Agent = {
      id: assignedId,
      name: newAgentName.trim(),
      category: newAgentCategory,
      description: newAgentDescription.trim() || `Specialized autonomous agent for ${newAgentCategory} tasks.`,
      avatar: newAgentAvatar,
      avatarBg: newAgentAvatarBg,
      tags: [newAgentCategory.toLowerCase().replace(/\s+/g, "-"), "custom-agent"],
      createdBy: "custom",
    };

    const updated = [createdAgent, ...customAgents.filter((a) => a.id !== assignedId)];
    saveCustomAgents(updated);
    setIsSubmittingAgent(false);
    setShowCreateAgentModal(false);

    // Reset inputs
    setNewAgentName("");
    setNewAgentDescription("");
    setNewAgentSystemPrompt("");

    // Switch to My Custom Agents tab so user immediately sees their agent
    setSourceFilter("custom");
    showToast(`Agent "${createdAgent.name}" saved to Database! Click Chat to start.`);
  };

  // Scroll category bar horizontally
  const handleScrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === "right" ? 220 : -220;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Filtered Agents List
  const activeAgentPool = sourceFilter === "official" ? officialAgents : customAgents;
  const filteredAgents = activeAgentPool.filter((agent) => {
    const matchesCategory = selectedCategory === "All" || agent.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-[#fafbfa] overflow-hidden font-sans select-none">
      {/* 1. Left Navigation Rail */}
      <NavigationRail />

      {/* 2. Main Page Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-2xl animate-fade-in flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="px-8 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-4">
          {/* Left: Search input + Create My Own Agent button */}
          <div className="flex items-center gap-3.5 flex-1 max-w-2xl">
            {/* Search Pill */}
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={activeMainTab === "agents" ? "Search agents..." : "Search agent teams..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00D35A] transition"
              />
            </div>

            {/* Create My Own Agent Button */}
            <button
              onClick={() => setShowCreateAgentModal(true)}
              className="bg-[#00D35A] hover:bg-[#00be51] text-white font-medium px-5 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 flex-shrink-0"
            >
              <span className="text-sm font-bold leading-none">+</span>
              <span>Create My Own Agent</span>
            </button>
          </div>

          {/* Right: Top Tabs (Agents | Agent Teams) */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveMainTab("agents")}
              className={`text-sm pb-1 transition relative ${
                activeMainTab === "agents"
                  ? "font-bold text-slate-900 border-b-2 border-[#00D35A]"
                  : "font-medium text-slate-500 hover:text-slate-800"
              }`}
            >
              Agents
            </button>
            <button
              onClick={() => setActiveMainTab("teams")}
              className={`text-sm pb-1 transition relative ${
                activeMainTab === "teams"
                  ? "font-bold text-slate-900 border-b-2 border-[#00D35A]"
                  : "font-medium text-slate-500 hover:text-slate-800"
              }`}
            >
              Agent Teams
            </button>
          </div>
        </div>

        {/* Secondary Sub-Tabs: "By Teamily AI" & "My Custom Agents" */}
        {activeMainTab === "agents" && (
          <div className="px-8 pt-4 pb-2 flex items-center gap-2.5">
            <button
              onClick={() => setSourceFilter("official")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 ${
                sourceFilter === "official"
                  ? "bg-[#00D35A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              By Teamily AI
            </button>
            <button
              onClick={() => setSourceFilter("custom")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 ${
                sourceFilter === "custom"
                  ? "bg-[#00D35A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>My Custom Agents</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  sourceFilter === "custom" ? "bg-white/30 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {customAgents.length}
              </span>
            </button>
          </div>
        )}

        {/* Horizontal Category Filter Chips */}
        {activeMainTab === "agents" && (
          <div className="px-8 py-2 relative flex items-center">
            {/* Scrollable Container */}
            <div
              ref={categoryScrollRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pr-10 py-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition active:scale-95 ${
                      isSelected
                        ? "bg-[#00D35A] text-white font-medium shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-normal"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Arrow Chevron Button */}
            <button
              onClick={() => handleScrollCategories("right")}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition z-10"
              title="Scroll categories"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Content Area (Agents Grid / Teams Grid) */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {activeMainTab === "agents" ? (
            <>
              {filteredAgents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-3">
                    🔍
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">No agents found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your search query or category filter, or click &quot;Create My Own Agent&quot; to build a custom assistant.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSearchQuery("");
                    }}
                    className="mt-4 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 pb-14">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="bg-white rounded-full border border-slate-200/90 px-6 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all flex items-center justify-between gap-4 group"
                    >
                      {/* Left: Avatar with pastel circle */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full ${
                            agent.avatarBg || "bg-emerald-100/80"
                          } flex items-center justify-center text-2xl shadow-xs`}
                        >
                          {agent.avatar}
                        </div>
                        {/* Little badge icon at bottom right of avatar */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full border border-slate-200 flex items-center justify-center text-[10px] shadow-xs">
                          {agent.category === "IT & Security"
                            ? "🛡️"
                            : agent.category === "Finance"
                            ? "🪙"
                            : agent.category === "Content Creation"
                            ? "🎬"
                            : "⚡"}
                        </div>
                      </div>

                      {/* Middle: Agent Title & 2-Line Description */}
                      <div className="flex-1 min-w-0 pr-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
                          {agent.description}
                        </p>
                      </div>

                      {/* Right: Action Buttons (Delete for custom + Green Chat Button) */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {agent.createdBy === "custom" && (
                          <button
                            onClick={(e) => handleDeleteAgent(agent.id, e)}
                            className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center text-xs transition"
                            title={`Delete ${agent.name}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenChat(agent)}
                          className="bg-[#00D35A] hover:bg-[#00be51] text-white text-xs font-semibold px-5 py-2 rounded-full transition shadow-xs active:scale-95 flex items-center justify-center"
                          title={`Start chat with ${agent.name}`}
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Agent Teams View */
            <div className="space-y-4 pb-12">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">
                  Collaborative multi-agent workflows executing end-to-end autonomous jobs in parallel.
                </p>
                <button
                  onClick={() => showToast("Opening team creator...")}
                  className="bg-[#00D35A] hover:bg-[#00be51] text-white font-medium px-4 py-1.5 rounded-full text-xs shadow-xs"
                >
                  + Create My Own Agent Team
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
                {agentTeams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                          {team.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {team.memberCount} Agents
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mb-1.5">{team.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {team.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center -space-x-2">
                        {team.avatars.map((av, idx) => (
                          <div
                            key={idx}
                            className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs shadow-xs"
                          >
                            {av}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          router.push(
                            `/chat?agentId=${team.id}&agentName=${encodeURIComponent(
                              team.name
                            )}&agentAvatar=👥`
                          )
                        }
                        className="bg-[#00D35A] hover:bg-[#00be51] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-xs active:scale-95 transition"
                      >
                        Chat with Team
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Create My Own Agent Modal */}
      {showCreateAgentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Create My Own Agent</h3>
                  <p className="text-xs text-slate-500">Configure your custom autonomous specialist</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateAgentModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAgentSubmit} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agent Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Urdu Legal Advisor, Python Code Reviewer"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#00D35A] text-slate-900"
                  required
                />
              </div>

              {/* Category & Avatar Palette */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newAgentCategory}
                    onChange={(e) => setNewAgentCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#00D35A] text-slate-900 bg-white"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">AI Model</label>
                  <select
                    value={newAgentModel}
                    onChange={(e) => setNewAgentModel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#00D35A] text-slate-900 bg-white"
                  >
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="GPT-4o">GPT-4o</option>
                    <option value="Gemma 3:4b">Gemma 3:4b (Local)</option>
                    <option value="DeepSeek R1">DeepSeek R1 (Reasoning)</option>
                  </select>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Avatar Style</label>
                <div className="flex items-center gap-2">
                  {["🤖", "⚡", "🛡️", "💼", "🎨", "📊", "🎬", "🚀", "⚖️", "🐍"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewAgentAvatar(em)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border transition ${
                        newAgentAvatar === em
                          ? "border-[#00D35A] ring-2 ring-emerald-300/50 bg-emerald-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Short 1-2 sentence description of what this agent does..."
                  value={newAgentDescription}
                  onChange={(e) => setNewAgentDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#00D35A] text-slate-900 resize-none"
                />
              </div>

              {/* System Instructions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  System Instructions & Persona (Prompt)
                </label>
                <textarea
                  rows={3}
                  placeholder="Define your agent's behavior, tone of voice, formatting rules, constraints..."
                  value={newAgentSystemPrompt}
                  onChange={(e) => setNewAgentSystemPrompt(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#00D35A] text-slate-900 resize-none font-mono text-[11px]"
                />
              </div>

              {/* Tools Enablement */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Agent Capabilities & Tools</label>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" defaultChecked className="accent-[#00D35A]" />
                    <span>🌐 Live Web Search</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" defaultChecked className="accent-[#00D35A]" />
                    <span>⚡ Code Interpreter</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" defaultChecked className="accent-[#00D35A]" />
                    <span>📁 Workspace Files</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" defaultChecked className="accent-[#00D35A]" />
                    <span>🔌 MCP Connectors</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateAgentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAgent}
                  className="px-5 py-2 rounded-xl bg-[#00D35A] hover:bg-[#00be51] text-white font-bold shadow-xs active:scale-95 transition flex items-center gap-1.5"
                >
                  {isSubmittingAgent ? "Creating..." : "Create Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50 text-slate-400">Loading Discover...</div>}>
      <DiscoverPageContent />
    </Suspense>
  );
}
