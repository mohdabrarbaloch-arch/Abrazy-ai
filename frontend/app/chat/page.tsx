"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasDeliveryInfo?: boolean;
  deliveryCount?: number;
  thoughtCount?: number;
  viewThoughts?: boolean;
  hasGuide?: boolean;
  hasTask?: boolean;
  suggestions?: string[];
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  status: "online" | "offline";
}

export default function ChatPage() {
  // 5 Agents - Teamily style
  const agents: Agent[] = [
    {
      id: "1",
      name: "Abraz Baloch's Personal AI",
      avatar: "🤖",
      lastMessage: "[Translated] E-Syndicate UCL...",
      timestamp: "14:38",
      status: "online",
    },
    {
      id: "2",
      name: "TikTok Strategist",
      avatar: "📱",
      lastMessage: "[Translated] Oh ok all I have 60...",
      timestamp: "14:41",
      status: "online",
    },
    {
      id: "3",
      name: "Webpage Developer",
      avatar: "💻",
      lastMessage: "⚠ Your pharmacy website is...",
      timestamp: "Tue",
      status: "online",
    },
    {
      id: "4",
      name: "muhammadayanshahzad4",
      avatar: "M",
      lastMessage: "[Translated] The color doesn't...",
      timestamp: "Sat",
      status: "offline",
    },
    {
      id: "5",
      name: "Short-Video Expert",
      avatar: "🎬",
      lastMessage: "The profitlement checklist...",
      timestamp: "09/20/26",
      status: "online",
    },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "You are now friends and can start chatting!",
      timestamp: new Date("2026-08-08T21:03:00"),
    },
    {
      id: "2",
      role: "assistant",
      content: `**Pehle yeh 5 blanks fill kar (har script me yehi lagenge)**

1. **Brand:**
   .....................................................

2. **Product:**                    (e.g. Vitamin C 10% serum, Niacinamide Serum)
   .....................................................

3. **Key Ingredient + kaam:**    (e.g. Vitamin C — glow, Niacinamide — breakouts/oil)
   .....................................................`,
      timestamp: new Date(),
      hasDeliveryInfo: true,
      deliveryCount: 1,
      thoughtCount: 2,
      hasGuide: true,
      hasTask: true,
      suggestions: [
        "I will send you product details — personalize the scripts; it will tell you the brand, serum, ingre...",
        "Fixer gắn bàn đố idiomas UGC ke liye (3 gigs: unboxing, review, 5 reasons)",
        "Create a 1-page rate card that you can send to two brands"
      ]
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [showAgentList, setShowAgentList] = useState(true);
  const [showThoughts, setShowThoughts] = useState<{ [key: string]: boolean }>({});
  const [isTranslated, setIsTranslated] = useState<{ [key: string]: boolean }>({});
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"auto" | "instant" | "agentic">("agentic");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close mode menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setShowModeMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/api/tasks/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message: input,
          agent_id: selectedAgent.id,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
      let messageAdded = false;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.delta) {
                  aiResponse += data.delta;

                  setMessages((prev) => {
                    const newMessages = [...prev];
                    if (!messageAdded) {
                      newMessages.push({
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: aiResponse,
                        timestamp: new Date(),
                      });
                      messageAdded = true;
                    } else {
                      const lastMsg = newMessages[newMessages.length - 1];
                      if (lastMsg.role === "assistant") {
                        lastMsg.content = aiResponse;
                      }
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error("Parse error:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Hello! I'm ${selectedAgent.name}. How can I help you today?`,
            timestamp: new Date(),
          },
        ]);
      }, 800);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5]">
      {/* Left Sidebar - Icons only */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-6">
        {/* Logo */}
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-green-600 transition-colors">
          T
        </div>

        {/* Icons */}
        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Chat">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Agents">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Integrations">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Discover">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="History">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Bottom Icons */}
        <div className="flex-1"></div>

        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Globe">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="PLUS">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">
            +
          </div>
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title="Profile">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-semibold">
            U
          </div>
        </button>
      </div>

      {/* Middle Panel - Chat List */}
      {showAgentList && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search"
                className="w-48 px-3 py-1.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {/* Agents List */}
          <div className="flex-1 overflow-y-auto">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-l-4 ${
                  selectedAgent.id === agent.id
                    ? "bg-gray-50 border-green-500"
                    : "border-transparent"
                }`}
              >
                <div className="relative flex-shrink-0">
                  {agent.avatar.match(/[A-Z]/) ? (
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                      {agent.avatar}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                      {agent.avatar}
                    </div>
                  )}
                  {agent.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900 truncate">
                      {agent.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{agent.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{agent.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Right Panel - Chat Area */}
      <div className="flex-1 flex flex-col bg-[#EFEAE2]">
        {/* Chat Header */}
        <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAgentList(!showAgentList)}
              className="lg:hidden w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="relative">
              {selectedAgent.avatar.match(/[A-Z]/) ? (
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                  {selectedAgent.avatar}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                  {selectedAgent.avatar}
                </div>
              )}
              {selectedAgent.status === "online" && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedAgent.name}</h2>
              <p className="text-xs text-gray-500">
                {selectedAgent.status === "online" ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto px-6 py-4 space-y-2"
          style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 0h100v100H0z\" fill=\"%23efeae2\"/%3E%3Cpath d=\"M20 20l5 5-5 5-5-5z\" fill=\"%23ddd\" opacity=\"0.1\"/%3E%3C/svg%3E')",
          }}
        >
          {/* Date Separator */}
          <div className="flex justify-center my-4">
            <div className="bg-white px-3 py-1 rounded-lg shadow-sm">
              <span className="text-xs text-gray-600">08/08/2026 21:03</span>
            </div>
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-2xl w-full">
                <div
                  className={`px-3 py-2 rounded-lg shadow-sm ${
                    message.role === "user"
                      ? "bg-[#D9FDD3]"
                      : "bg-white"
                  }`}
                >
                  <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                    {message.content.split('\n').map((line, idx) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <div key={idx} className="font-bold mt-2 mb-1">{line.replace(/\*\*/g, '')}</div>;
                      } else if (line.match(/^\d+\./)) {
                        return <div key={idx} className="mt-2">{line}</div>;
                      } else if (line.trim().startsWith('(e.g.')) {
                        return <div key={idx} className="text-gray-600 text-xs ml-4">{line}</div>;
                      } else if (line.includes('.....')) {
                        return <div key={idx} className="border-b border-dotted border-gray-400 my-1"></div>;
                      } else {
                        return <div key={idx}>{line}</div>;
                      }
                    })}
                  </div>

                  {/* Delivery Info & Thoughts */}
                  {message.hasDeliveryInfo && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {message.deliveryCount} delivery
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          x {message.deliveryCount}
                        </span>
                        <span className="flex items-center gap-1">
                          💭 Thought for {message.thoughtCount}s
                        </span>
                        <button
                          onClick={() => setShowThoughts({...showThoughts, [message.id]: !showThoughts[message.id]})}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          View my thoughts
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-2">
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                    {message.role === "user" && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {message.hasDeliveryInfo && (
                  <div className="mt-2 flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Translation & Guide */}
                {message.hasDeliveryInfo && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => setIsTranslated({...isTranslated, [message.id]: !isTranslated[message.id]})}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        {isTranslated[message.id] ? "Show Original" : "Translated to English"}
                      </button>
                      <span className="text-gray-400">•</span>
                      <button className="text-gray-600 hover:text-gray-700">
                        Show Original
                      </button>
                      <button className="ml-auto text-gray-600 hover:text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Task Section */}
                {message.hasTask && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-2">
                      Not satisfied with the result? Create an agentic task with +
                    </div>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                      <span>+ New task</span>
                    </button>
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(suggestion)}
                        className="w-full text-left bg-white border border-green-500 hover:bg-green-50 rounded-lg p-3 text-sm text-gray-700 transition-colors flex items-start gap-2"
                      >
                        <span className="text-green-600 flex-shrink-0">↗</span>
                        <span className="line-clamp-1">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Open Guide Button */}
                {message.hasGuide && (
                  <div className="mt-3">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Open Guide
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-end gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>

            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Mode Selector - Agente Dropdown */}
            <div className="relative" ref={modeMenuRef}>
              <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 pr-8 rounded-lg text-sm font-medium cursor-pointer transition-colors flex items-center gap-2"
              >
                <span className="capitalize">{selectedMode === "agentic" ? "Agente" : selectedMode}</span>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mode Menu Popup */}
              {showModeMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setSelectedMode("auto");
                      setShowModeMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                      selectedMode === "auto" ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Auto</div>
                      <div className="text-xs text-gray-600">Automatically picks the best mode</div>
                    </div>
                    {selectedMode === "auto" && (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMode("instant");
                      setShowModeMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                      selectedMode === "instant" ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Instant</div>
                      <div className="text-xs text-gray-600">Quick, direct replies</div>
                    </div>
                    {selectedMode === "instant" && (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMode("agentic");
                      setShowModeMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                      selectedMode === "agentic" ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Agentic</div>
                      <div className="text-xs text-gray-600">Plans and completes tasks</div>
                    </div>
                    {selectedMode === "agentic" && (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 focus-within:border-green-500 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message"
                rows={1}
                className="w-full bg-transparent resize-none outline-none text-sm text-gray-900 placeholder-gray-500"
                style={{ maxHeight: "100px" }}
              />
            </div>

            {/* Sparkle Icon (AI Enhancement) */}
            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0" title="AI Enhancement">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </button>

            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
              <span className="text-xl">😊</span>
            </button>

            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {input.trim() ? (
              <button
                onClick={sendMessage}
                disabled={isTyping}
                className="w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-600 disabled:bg-gray-300 rounded-full transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
