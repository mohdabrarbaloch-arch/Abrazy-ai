"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import NavigationRail from "@/components/NavigationRail";
import { api } from "@/lib/api";
import {
  Search,
  Image as ImageIcon,
  Code,
  Zap,
  ArrowRight,
  Heart,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Layers,
  Globe,
  Bot
} from "lucide-react";

interface FeedItem {
  id: string;
  type: string;
  title: string;
  description: string;
  content?: string | null;
  author: string;
  author_avatar?: string | null;
  media_url?: string | null;
  timestamp: string;
  conversation_id?: string | null;
  likes: number;
  comments: number;
  tags: string[];
}

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const fetchFeed = async (filter: string) => {
    setIsLoading(true);
    try {
      const data = await api.getFeed(filter === "all" ? undefined : filter);
      setItems(data);
    } catch (err) {
      console.warn("Feed fetch fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(activeFilter);
  }, [activeFilter]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, likes: item.likes + (likedMap[id] ? -1 : 1) }
          : item
      )
    );
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-3.5 h-3.5 text-cyan-500" />;
      case "code":
        return <Code className="w-3.5 h-3.5 text-blue-500" />;
      case "research":
        return <Search className="w-3.5 h-3.5 text-emerald-500" />;
      case "automation":
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Bot className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800">
      <NavigationRail />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md z-20 px-8 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Activity & Artifact Feed</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-[#00A843] text-xs font-bold rounded-full border border-emerald-200">
                  {items.length} Live Artifacts
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time agent generation outputs, web syntheses, and automated deliverables
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200/80">
              {[
                { id: "all", label: "All Activities" },
                { id: "image", label: "Visual Media" },
                { id: "research", label: "Web Intelligence" },
                { id: "code", label: "Code & Scripts" },
                { id: "automation", label: "Automations" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition ${
                    activeFilter === tab.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="px-4 py-2 bg-[#00D35A] hover:bg-[#00be51] text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
            </Link>
          </div>
        </header>

        {/* Feed Cards Grid */}
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 bg-slate-200/60 rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const isLiked = likedMap[item.id];

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Media Header Preview */}
                      {item.media_url ? (
                        <div className="h-48 w-full bg-slate-900 relative overflow-hidden group">
                          <img
                            src={item.media_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1.5 border border-white/10">
                            <ImageIcon className="w-3 h-3 text-cyan-400" />
                            <span>Generated Media</span>
                          </div>
                          <a
                            href={item.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-900/80 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                            title="Open full resolution"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <div className="p-5 pb-0 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                            {getBadgeIcon(item.type)}
                            <span className="uppercase tracking-wider">{item.type}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {item.timestamp}
                          </span>
                        </div>
                      )}

                      {/* Content Body */}
                      <div className="p-5">
                        <h3 className="font-bold text-sm text-slate-900 mb-1.5 group-hover:text-emerald-700 transition line-clamp-1">
                          {item.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                          {item.description}
                        </p>

                        {/* Code snippet preview if code item */}
                        {item.type === "code" && item.content && (
                          <div className="bg-slate-900 text-slate-200 text-[11px] font-mono p-3 rounded-xl mb-3 overflow-x-auto max-h-28 border border-slate-800">
                            {item.content.replace(/```python|```/g, "").trim()}
                          </div>
                        )}

                        {/* Author line */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[10px] font-bold">
                            {item.author[0]}
                          </div>
                          <span className="font-semibold text-slate-700 text-xs">
                            {item.author}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => toggleLike(item.id, e)}
                          className={`flex items-center gap-1 text-xs transition ${
                            isLiked
                              ? "text-red-500 font-bold"
                              : "text-slate-500 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                          />
                          <span>{item.likes}</span>
                        </button>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MessageSquare className="w-4 h-4" />
                          <span>{item.comments}</span>
                        </span>
                      </div>

                      <Link
                        href={`/chat?conversationId=${item.conversation_id || "1"}`}
                        className="text-xs font-bold text-[#00A843] hover:text-[#008f39] flex items-center gap-1 group-hover:translate-x-0.5 transition"
                      >
                        <span>Open in Chat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-200/90 rounded-3xl max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#00D35A] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No artifacts found in this category</h3>
              <p className="text-xs text-slate-500 mt-1">Run an agent in the Workforce room to produce new artifacts.</p>
              <Link
                href="/chat"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#00D35A] text-white text-xs font-bold rounded-full shadow-sm"
              >
                <span>Launch Workforce</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
