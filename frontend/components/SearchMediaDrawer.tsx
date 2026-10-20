"use client";
import { useState } from "react";

interface MediaItem {
  id: string;
  type: "photo" | "video" | "file" | "voice";
  url: string;
  thumbnail?: string;
  title: string;
  date: string;
  sender: string;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  date: string;
}

interface SearchMediaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_MESSAGES: Message[] = [
  { id: "1", text: "Can you help me with the deployment?", sender: "You", date: "2 hours ago" },
  { id: "2", text: "Sure! I'll create a deployment guide", sender: "AI Assistant", date: "2 hours ago" },
  { id: "3", text: "Generated marketing campaign ideas", sender: "Marketing Pro", date: "Yesterday" },
];

const DEMO_MEDIA: MediaItem[] = [
  { id: "p1", type: "photo", url: "/placeholder1.jpg", thumbnail: "🖼️", title: "Dashboard Mockup", date: "Today", sender: "Designer AI" },
  { id: "p2", type: "photo", url: "/placeholder2.jpg", thumbnail: "🎨", title: "Logo Variants", date: "Today", sender: "You" },
  { id: "p3", type: "photo", url: "/placeholder3.jpg", thumbnail: "📊", title: "Analytics Chart", date: "Yesterday", sender: "Data Analyst" },
  { id: "v1", type: "video", url: "/video1.mp4", thumbnail: "🎥", title: "Product Demo", date: "2 days ago", sender: "You" },
  { id: "v2", type: "video", url: "/video2.mp4", thumbnail: "🎬", title: "Tutorial Recording", date: "3 days ago", sender: "Code Architect" },
  { id: "p4", type: "photo", url: "/placeholder4.jpg", thumbnail: "🌆", title: "Hero Banner", date: "3 days ago", sender: "Creative Writer" },
];

const DEMO_FILES: MediaItem[] = [
  { id: "f1", type: "file", url: "/doc1.pdf", title: "Project Proposal.pdf", date: "Today", sender: "You" },
  { id: "f2", type: "file", url: "/doc2.xlsx", title: "Budget Analysis.xlsx", date: "Yesterday", sender: "Data Analyst" },
  { id: "f3", type: "file", url: "/doc3.docx", title: "Meeting Notes.docx", date: "2 days ago", sender: "Research Expert" },
];

const DEMO_VOICE: MediaItem[] = [
  { id: "vo1", type: "voice", url: "/voice1.mp3", title: "Voice Message", date: "1 hour ago", sender: "You" },
  { id: "vo2", type: "voice", url: "/voice2.mp3", title: "Voice Note", date: "Yesterday", sender: "Marketing Pro" },
];

export default function SearchMediaDrawer({ isOpen, onClose }: SearchMediaDrawerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "messages" | "photos" | "files" | "voice">("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const photosAndVideos = DEMO_MEDIA;
  const allItems = [...DEMO_MESSAGES.map(m => ({ ...m, type: "message" as const })), ...DEMO_MEDIA, ...DEMO_FILES, ...DEMO_VOICE];

  const getFilteredContent = () => {
    switch (activeTab) {
      case "messages":
        return DEMO_MESSAGES.filter(m => 
          m.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "photos":
        return photosAndVideos.filter(m => 
          m.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "files":
        return DEMO_FILES.filter(f => 
          f.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "voice":
        return DEMO_VOICE;
      default:
        return allItems;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? "bg-opacity-30" : "bg-opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Search Media</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in chat..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All", icon: "📂" },
              { id: "messages", label: "Messages", icon: "💬" },
              { id: "photos", label: "Photos & Videos", icon: "🖼️" },
              { id: "files", label: "Files", icon: "📄" },
              { id: "voice", label: "Voice", icon: "🎤" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "all" && (
            <div className="space-y-4">
              {getFilteredContent().map((item: any) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  {item.type === "message" ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">{item.sender}</span>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{item.text}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xl">
                        {item.thumbnail || item.type === "file" ? "📄" : "🎤"}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.sender} • {item.date}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "messages" && (
            <div className="space-y-3">
              {getFilteredContent().map((msg: any) => (
                <div key={msg.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{msg.text}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "photos" && (
            <div>
              <div className="mb-3 text-sm text-gray-600">
                {photosAndVideos.length} items found
              </div>
              <div className="grid grid-cols-3 gap-2">
                {photosAndVideos.map(item => (
                  <div
                    key={item.id}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative hover:ring-2 hover:ring-green-500 transition-all"
                  >
                    {/* Placeholder thumbnail */}
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-100 to-pink-100">
                      {item.thumbnail}
                    </div>
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-white text-gray-900 rounded-full text-xs font-medium transition-opacity">
                        {item.type === "video" ? "▶ Play" : "👁️ View"}
                      </button>
                    </div>

                    {/* Video badge */}
                    {item.type === "video" && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black bg-opacity-70 text-white text-xs rounded">
                        🎥 Video
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-2">
              {DEMO_FILES.map(file => (
                <div
                  key={file.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-xl">
                    📄
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{file.title}</div>
                    <div className="text-xs text-gray-500">{file.sender} • {file.date}</div>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "voice" && (
            <div className="space-y-2">
              {DEMO_VOICE.map(voice => (
                <div
                  key={voice.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <button className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors">
                      ▶
                    </button>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{voice.title}</div>
                      <div className="text-xs text-gray-500">{voice.sender} • {voice.date}</div>
                    </div>
                    <span className="text-xs text-gray-500">0:42</span>
                  </div>
                  {/* Waveform visualization placeholder */}
                  <div className="flex items-center gap-0.5 h-8">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-green-200 rounded-full"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {getFilteredContent().length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500">No results found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
