"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function NavigationRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPlusModal, setShowPlusModal] = useState(false);

  return (
    <>
      <aside className="w-16 h-screen bg-white border-r border-slate-200/90 flex flex-col items-center py-3 select-none z-30 flex-shrink-0">
        {/* 1. Brand Logo (Teamily Green Circle with stylized monogram) */}
        <Link className="mb-4" href="/chat">
          <div className="w-10 h-10 rounded-full bg-[#00D35A] hover:bg-[#00be51] flex items-center justify-center text-white font-extrabold shadow-sm transition-transform active:scale-95">
            {/* Teamily 'tp' stylized monogram mark */}
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M7 6h10v3H14v9h-3V9H7V6zm9 4a3.5 3.5 0 0 1 3.5 3.5V17a3.5 3.5 0 0 1-3.5 3.5H14v-2.5h2a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 16 12v-2z" />
            </svg>
          </div>
        </Link>

        {/* 2. Primary Navigation Group */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* Chats (Active with soft green background in screenshot) */}
          <Link
            href="/chat"
            title="Chats"
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
              pathname === "/chat"
                ? "bg-[#eaf8ee] text-[#00D35A]"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>

          {/* Agents / Bot */}
          <Link
            href="/discover?tab=agents"
            title="Agents"
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
              pathname.startsWith("/discover") || pathname === "/dashboard"
                ? "bg-[#eaf8ee] text-[#00D35A]"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <rect x="4" y="6" width="16" height="13" rx="3" />
              <circle cx="9" cy="12" r="1.5" fill="currentColor" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" />
              <path strokeLinecap="round" d="M12 2v4M2 13h2M20 13h2" />
            </svg>
          </Link>

          {/* Automations */}
          <Link
            href="/automations"
            title="Automations"
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
              pathname.startsWith("/automations")
                ? "bg-[#eaf8ee] text-[#00D35A]"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </Link>

          {/* Compass / Discover */}
          <Link
            href="/discover"
            title="Explore"
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
              pathname === "/discover"
                ? "bg-[#eaf8ee] text-[#00D35A]"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.2" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Brain / Skills with green '57' badge */}
          <Link
            href="/memory"
            title="Knowledge & Skills"
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 bg-[#00D35A] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs leading-tight">
              57
            </span>
          </Link>

          {/* Layers / Workspace */}
          <Link
            href="/feed"
            title="Layers"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </Link>

          {/* Contacts / Team with green '13' badge */}
          <button
            type="button"
            onClick={() => router.push("/chat")}
            title="Contacts & Teams"
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 bg-[#00D35A] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs leading-tight">
              13
            </span>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* 3. Bottom Utilities Group */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* Download App Tray */}
          <button
            type="button"
            onClick={() => alert("Abrazy Desktop & Mobile App: Download links ready for Windows, macOS, Android, and iOS.")}
            title="Download App"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Globe / Language */}
          <button
            type="button"
            onClick={() => alert("Language: English (US) / Urdu (اردو) / Roman Urdu supported.")}
            title="Language"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
          </button>

          {/* PLUS Link */}
          <button
            type="button"
            onClick={() => setShowPlusModal(true)}
            className="text-[10px] font-bold text-slate-400 tracking-wider hover:text-purple-600 cursor-pointer transition py-0.5"
          >
            PLUS
          </button>

          {/* Gift Box / Rewards */}
          <button
            type="button"
            onClick={() => setShowPlusModal(true)}
            title="Rewards & Referral"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </button>

          {/* User Profile Avatar Popover */}
          <div className="relative mt-1">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-slate-200 hover:ring-[#00D35A] transition"
            >
              <img
                src="/assets/abraz_photo.png"
                alt="User"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold">
                AB
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-2 left-14 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-slate-100">
                  <p className="font-bold text-slate-900 text-sm">ABraz Baloch</p>
                  <p className="text-slate-500">mohdabrarbaloch@gmail.com</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-md font-bold text-[10px]">
                    ☆ PLUS MEMBER
                  </span>
                </div>
                <button
                  onClick={() => router.push("/settings")}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition mt-1"
                >
                  Settings & Account
                </button>
                <button
                  onClick={() => setShowPlusModal(true)}
                  className="w-full text-left px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-xl transition"
                >
                  Subscription & Billing
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/login");
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* PLUS Membership Modal */}
      {showPlusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <h3 className="font-bold text-slate-900 text-base">Abrazy AI PLUS</h3>
              </div>
              <button
                onClick={() => setShowPlusModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Unlock unlimited multi-modal autonomous agent execution, high-performance GPU rendering for video slideshows, and local-first memory graph sync.
            </p>
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span>Pro Creator Plan</span>
                <span className="text-sm font-extrabold">$20 / mo</span>
              </div>
              <p className="text-[11px] text-purple-700">✓ Unlimited agent tasks & ffmpeg rendering</p>
              <p className="text-[11px] text-purple-700">✓ Real LLM local + cloud hybrid model router</p>
              <p className="text-[11px] text-purple-700">✓ 50+ Prebuilt Autonomous Pakistani & Global Workflows</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPlusModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Upgrade successful! Your PLUS plan is now active.");
                  setShowPlusModal(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition"
              >
                Upgrade to PLUS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

