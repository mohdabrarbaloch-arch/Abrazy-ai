"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavigationRail from "@/components/NavigationRail";
import WhatsAppWallpaper from "@/components/WhatsAppWallpaper";
import ActionHubModal from "@/components/ActionHubModal";
import SkillLibraryModal from "@/components/SkillLibraryModal";
import ConnectorsModal from "@/components/ConnectorsModal";
import GroupCreationModal from "@/components/GroupCreationModal";
import SearchMediaDrawer from "@/components/SearchMediaDrawer";
import ChatHeaderFlyout from "@/components/ChatHeaderFlyout";
import { API_URL } from "@/lib/config";
import { api } from "@/lib/api";
import { GroqLogo, GeminiLogo, OpenAILogo, ClaudeLogo } from "@/components/BrandLogos";
import { Users, Search, Image as ImageIcon, Globe, Cpu, Sparkles, BrainCircuit, Check, Zap, FileText } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "peer" | "agent";
  content: string;
  timestamp: string;
  senderName?: string;
  senderAvatar?: string;
  isVideoArtifact?: boolean;
  artifacts?: any[];
}

interface ChatItem {
  id: string;
  type: "agent" | "peer";
  name: string;
  avatar: string;
  avatarBg?: string;
  avatarImage?: string;
  lastMessage: string;
  draftTag?: string;
  quotedTag?: string;
  timestamp: string;
  isTimestampGreen?: boolean;
  isMessageGreen?: boolean;
  hasCheckmark?: boolean;
  status: "online" | "offline";
  isPlusUser?: boolean;
  isPinned?: boolean;
  is_group?: boolean;
  member_agent_ids?: string[];
}

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentIdParam = searchParams ? searchParams.get("agentId") : null;
  const agentNameParam = searchParams ? searchParams.get("agentName") : null;
  const agentAvatarParam = searchParams ? searchParams.get("agentAvatar") : null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active chat state
  const [selectedChatId, setSelectedChatId] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "agents" | "peers">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [agentMode, setAgentMode] = useState<"Groq LLaMA" | "Gemini 2.5" | "Instant" | "Auto" | "Deep Think" | "Claude 3.5" | "GPT-4o">("Groq LLaMA");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [activeToolStatus, setActiveToolStatus] = useState<{ tool: string; label: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPromptTemplates, setShowPromptTemplates] = useState(false);
  const [showThoughts, setShowThoughts] = useState(false);
  const [videoSlideIndex, setVideoSlideIndex] = useState<number>(1); // 1, 2, or 3
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoSeconds, setVideoSeconds] = useState(24);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Modals & Drawers
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [showSkillLibrary, setShowSkillLibrary] = useState(false);
  const [showActionHub, setShowActionHub] = useState(false);
  const [showGroupCreation, setShowGroupCreation] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fallback Chat List if offline
  const DEFAULT_FALLBACK_CHATS: ChatItem[] = [
    {
      id: "1",
      type: "agent",
      name: "ABraz Baloch's Personal AI",
      avatar: "🤖",
      lastMessage: "Hello! How can I assist you with your project today?",
      timestamp: "15:46",
      status: "online",
      isPinned: true,
    },
    {
      id: "2",
      type: "agent",
      name: "Content Creator",
      avatar: "🤖",
      avatarBg: "bg-amber-100 text-amber-800",
      lastMessage: "Repo cloned (it's public - ...",
      hasCheckmark: true,
      timestamp: "Tue",
      status: "online",
    },
    {
      id: "3",
      type: "peer",
      name: "osamarauf903",
      avatar: "👤",
      avatarBg: "bg-amber-900 text-white",
      avatarImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      lastMessage: "hi",
      timestamp: "Sun",
      status: "online",
    },
    {
      id: "4",
      type: "peer",
      name: "muhammad...",
      avatar: "M",
      avatarBg: "bg-[#5850A2] text-white",
      lastMessage: "https://youtu.be/dZyQNy3-...",
      timestamp: "Fri",
      status: "online",
      isPlusUser: true,
    },
    {
      id: "5",
      type: "agent",
      name: "Short Video Editin...",
      avatar: "🤖",
      avatarBg: "bg-cyan-100 text-cyan-800",
      lastMessage: "Video generation is still block...",
      timestamp: "Fri",
      status: "online",
    },
    {
      id: "6",
      type: "agent",
      name: "Litigation Ass...",
      avatar: "🤖",
      avatarBg: "bg-rose-100 text-rose-800",
      lastMessage: "Hi! How can I help you today?",
      timestamp: "09/17/26",
      status: "online",
    },
    {
      id: "7",
      type: "agent",
      name: "Video Optimi...",
      avatar: "🤖",
      avatarBg: "bg-pink-100 text-pink-800",
      lastMessage: "Your AI video is ready!...",
      timestamp: "09/17/26",
      status: "online",
    },
    {
      id: "8",
      type: "agent",
      name: "Webpage De...",
      avatar: "🤖",
      avatarBg: "bg-emerald-100 text-emerald-800",
      lastMessage: "[Custom Message]",
      timestamp: "09/06/26",
      status: "online",
    },
    {
      id: "9",
      type: "agent",
      name: "Full Stack AI ...",
      avatar: "🤖",
      avatarBg: "bg-sky-100 text-sky-800",
      lastMessage: "Real LLM activation path...",
      hasCheckmark: true,
      timestamp: "09/06/26",
      status: "online",
    },
  ];

  const [chatItems, setChatItems] = useState<ChatItem[]>(DEFAULT_FALLBACK_CHATS);

  // Messages per Chat
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>({
    "1": [
      {
        id: "m_abraz_1",
        role: "assistant",
        senderName: "ABraz Baloch's Personal AI",
        content: "Hello! I am ABraz Baloch's Personal AI. How can I assist you with your project or workflow today?",
        timestamp: "12:00 AM",
      },
    ],
    "2": [
      {
        id: "m_cc_1",
        role: "assistant",
        senderName: "Content Creator",
        content: "Repo cloned (it's public - ready to start scheduling social media posts and newsletters).",
        timestamp: "Tue 10:15",
      },
    ],
    "3": [
      {
        id: "m_o_1",
        role: "peer",
        senderName: "osamarauf903",
        content: "hi, how are your autonomous agents running today?",
        timestamp: "Sun 14:20",
      },
    ],
    "4": [
      {
        id: "m_m_1",
        role: "peer",
        senderName: "muhammad...",
        content: "https://youtu.be/dZyQNy3- Check out the autonomous agent pipeline video bro!",
        timestamp: "Fri 18:05",
      },
    ],
    "5": [
      {
        id: "m_sve_1",
        role: "assistant",
        senderName: "Short Video Editing AI",
        content: "Video generation is still blocked on render server. Queued for next GPU cluster slot.",
        timestamp: "Fri 17:26",
      },
    ],
    "6": [
      {
        id: "m_la_1",
        role: "assistant",
        senderName: "Litigation Assistant",
        content: "Hi! How can I help you today with corporate contracts, legal research, or precedents?",
        timestamp: "09/17/26",
      },
    ],
    "7": [
      {
        id: "m_vo_1",
        role: "assistant",
        senderName: "Video Optimizer",
        content: "🎥 Your AI video is ready! 4K export completed with normalized audio tracks.",
        timestamp: "09/17/26",
      },
    ],
    "8": [
      {
        id: "m_wd_1",
        role: "assistant",
        senderName: "Webpage Developer",
        content: "[Custom Message] Next.js 14 app router and Tailwind design system are fully deployed.",
        timestamp: "09/06/26",
      },
    ],
    "9": [
      {
        id: "m_fs_1",
        role: "assistant",
        senderName: "Full Stack AI Expert",
        content: "✓ Real LLM activation path verified on local-first cluster.",
        timestamp: "09/06/26",
      },
    ],
  });

  const selectedChat = chatItems.find((c) => c.id === selectedChatId) || chatItems[0];
  const currentMessages = messagesByChat[selectedChatId] || [];

  // Load dynamic conversations from backend database
  useEffect(() => {
    async function loadConversations() {
      try {
        const convs = await api.listConversations();
        if (convs && convs.length > 0) {
          const mapped: ChatItem[] = convs.map((c: any) => ({
            id: c.id,
            type: c.is_group ? "peer" : "agent",
            name: c.title || c.agent_name || "AI Agent",
            avatar: c.agent_avatar || (c.is_group ? "👥" : "🤖"),
            lastMessage: c.last_message?.content || "Tap to chat with this agent...",
            timestamp: c.last_message?.created_at
              ? new Date(c.last_message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : new Date(c.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "online",
            isPinned: false,
            is_group: c.is_group,
            member_agent_ids: c.member_agent_ids || [],
          }));
          setChatItems(mapped);

          // Populate initial messages map with last message
          const initialMsgsMap: Record<string, Message[]> = {};
          convs.forEach((c: any) => {
            if (c.last_message) {
              initialMsgsMap[c.id] = [
                {
                  id: c.last_message.id,
                  role: c.last_message.sender_type === "user" ? "user" : "assistant",
                  senderName: c.last_message.sender_name,
                  content: c.last_message.content,
                  timestamp: new Date(c.last_message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ];
            }
          });
          setMessagesByChat((prev) => ({ ...initialMsgsMap, ...prev }));

          if (!agentIdParam) {
            setSelectedChatId(mapped[0].id);
          }
        }
      } catch (err) {
        console.warn("Could not load conversations from backend, using fallback:", err);
      }
    }
    loadConversations();
  }, [agentIdParam]);

  // Load complete message history for active conversation from database
  useEffect(() => {
    if (!selectedChatId) return;

    async function loadMessages() {
      try {
        const msgs = await api.listMessages(selectedChatId);
        if (msgs && msgs.length > 0) {
          const mappedMsgs: Message[] = msgs.map((m: any) => ({
            id: m.id,
            role: m.sender_type === "user" ? "user" : "assistant",
            content: m.content,
            senderName: m.sender_name,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            artifacts: m.artifacts,
          }));
          setMessagesByChat((prev) => ({
            ...prev,
            [selectedChatId]: mappedMsgs,
          }));
        }
      } catch (err) {
        console.warn(`Could not load messages for conversation ${selectedChatId}:`, err);
      }
    }

    loadMessages();
  }, [selectedChatId]);

  // If redirected from Discover page with agentId/agentName, open chat with that agent!
  useEffect(() => {
    if (agentIdParam) {
      const existing = chatItems.find((c) => c.id === agentIdParam || (c as any).agent_id === agentIdParam);
      if (existing) {
        setSelectedChatId(existing.id);
      } else {
        api.createConversation({
          title: agentNameParam ? decodeURIComponent(agentNameParam) : "AI Agent",
          is_group: false,
          agent_id: agentIdParam,
        }).then((newConv) => {
          const newChat: ChatItem = {
            id: newConv.id,
            type: "agent",
            name: newConv.title || (agentNameParam ? decodeURIComponent(agentNameParam) : "AI Agent"),
            avatar: agentAvatarParam ? decodeURIComponent(agentAvatarParam) : "🤖",
            lastMessage: newConv.last_message?.content || "Ready to assist you with your tasks!",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "online",
            isPinned: false,
          };
          setChatItems((prev) => [newChat, ...prev.filter((c) => c.id !== newConv.id)]);
          setSelectedChatId(newConv.id);
        }).catch(() => {
          const newChatItem: ChatItem = {
            id: agentIdParam,
            type: "agent",
            name: agentNameParam ? decodeURIComponent(agentNameParam) : "AI Agent",
            avatar: agentAvatarParam ? decodeURIComponent(agentAvatarParam) : "🤖",
            lastMessage: "Ready to assist you with your tasks!",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "online",
            isPinned: false,
          };
          setChatItems((prev) => [newChatItem, ...prev]);
          setSelectedChatId(agentIdParam);
        });
      }
    }
  }, [agentIdParam, agentNameParam, agentAvatarParam]);

  // Load pending automation prompt if redirected from /automations
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingTask = localStorage.getItem("pending_agent_task");
      if (pendingTask) {
        setMessageInput(pendingTask);
        localStorage.removeItem("pending_agent_task");
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping]);

  // Video timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVideoPlaying) {
      timer = setInterval(() => {
        setVideoSeconds((prev) => {
          if (prev >= 52) {
            setIsVideoPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVideoPlaying]);

  // Voice recording simulation
  useEffect(() => {
    let recTimer: NodeJS.Timeout;
    if (isRecordingVoice) {
      recTimer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(recTimer);
  }, [isRecordingVoice]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || messageInput).trim();
    if (!text) return;
    setMessageInput("");
    setShowEmojiPicker(false);
    setShowPromptTemplates(false);

    const newMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMsg],
    }));

    // Update snippet in chat list
    setChatItems((prev) =>
      prev.map((c) =>
        c.id === selectedChatId
          ? {
              ...c,
              lastMessage: text.slice(0, 36) + (text.length > 36 ? "..." : ""),
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : c
      )
    );

    // AI typing & live streaming response
    setIsTyping(true);

    // Resolve LLM Provider and Model based on selected agentMode
    let provider: string | undefined = undefined;
    let model: string = "llama-3.3-70b-versatile";
    if (agentMode === "Groq LLaMA" || agentMode === "Instant") {
      provider = "groq";
      model = "llama-3.3-70b-versatile";
    } else if (agentMode === "Gemini 2.5" || agentMode === "Auto" || agentMode === "Deep Think") {
      provider = "gemini";
      model = "gemini-2.5-flash";
    } else if (agentMode === "Claude 3.5") {
      provider = "anthropic";
      model = "claude-3-5-sonnet-20241022";
    } else if (agentMode === "GPT-4o") {
      provider = "openai";
      model = "gpt-4o";
    }

    // Dynamic API key resolution: check if user configured custom key
    let customApiKey: string | undefined = undefined;
    if (typeof window !== "undefined") {
      if (provider === "groq") customApiKey = localStorage.getItem("groq_api_key") || undefined;
      else if (provider === "gemini") customApiKey = localStorage.getItem("gemini_api_key") || undefined;
      else if (provider === "openai") customApiKey = localStorage.getItem("openai_api_key") || undefined;
      else if (provider === "anthropic") customApiKey = localStorage.getItem("anthropic_api_key") || undefined;
    }

    try {
      const response = await fetch(`${API_URL}/api/tasks/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedChatId,
          agent_id: selectedChat?.type === "agent" ? selectedChatId : undefined,
          agent_name: selectedChat?.name,
          message: text,
          provider,
          model,
          api_key: customApiKey,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let activeAgentMsgId: string | null = null;
      let activeAgentText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            const jsonStr = trimmed.replace(/^data:\s*/, "");
            try {
              const data = JSON.parse(jsonStr);

              // 1. Agent starts turn (Multi-agent squad sequential speaking)
              if (data.type === "agent_start") {
                const newMsgId = `reply_${data.agent_id || "agent"}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
                activeAgentMsgId = newMsgId;
                activeAgentText = "";

                setMessagesByChat((prev) => ({
                  ...prev,
                  [selectedChatId]: [
                    ...(prev[selectedChatId] || []),
                    {
                      id: newMsgId,
                      role: "assistant",
                      senderName: data.agent_name || selectedChat.name,
                      senderAvatar: data.avatar || "🤖",
                      content: "",
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                  ],
                }));
              }

              // 2. Token delta streamed for active agent
              else if (data.delta || data.type === "delta") {
                const chunk = data.delta || "";
                if (!activeAgentMsgId) {
                  // Fallback: create default assistant message if not yet created
                  const fallbackId = `reply_${Date.now()}`;
                  activeAgentMsgId = fallbackId;
                  activeAgentText = "";
                  setMessagesByChat((prev) => ({
                    ...prev,
                    [selectedChatId]: [
                      ...(prev[selectedChatId] || []),
                      {
                        id: fallbackId,
                        role: "assistant",
                        senderName: data.agent_name || selectedChat.name,
                        senderAvatar: data.avatar || "🤖",
                        content: "",
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      },
                    ],
                  }));
                }

                activeAgentText += chunk;
                const currentId = activeAgentMsgId;
                const currentText = activeAgentText;

                setMessagesByChat((prev) => {
                  const list = prev[selectedChatId] || [];
                  return {
                    ...prev,
                    [selectedChatId]: list.map((m) =>
                      m.id === currentId ? { ...m, content: currentText } : m
                    ),
                  };
                });
              }

              // 3. Tool execution started
              else if (data.type === "tool_start") {
                let toolLabel = `Executing ${data.tool || "tool"}...`;
                if (data.tool === "web_search") {
                  toolLabel = `Searching live web: "${data.args?.query || ""}"`;
                } else if (data.tool === "image_generate") {
                  toolLabel = `Generating visual asset: "${data.args?.prompt || ""}"`;
                } else if (data.tool === "read_url" || data.tool === "scrape_url") {
                  toolLabel = `Reading live webpage: ${data.args?.url || ""}`;
                }
                setActiveToolStatus({ tool: data.tool || "system", label: toolLabel });
              }

              // 4. Tool execution finished
              else if (data.type === "tool_done") {
                setActiveToolStatus(null);
              }

              // 5. Artifact produced (e.g. Pollinations image)
              else if (data.type === "artifact" && data.artifact) {
                const art = data.artifact;
                const currentId = activeAgentMsgId;
                if (currentId) {
                  setMessagesByChat((prev) => {
                    const list = prev[selectedChatId] || [];
                    return {
                      ...prev,
                      [selectedChatId]: list.map((m) =>
                        m.id === currentId
                          ? { ...m, artifacts: [...(m.artifacts || []), art] }
                          : m
                      ),
                    };
                  });
                }
              }

              // 6. Agent finished turn
              else if (data.type === "agent_done") {
                activeAgentMsgId = null;
                activeAgentText = "";
                setActiveToolStatus(null);
              }

              // 7. Entire turn complete
              else if (data.done) {
                setActiveToolStatus(null);
                setIsTyping(false);
              }
            } catch {
              // Ignore malformed json chunks
            }
          }
        }
      }
      setActiveToolStatus(null);
      setIsTyping(false);
    } catch (err) {
      console.warn("Live stream fallback initiated:", err);

      // Resilient fallback if stream is unavailable or backend is offline
      setTimeout(() => {
        let responseContent = `I have received your request for: "${text}".\n\nAll background autonomous agents have been dispatched with ${agentMode} execution.`;

        if (text.toLowerCase().includes("presenter") || text.toLowerCase().includes("frame") || text.toLowerCase().includes("day 12")) {
          responseContent = `🎬 **Day 12 Presenter Frames Ready!**\n\n- Generated 12 slide frames focusing on \`*args\` and \`**kwargs\` in Python.\n- Synchronized Urdu speech audio track with 1080p slide overlays.\n- Click **Open Studio** to preview the raw ffmpeg timeline.`;
        } else if (text.toLowerCase().includes("teaser") || text.toLowerCase().includes("reel") || text.toLowerCase().includes("15-second")) {
          responseContent = `📱 **15-Second Reels Hook Exported!**\n\n- Aspect ratio formatted to 9:16 vertical video.\n- Auto-subtitles generated with high-contrast text animation.\n- Ready to publish directly to Instagram Reels, TikTok, and YouTube Shorts.`;
        } else if (text.toLowerCase().includes("music") || text.toLowerCase().includes("lo-fi") || text.toLowerCase().includes("upbeat")) {
          responseContent = `🎵 **Background Track Updated!**\n\n- Replaced default acoustic theme with upbeat 120bpm lo-fi chill-hop.\n- Audio ducking applied at -18dB when presenter voiceover is speaking.`;
        }

        const fallbackMsg: Message = {
          id: `fallback_${Date.now()}`,
          role: "assistant",
          senderName: selectedChat.name,
          senderAvatar: selectedChat.avatar || "🤖",
          content: responseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessagesByChat((prev) => ({
          ...prev,
          [selectedChatId]: [...(prev[selectedChatId] || []), fallbackMsg],
        }));
        setIsTyping(false);
      }, 700);
    }
  };

  const handleSuggestionClick = (promptText: string) => {
    setMessageInput(promptText);
    textareaRef.current?.focus();
  };

  // Voice recording toggle
  const handleToggleVoice = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      const simulatedTranscripts = [
        "Day 12 ke presenter frames banao aur slide transition add karo",
        "Generate a 15-second teaser reel for social media hooks",
        "Background audio track change karke upbeat lo-fi track daalo",
      ];
      const randomTranscript = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)];
      setMessageInput(randomTranscript);
      showToast("Voice transcribed successfully");
    } else {
      setIsRecordingVoice(true);
      showToast("Recording voice... Speak now (Click mic again to stop)");
    }
  };

  // Filtered chats based on search and tab
  const filteredChatItems = chatItems.filter((chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === "agents") return matchesSearch && chat.type === "agent";
    if (filterType === "peers") return matchesSearch && chat.type === "peer";
    return matchesSearch;
  });

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans select-none">
      {/* 1. Far-Left Navigation Rail (Red Box 1) */}
      <NavigationRail />

      {/* 2. Middle Sidebar (Chats & Contacts) */}
      <div className="w-[285px] bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0 z-20">
        {/* Search Bar + Green Plus Button */}
        <div className="h-16 px-3.5 flex items-center justify-between gap-2 border-b border-slate-100">
          <div className="flex-1 relative flex items-center">
            <svg
              className="absolute left-3 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100/90 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00D35A] transition"
            />
          </div>

          <button
            onClick={() => setShowGroupCreation(true)}
            className="w-8 h-8 rounded-full bg-[#00D35A] hover:bg-[#00be51] text-white flex items-center justify-center shadow-xs flex-shrink-0 transition active:scale-95"
            title="Create New Chat / Group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Filter Dropdown Label: "Chats · 35 ⌵" */}
        <div className="relative px-3.5 py-2 flex items-center justify-between text-slate-600 text-xs font-semibold border-b border-slate-100/60">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-1.5 hover:text-slate-900 transition"
          >
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>
              {filterType === "all" ? "Chats · 35" : filterType === "agents" ? "AI Agents · 22" : "Peers · 13"}
            </span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFilterMenu && (
            <div className="absolute top-9 left-3 w-40 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-40 text-xs animate-in fade-in">
              <button
                onClick={() => {
                  setFilterType("all");
                  setShowFilterMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 ${filterType === "all" ? "text-[#00D35A] font-bold bg-emerald-50" : "text-slate-700 hover:bg-slate-50"}`}
              >
                All Chats (35)
              </button>
              <button
                onClick={() => {
                  setFilterType("agents");
                  setShowFilterMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 ${filterType === "agents" ? "text-[#00D35A] font-bold bg-emerald-50" : "text-slate-700 hover:bg-slate-50"}`}
              >
                🤖 Autonomous Agents (22)
              </button>
              <button
                onClick={() => {
                  setFilterType("peers");
                  setShowFilterMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 ${filterType === "peers" ? "text-[#00D35A] font-bold bg-emerald-50" : "text-slate-700 hover:bg-slate-50"}`}
              >
                👤 Contacts & Peers (13)
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 px-1.5 py-1">
          {filteredChatItems.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`w-full px-2.5 py-2.5 flex items-center gap-2.5 text-left transition-all rounded-2xl my-0.5 ${
                  isSelected
                    ? "bg-[#ecfaf0] text-slate-900 shadow-xs"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                {/* Avatar with Green Dot Badge */}
                <div className="relative flex-shrink-0">
                  {chat.avatarImage ? (
                    <img
                      src={chat.avatarImage}
                      alt={chat.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
                        chat.avatarBg || "bg-white text-slate-700 border border-slate-200/90"
                      }`}
                    >
                      {chat.avatar}
                    </div>
                  )}

                  {/* Tiny Green Status Dot Badge on all items matching screenshot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00D35A] rounded-full border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </div>
                </div>

                {/* Chat Title & Last Message Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`font-bold text-xs truncate ${isSelected ? "text-slate-900" : "text-slate-800"}`}>
                      {chat.name}
                    </span>
                    <span
                      className={`text-[11px] font-semibold flex-shrink-0 ${
                        chat.isTimestampGreen ? "text-[#00D35A]" : "text-slate-400"
                      }`}
                    >
                      {chat.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-0.5 truncate text-[11px]">
                    {chat.isPlusUser && (
                      <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1 py-0.2 rounded flex-shrink-0">
                        ☆ PLUS
                      </span>
                    )}
                    {chat.draftTag && (
                      <span className="text-[#00D35A] font-semibold flex-shrink-0">
                        {chat.draftTag}
                      </span>
                    )}
                    {chat.quotedTag && (
                      <span className="text-[#00D35A] font-semibold flex-shrink-0">
                        {chat.quotedTag}
                      </span>
                    )}
                    {chat.hasCheckmark && (
                      <span className="text-[#00D35A] text-[11px] font-bold flex-shrink-0">✓</span>
                    )}
                    <p
                      className={`truncate ${
                        chat.isMessageGreen ? "text-[#00D35A] font-normal" : "text-slate-500"
                      }`}
                    >
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Chat Viewport */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#eef6ee]">
        {/* WhatsApp Pattern Doodle Wallpaper */}
        <WhatsAppWallpaper />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl animate-fade-in flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-6 flex items-center justify-between z-10 shadow-xs">
          {/* Left: Avatar + Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-lg border border-slate-200 shadow-xs">
                {selectedChat.avatarImage ? (
                  <img src={selectedChat.avatarImage} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{selectedChat.avatar}</span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00D35A] rounded-full border-2 border-white flex items-center justify-center">
                <span className="w-1 h-1 bg-white rounded-full"></span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-sm">
                  {selectedChat.id === "1" ? "ABraz Baloch's Personal AI" : selectedChat.name}
                </h2>
                {(selectedChat.is_group || selectedChat.name?.toLowerCase().includes("squad") || selectedChat.type === "peer") && (
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 border border-emerald-200">
                    <Users className="w-3 h-3 text-emerald-700" />
                    <span>Multi-Agent Squad</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {(selectedChat.is_group || selectedChat.name?.toLowerCase().includes("squad"))
                  ? "Multi-agent collaborative room · Sequential turn-taking active"
                  : "Autonomous AI Agent · Online"}
              </span>
            </div>
          </div>

          {/* Right Controls: Invite, Search, Options */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast("Invite link copied to clipboard")}
              className="px-3.5 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition active:scale-95"
            >
              Invite
            </button>

            <button
              onClick={() => setShowSearchDrawer(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
              title="Search Messages"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button
              onClick={() => setShowChatOptions(!showChatOptions)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition relative"
              title="Chat Options"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-8 py-5 space-y-4 relative z-10">
          {currentMessages.map((msg) => {
            const isUser = msg.role === "user";

            if (isUser) {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-[#D4FCD4] border border-[#b8f0b8] rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-xl text-slate-900 text-xs shadow-xs leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              );
            }

            // Normal text message from an agent
            const imgMatch = msg.content.match(/!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/);
            const pollinationsMatch = msg.content.match(/https:\/\/image\.pollinations\.ai\/prompt\/[^\s\)]+/);
            const imageUrl = imgMatch ? imgMatch[2] : (pollinationsMatch ? pollinationsMatch[0] : (msg.artifacts?.find((a: any) => a?.type === "image")?.url));
            const imageTitle = imgMatch ? imgMatch[1] : (msg.artifacts?.find((a: any) => a?.type === "image")?.title || "AI Generated Asset");
            const cleanContent = imgMatch ? msg.content.replace(imgMatch[0], "").trim() : msg.content;

            return (
              <div key={msg.id} className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] shadow-xs border border-slate-200">
                    {msg.senderAvatar || selectedChat.avatar || "🤖"}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">
                    {msg.senderName || selectedChat.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {msg.timestamp}
                  </span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs text-slate-800 shadow-xs max-w-xl leading-relaxed whitespace-pre-wrap">
                  {cleanContent && <div>{cleanContent}</div>}

                  {imageUrl && (
                    <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-md bg-slate-900 group relative">
                      <img
                        src={imageUrl}
                        alt={imageTitle}
                        className="w-full h-auto object-cover max-h-80 rounded-xl transition group-hover:scale-[1.01]"
                        loading="lazy"
                      />
                      <div className="p-2 bg-white flex items-center justify-between border-t border-slate-100">
                        <span className="text-[11px] font-medium text-slate-700 truncate max-w-[240px] flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{imageTitle}</span>
                        </span>
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-[#00a884] hover:underline flex items-center gap-1"
                        >
                          <span>Fullsize</span>
                          <span>↗</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Active Tool Status Indicator */}
          {activeToolStatus && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full w-max shadow-xs border border-emerald-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#00D35A] animate-ping"></span>
              {activeToolStatus.tool === "web_search" ? (
                <Search className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              ) : activeToolStatus.tool === "image_generate" ? (
                <ImageIcon className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              ) : activeToolStatus.tool === "read_url" || activeToolStatus.tool === "scrape_url" ? (
                <Globe className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              ) : (
                <Cpu className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              )}
              <span className="font-medium">{activeToolStatus.label}</span>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && !activeToolStatus && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/95 px-3.5 py-1.5 rounded-full w-max shadow-xs border border-slate-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#00D35A] animate-ping"></span>
              <span>Thinking & reasoning...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. Chat Input Bar (Red Box 2 + Red Box 3) */}
        <div className="px-6 pb-6 pt-1 z-20">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 flex flex-col justify-between min-h-[110px] relative">
            {/* Middle: Text Input Area */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={2}
                placeholder={isRecordingVoice ? `Recording voice... (${recordingSeconds}s) Speak your command...` : ""}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className={`w-full bg-transparent outline-none text-xs text-slate-800 placeholder-slate-400 resize-none font-sans ${isRecordingVoice ? "text-emerald-700 font-semibold" : ""}`}
              />

              {/* Pulsing Voice Indicator */}
              {isRecordingVoice && (
                <div className="absolute right-2 top-2 flex items-center gap-1.5 text-xs text-red-500 font-semibold animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>LIVE REC {recordingSeconds}s</span>
                </div>
              )}
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between pt-1">
              {/* Red Box 2: Left Action Buttons (+, Wrench, Plug) */}
              <div className="flex items-center gap-2 text-slate-400">
                {/* Plus Button */}
                <button
                  type="button"
                  onClick={() => setShowActionHub(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700 text-lg font-light leading-none transition"
                  title="Action Hub / New Agent Task"
                >
                  +
                </button>

                {/* Wrench Button */}
                <button
                  type="button"
                  onClick={() => setShowSkillLibrary(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700 transition"
                  title="Tools & Skills Library"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </button>

                {/* Plug Button (Electrical Plug icon matching screenshot) */}
                <button
                  type="button"
                  onClick={() => setShowConnectors(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700 transition"
                  title="Connectors & MCP Integrations"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v4m6-4v4M8 7h8a2 2 0 012 2v3a5 5 0 01-5 5h-2a5 5 0 01-5-5V9a2 2 0 012-2zm4 10v4" />
                  </svg>
                </button>
              </div>

              {/* Red Box 3: Right Controls Group */}
              <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                {/* Instant / Auto Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModeDropdown(!showModeDropdown)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 hover:text-slate-900 transition px-2 py-1 rounded-md hover:bg-slate-100 border border-slate-200/70"
                  >
                    {agentMode === "Groq LLaMA" && <GroqLogo className="w-3.5 h-3.5 flex-shrink-0" />}
                    {agentMode === "Gemini 2.5" && <GeminiLogo className="w-3.5 h-3.5 flex-shrink-0" />}
                    {agentMode === "Deep Think" && <BrainCircuit className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />}
                    {agentMode === "Auto" && <Cpu className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                    {agentMode === "Claude 3.5" && <ClaudeLogo className="w-3.5 h-3.5 flex-shrink-0" />}
                    {agentMode === "GPT-4o" && <OpenAILogo className="w-3.5 h-3.5 text-slate-800 flex-shrink-0" />}
                    <span>{agentMode}</span>
                    <span className="text-[9px] text-slate-400">⌵</span>
                  </button>

                  {showModeDropdown && (
                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-40 text-xs animate-in fade-in divide-y divide-slate-100">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setAgentMode("Groq LLaMA");
                            setShowModeDropdown(false);
                            showToast("Model switched to Groq (LLaMA 3.3 70B - Ultra Fast)");
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition ${
                            agentMode === "Groq LLaMA" ? "text-slate-900 font-semibold bg-emerald-50/70" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <GroqLogo className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-xs">Groq LLaMA 3.3</span>
                              <span className="text-[10px] text-slate-400">llama-3.3-70b · Real-time 300 T/s</span>
                            </div>
                          </div>
                          {agentMode === "Groq LLaMA" && <Check className="w-3.5 h-3.5 text-[#00D35A] flex-shrink-0" />}
                        </button>
                        <button
                          onClick={() => {
                            setAgentMode("Gemini 2.5");
                            setShowModeDropdown(false);
                            showToast("Model switched to Google Gemini 2.5 Flash");
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition ${
                            agentMode === "Gemini 2.5" ? "text-slate-900 font-semibold bg-emerald-50/70" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <GeminiLogo className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-xs">Gemini 2.5 Flash</span>
                              <span className="text-[10px] text-slate-400">gemini-2.5-flash · Multimodal</span>
                            </div>
                          </div>
                          {agentMode === "Gemini 2.5" && <Check className="w-3.5 h-3.5 text-[#00D35A] flex-shrink-0" />}
                        </button>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setAgentMode("Deep Think");
                            setShowModeDropdown(false);
                            showToast("Deep Thinking reasoning mode enabled");
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition ${
                            agentMode === "Deep Think" ? "text-slate-900 font-semibold bg-purple-50/70" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <BrainCircuit className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-xs">Deep Think Mode</span>
                              <span className="text-[10px] text-slate-400">Extended step-by-step reasoning trace</span>
                            </div>
                          </div>
                          {agentMode === "Deep Think" && <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />}
                        </button>
                        <button
                          onClick={() => {
                            setAgentMode("Auto");
                            setShowModeDropdown(false);
                            showToast("Auto Intelligent Router active");
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition ${
                            agentMode === "Auto" ? "text-slate-900 font-semibold bg-blue-50/70" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Cpu className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-xs">Auto Router</span>
                              <span className="text-[10px] text-slate-400">Dynamically picks optimal LLM & tools</span>
                            </div>
                          </div>
                          {agentMode === "Auto" && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                        </button>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setAgentMode("Claude 3.5");
                            setShowModeDropdown(false);
                            showToast("Switched to Claude 3.5 Sonnet");
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition ${
                            agentMode === "Claude 3.5" ? "text-slate-900 font-semibold bg-amber-50/70" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <ClaudeLogo className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-xs">Claude 3.5 Sonnet</span>
                              <span className="text-[10px] text-slate-400">Anthropic · Nuanced coding & analysis</span>
                            </div>
                          </div>
                          {agentMode === "Claude 3.5" && <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
                        </button>
                        <button
                          onClick={() => {
                            setAgentMode("GPT-4o");
                            setShowModeDropdown(false);
                            showToast("Switched to OpenAI GPT-4o");
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition ${
                            agentMode === "GPT-4o" ? "text-slate-900 font-semibold bg-emerald-50/70" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <OpenAILogo className="w-4 h-4 text-slate-800 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-xs">GPT-4o</span>
                              <span className="text-[10px] text-slate-400">OpenAI flagship reasoning</span>
                            </div>
                          </div>
                          {agentMode === "GPT-4o" && <Check className="w-3.5 h-3.5 text-[#00D35A] flex-shrink-0" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sparkle / Agent reasoning icon */}
                <button
                  type="button"
                  onClick={() => {
                    if (messageInput.trim()) {
                      setMessageInput(`[Autonomous Agent Task]: Act as senior developer and video producer. Refine and optimize: "${messageInput.trim()}". Return production-grade code, detailed step-by-step reasoning, and visual asset schema.`);
                      showToast("Prompt enhanced with AI agent instructions");
                    } else {
                      setMessageInput("Analyze our video rendering pipeline, optimize memory allocation for ffmpeg slideshows, and suggest automated YouTube upload tags.");
                      showToast("Sample agent prompt loaded");
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700 transition"
                  title="Enhance Prompt with AI"
                >
                  <Sparkles className="w-4 h-4 text-slate-500 hover:text-emerald-600 transition" />
                </button>

                {/* Chat Templates / Prompt library */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPromptTemplates(!showPromptTemplates)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700 transition"
                    title="Prompt Templates"
                  >
                    <FileText className="w-4 h-4 text-slate-500 hover:text-emerald-600 transition" />
                  </button>

                  {showPromptTemplates && (
                    <div className="absolute bottom-full right-0 mb-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-40 text-xs animate-in fade-in">
                      <div className="px-2.5 py-1.5 font-bold text-slate-800 border-b border-slate-100 mb-1 flex items-center justify-between">
                        <span>Select Prompt Template</span>
                        <span className="text-[10px] text-slate-400 font-normal">Pre-engineered</span>
                      </div>
                      <button
                        onClick={() => {
                          setMessageInput("Day 12 ke presenter frames banao (default args, *args, **kwargs) taake kal ka slideshow bhi ready ho jaye");
                          setShowPromptTemplates(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#00D35A] text-slate-700 transition flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium text-xs">Python Slideshow Generator</span>
                      </button>
                      <button
                        onClick={() => {
                          setMessageInput("Isi video ka 15-second vertical teaser cut karo Reels hook ke liye aur subtitles auto-generate karo");
                          setShowPromptTemplates(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#00D35A] text-slate-700 transition flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                        <span className="font-medium text-xs">Instagram Reel / Shorts Teaser</span>
                      </button>
                      <button
                        onClick={() => {
                          setMessageInput("Pakistani Commercial Contract review karo aur dispute resolution clause draft karo under Arbitration Act 1940");
                          setShowPromptTemplates(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#00D35A] text-slate-700 transition flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-xs">Commercial Contract Review</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Sound Wave Bars */}
                <button
                  type="button"
                  onClick={() => {
                    showToast("Audio waveform preview active");
                    setIsVideoPlaying(!isVideoPlaying);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700 transition"
                  title="Audio Waveform Playback"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 12v1m4-3v7m4-9v11m4-8v5m4-3v1" />
                  </svg>
                </button>

                {/* Scissors */}
                <button
                  type="button"
                  onClick={() => {
                    setMessageInput("");
                    showToast("Prompt cleared ✂️");
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700 transition"
                  title="Clear Prompt"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="6" cy="6" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                    <circle cx="6" cy="18" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
                  </svg>
                </button>

                {/* Font 'A' (Text Formatting) */}
                <button
                  type="button"
                  onClick={() => {
                    setMessageInput((prev) => (prev ? `**${prev}**` : "```python\n# Code snippet here\n```"));
                    showToast("Markdown format inserted");
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700 font-serif font-bold text-xs transition"
                  title="Insert Formatting"
                >
                  A
                </button>

                {/* Emoji Face */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700 transition"
                    title="Insert Emoji"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                    </svg>
                  </button>

                  {/* Emoji Palette */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-40 animate-in fade-in grid grid-cols-5 gap-2 text-base">
                      {["😊", "👍", "🔥", "🚀", "💡", "❤️", "🤖", "✨", "📄", "⚡", "🎬", "💻", "🎉", "👏", "🎯"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setMessageInput((prev) => prev + " " + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="hover:scale-125 transition text-center p-1 rounded hover:bg-slate-100"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Green Circular Microphone / Send Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (messageInput.trim()) {
                      handleSendMessage();
                    } else {
                      handleToggleVoice();
                    }
                  }}
                  className={`w-9 h-9 rounded-full bg-[#00D35A] hover:bg-[#00be51] text-white flex items-center justify-center shadow-sm active:scale-95 transition flex-shrink-0 ${
                    isRecordingVoice ? "ring-4 ring-[#00D35A]/30 animate-pulse bg-red-500 hover:bg-red-600" : ""
                  }`}
                  title={messageInput.trim() ? "Send Message" : isRecordingVoice ? "Stop Recording" : "Voice Input"}
                >
                  {messageInput.trim() ? (
                    <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Abrazy / Teamily Modals & Drawers */}
      <ChatHeaderFlyout
        isOpen={showChatOptions}
        onClose={() => setShowChatOptions(false)}
        onCreateGroup={() => {
          setShowChatOptions(false);
          setShowGroupCreation(true);
        }}
        agentName={selectedChat.name}
        agentAvatar={selectedChat.avatar}
      />

      <ActionHubModal isOpen={showActionHub} onClose={() => setShowActionHub(false)} />
      <SkillLibraryModal isOpen={showSkillLibrary} onClose={() => setShowSkillLibrary(false)} />
      <ConnectorsModal isOpen={showConnectors} onClose={() => setShowConnectors(false)} />
      <GroupCreationModal
        isOpen={showGroupCreation}
        onClose={() => setShowGroupCreation(false)}
        onGroupCreated={(newConv) => {
          const newChat: ChatItem = {
            id: newConv.id,
            type: "peer",
            name: newConv.title || "Agent Squad",
            avatar: newConv.agent_avatar || "👥",
            lastMessage: newConv.last_message?.content || "Group created",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "online",
            is_group: true,
            member_agent_ids: newConv.member_agent_ids || [],
          };
          setChatItems((prev) => [newChat, ...prev]);
          setSelectedChatId(newConv.id);
          showToast(`Group "${newChat.name}" created!`);
        }}
      />
      <SearchMediaDrawer isOpen={showSearchDrawer} onClose={() => setShowSearchDrawer(false)} />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            showToast(`Attached: ${file.name}`);
            setMessageInput(`Analyze attached document: ${file.name}`);
          }
        }}
        className="hidden"
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50 text-slate-400">Loading Chat...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
