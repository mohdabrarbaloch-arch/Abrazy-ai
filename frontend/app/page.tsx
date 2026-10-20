"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  BrainCircuit,
  Search,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Cpu,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  Play,
  Terminal,
  Activity,
  ChevronRight,
  Bot
} from "lucide-react";
import { GroqLogo, GeminiLogo, OpenAILogo, ClaudeLogo } from "@/components/BrandLogos";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"squad" | "memory" | "tools" | "byok">("squad");

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-600/15 via-teal-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-48 w-[600px] h-[600px] bg-cyan-600/10 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[1400px] -right-48 w-[700px] h-[700px] bg-purple-600/10 blur-[180px] pointer-events-none -z-10" />

      {/* 1. Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070A0F]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#070A0F] rounded-[11px] flex items-center justify-center group-hover:bg-transparent transition duration-300">
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:text-slate-900 transition" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Abrazy.ai
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI Workforce OS
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/chat" className="hover:text-emerald-400 transition">
              Workforce Room
            </Link>
            <Link href="/discover" className="hover:text-emerald-400 transition">
              Agent Directory
            </Link>
            <Link href="/automations" className="hover:text-emerald-400 transition">
              Automations
            </Link>
            <Link href="/memory" className="hover:text-emerald-400 transition">
              Living Memory Graph
            </Link>
            <Link href="/feed" className="hover:text-emerald-400 transition">
              Activity Feed
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex text-xs font-semibold px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
            >
              Sign In
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 transition active:scale-95"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300 shadow-inner mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-semibold">Teamily-Grade Architecture</span>
          <span className="text-slate-500">·</span>
          <span>Autonomous Multi-Agent Turn Taking is Live</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Build & Orchestrate Your{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Autonomous AI Workforce
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed mb-10">
          Coordinate specialized multi-agent squads, persistent 2D living memory graphs, and free real-time web & image tools into unified automated workflows.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link
            href="/chat"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <span>Launch Autonomous Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/discover"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Explore Agent Squads</span>
          </Link>
          <Link
            href="/automations"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 text-slate-300 font-medium text-sm flex items-center justify-center gap-2 transition"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Automations Scheduler</span>
          </Link>
        </div>

        {/* 3. Interactive Squad Room Live Simulation Preview */}
        <div className="w-full max-w-5xl rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-950/80 p-[1px] shadow-2xl shadow-emerald-950/30">
          <div className="w-full rounded-2xl bg-[#0B0F17] overflow-hidden border border-slate-800/80 flex flex-col text-left">
            {/* Window Title Bar */}
            <div className="h-11 bg-slate-900/90 px-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <span>Squad Room: Product Launch & Engineering Core</span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                    4 Agents Collaborating
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sequential Turn-Taking SSE</span>
                </span>
              </div>
            </div>

            {/* Simulated Live Chat Stream */}
            <div className="p-6 space-y-4 bg-[#090D14]/90 min-h-[380px] max-h-[460px] overflow-y-auto">
              {/* User Prompt */}
              <div className="flex justify-end">
                <div className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 rounded-2xl rounded-tr-xs px-4 py-3 max-w-xl text-xs leading-relaxed shadow-sm">
                  <span className="font-semibold block text-emerald-300 text-[11px] mb-1">User Command:</span>
                  "Design a launch campaign for our new autonomous AI features. Include real market competitor pricing, a photorealistic hero banner mockup, and a Python worker script for automated reporting."
                </div>
              </div>

              {/* Agent 1: Lead Strategist */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xs text-purple-300 font-bold flex-shrink-0">
                  LS
                </div>
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">Lead Strategist</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">groq/llama-3.3-70b</span>
                    <span className="text-[10px] text-slate-500">Turn 1/3</span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-300 leading-relaxed">
                    Strategy outline compiled:
                    <ul className="list-disc ml-4 mt-1.5 space-y-1 text-slate-400">
                      <li>Position Abrazy.ai as the zero-token-tax workforce alternative to Teamily and CrewAI.</li>
                      <li>Delegating live competitor audit to <span className="text-emerald-400 font-medium">@Web Intelligence</span>.</li>
                      <li>Delegating visual banner synthesis to <span className="text-cyan-400 font-medium">@Creative Media Agent</span>.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tool Execution Pill: Web Search */}
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 px-3.5 py-1.5 rounded-full w-max border border-emerald-800/50">
                <Search className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span className="font-mono text-[11px]">web_search: "autonomous AI agent platforms enterprise pricing 2026" (DuckDuckGo Live)</span>
              </div>

              {/* Agent 2: Creative Media Agent with Pollinations Artifact */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-300 font-bold flex-shrink-0">
                  CM
                </div>
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">Creative Media Agent</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">gemini-2.5-flash</span>
                    <span className="text-[10px] text-slate-500">Turn 2/3</span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-300 leading-relaxed">
                    Hero asset generated with Pollinations AI pipeline:
                    <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950">
                      <div className="h-32 bg-gradient-to-tr from-emerald-900/40 via-cyan-900/40 to-slate-900 flex items-center justify-center border-b border-slate-800">
                        <div className="flex items-center gap-3 text-emerald-400">
                          <ImageIcon className="w-6 h-6 animate-pulse" />
                          <span className="font-mono text-xs text-slate-300">hero_autonomous_workforce_1024x1024.png</span>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-slate-900 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Prompt: "Futuristic holographic AI squad collaborative control room, octane render"</span>
                        <span className="text-emerald-400 font-semibold font-mono">100% Free · Real-Time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="h-12 bg-slate-900/70 border-t border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <GroqLogo className="w-3.5 h-3.5" />
                  <span>Groq LLaMA 3.3 (300 T/s)</span>
                </span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="hidden sm:flex items-center gap-1.5 text-slate-300 font-medium">
                  <GeminiLogo className="w-3.5 h-3.5" />
                  <span>Gemini 2.5 Flash</span>
                </span>
              </div>
              <Link
                href="/chat"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
              >
                <span>Open in Full Workspace</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Enterprise Architecture Pillars */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Core Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-4">
            Engineered for Production AI Teams
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every layer of Abrazy.ai is designed to operate seamlessly without third-party API token extortion or opaque lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-emerald-500/40 transition duration-300 group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-100">Multi-Agent Squads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Autonomous turn-taking loops where specialist personas communicate sequentially, review each other's outputs, and deliver finished deliverables in a single room.
              </p>
            </div>
            <Link href="/discover" className="mt-6 text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
              <span>View pre-built squads</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-purple-500/40 transition duration-300 group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-100">Living 2D Memory Graph</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive D3 physics knowledge graph that maps every user concept, preference, and entity into persistent semantic nodes and weighted relational edges.
              </p>
            </div>
            <Link href="/memory" className="mt-6 text-xs font-semibold text-purple-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
              <span>Explore memory graph</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition duration-300 group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-100">Free Real-Time Tools</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Native DuckDuckGo web search, Pollinations AI image generation, and Jina Reader webpage scraper ready out of the box with zero subscription required.
              </p>
            </div>
            <Link href="/chat" className="mt-6 text-xs font-semibold text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
              <span>Test live tools</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-amber-500/40 transition duration-300 group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-100">Universal BYOK Router</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Switch seamlessly between Groq LLaMA 3.3, Google Gemini 2.5 Flash, Anthropic Claude 3.5 Sonnet, and OpenAI GPT-4o with optional dynamic custom key overrides.
              </p>
            </div>
            <Link href="/settings" className="mt-6 text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
              <span>Configure API keys</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Quick Action Directory Cards */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to deploy your first autonomous squad?
            </h2>
            <p className="text-slate-400 text-sm">
              Launch into the full workspace or jump directly into our pre-engineered modules:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/chat"
              className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <Bot className="w-4 h-4" />
                  <span>Main Chat Room</span>
                </span>
                <p className="text-xs text-slate-300">
                  Full multi-agent room with WhatsApp wallpaper & live tool execution.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-slate-400 group-hover:text-white flex items-center gap-1">
                Launch Workspace <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/automations"
              className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Automations & Cron</span>
                </span>
                <p className="text-xs text-slate-300">
                  Daily morning briefs, Python video production, and industry monitors.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-slate-400 group-hover:text-white flex items-center gap-1">
                Manage Automations <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/discover"
              className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 mb-1">
                  <Users className="w-4 h-4" />
                  <span>Squad Marketplace</span>
                </span>
                <p className="text-xs text-slate-300">
                  Browse, clone, and deploy specialized engineering and content squads.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-slate-400 group-hover:text-white flex items-center gap-1">
                Browse Directory <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 bg-[#05070B] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">Abrazy.ai</span>
            <span>·</span>
            <span>Enterprise Multi-Agent Operating System</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-medium">All Engine Services Operational</span>
            </div>
            <span>© 2026 Abrazy.ai Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
