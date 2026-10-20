"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavigationRail from "@/components/NavigationRail";
import { api } from "@/lib/api";
import { Play, ArrowRight, Check, X, Sparkles, CheckCircle2 } from "lucide-react";

interface MyAutomationItem {
  id: string;
  title: string;
  schedule: string;
  agent: string;
  enabled: boolean;
  last_run_at?: string | null;
  last_result?: string | null;
}

interface AutomationTemplate {
  id: string;
  category: "work" | "life";
  title: string;
  description: string;
  iconName: string;
  intent: string;
  intentLabel: string;
  intentDesc: string;
  compiledPrompt: string;
  assignedAgent: string;
}

const INITIAL_MY_AUTOMATIONS: MyAutomationItem[] = [
  {
    id: "auto-1",
    title: "Python Seekho — 31-Day Content + Video + Presenter Frames (Daily 12 AM Karachi)",
    schedule: "Daily at 00:00",
    agent: "Super Agent",
    enabled: true,
  },
  {
    id: "auto-2",
    title: "Daily Morning Briefing — 9 AM Karachi",
    schedule: "Daily at 09:00",
    agent: "Super Agent",
    enabled: true,
  },
  {
    id: "auto-3",
    title: "Fuzzy Search Meeting Reminder (14 Aug 10:00)",
    schedule: "45 9 14 8 *",
    agent: "Super Agent",
    enabled: true,
  },
  {
    id: "auto-4",
    title: "Autonomous AI Software Engineer – 30 Day Challenge (Daily 12 AM Karachi)",
    schedule: "Daily at 00:00",
    agent: "Super Agent",
    enabled: true,
  },
];

const WORK_TEMPLATES: AutomationTemplate[] = [
  {
    id: "work-meeting",
    category: "work",
    title: "Meeting reminder + prep",
    description: "Remind me before a meeting and pull the latest materials",
    iconName: "bell",
    intent: "Research",
    intentLabel: "🔬 Research",
    intentDesc: "Investigate a question, return sourced findings.",
    compiledPrompt: "Research Remind me to the board meeting, and pull the latest deck from the Deck Working Group 30 minutes before",
    assignedAgent: "@My Personal AI",
  },
  {
    id: "work-brief",
    category: "work",
    title: "Daily work brief",
    description: "Every morning, summarize progress, to-dos and risks",
    iconName: "newspaper",
    intent: "Briefing",
    intentLabel: "📋 Briefing",
    intentDesc: "Synthesize high-priority updates into a clean morning digest.",
    compiledPrompt: "Summarize today's active tasks, blocker risks, and progress across all ongoing projects every morning at 9 AM",
    assignedAgent: "@Super Agent",
  },
  {
    id: "work-competitor",
    category: "work",
    title: "Competitor / industry monitor",
    description: "Keep watching and ping me when something changes",
    iconName: "eye",
    intent: "Monitor",
    intentLabel: "👁️ Monitor",
    intentDesc: "Watch external websites and alerts; notify on anomalies.",
    compiledPrompt: "Keep watching competitor releases, pricing changes, and top industry news, and notify me with immediate bullet points",
    assignedAgent: "@Super Agent",
  },
  {
    id: "work-squad",
    category: "work",
    title: "Expert group research",
    description: "Spin up an expert agent squad to investigate a question",
    iconName: "flask",
    intent: "Research",
    intentLabel: "🧪 Squad",
    intentDesc: "Coordinate multiple subagents for deep research.",
    compiledPrompt: "Spin up an expert squad of AI researchers and financial analysts to thoroughly investigate market feasibility and summarize findings",
    assignedAgent: "@Super Agent",
  },
  {
    id: "work-deck",
    category: "work",
    title: "Make a deck / report",
    description: "Produce a presentation or report I can publish",
    iconName: "chart",
    intent: "Draft",
    intentLabel: "📊 Presentation",
    intentDesc: "Generate slide outlines, key takeaways, and visual layouts.",
    compiledPrompt: "Compile key performance milestones and project deliverables into an executive-ready slide deck outline with speaker notes",
    assignedAgent: "@Super Agent",
  },
  {
    id: "work-webpage",
    category: "work",
    title: "Build a webpage / tool",
    description: "Build a small web page or utility for a purpose",
    iconName: "code",
    intent: "Build",
    intentLabel: "💻 Development",
    intentDesc: "Scaffold interactive frontend components and utility scripts.",
    compiledPrompt: "Design and implement a responsive web utility with modern styling, clean state management, and ready-to-run code",
    assignedAgent: "@Super Agent",
  },
  {
    id: "work-breakdown",
    category: "work",
    title: "Break down & assign tasks",
    description: "Split a project into sub-tasks and track owners",
    iconName: "tasks",
    intent: "Plan",
    intentLabel: "📝 Task Plan",
    intentDesc: "Decompose complex initiatives into milestone-driven tasks.",
    compiledPrompt: "Split our current project milestone into granular sub-tasks, assign priority levels, and draft an ownership checklist",
    assignedAgent: "@My Personal AI",
  },
  {
    id: "work-voice",
    category: "work",
    title: "Reply in my voice",
    description: "Let my AI Twin draft replies; I confirm anything risky",
    iconName: "chat",
    intent: "Draft",
    intentLabel: "✍️ AI Twin",
    intentDesc: "Draft contextual responses in your personal tone.",
    compiledPrompt: "Analyze incoming messages and craft authentic, empathetic draft replies in my voice, flagging any decisions requiring approval",
    assignedAgent: "@My Personal AI",
  },
  {
    id: "work-investment",
    category: "work",
    title: "Investment / market research",
    description: "AI + finance experts study a strategy together",
    iconName: "trend",
    intent: "Research",
    intentLabel: "📈 Finance",
    intentDesc: "Analyze market indicators, equity fundamentals, and risks.",
    compiledPrompt: "Conduct comparative market valuation and macroeconomic risk analysis for high-growth tech sectors and draft actionable conclusions",
    assignedAgent: "@Super Agent",
  },
  {
    id: "work-goal",
    category: "work",
    title: "Drive a goal (deck, launch...)",
    description: "Break a big goal into milestones and keep pushing",
    iconName: "target",
    intent: "Drive",
    intentLabel: "🎯 Goal Driver",
    intentDesc: "Actively track progress and ping when milestones slip.",
    compiledPrompt: "Drive our key product launch goal by organizing weekly targets, monitoring delivery status, and proactively pushing next steps",
    assignedAgent: "@Super Agent",
  },
  {
    id: "work-inbox",
    category: "work",
    title: "Inbox triage & follow-ups",
    description: "Summarize messages and surface what needs a reply",
    iconName: "send",
    intent: "Triage",
    intentLabel: "📨 Triage",
    intentDesc: "Categorize email threads and draft smart follow-up cues.",
    compiledPrompt: "Review inbox threads, highlight urgent inquiries needing replies today, and provide concise response drafts",
    assignedAgent: "@My Personal AI",
  },
  {
    id: "work-timezone",
    category: "work",
    title: "Cross-timezone relay",
    description: "Queue messages and log decisions across timezones",
    iconName: "globe",
    intent: "Relay",
    intentLabel: "🌐 Global Relay",
    intentDesc: "Keep asynchronous global teams in sync across shift handoffs.",
    compiledPrompt: "Aggregate end-of-day project decisions and queue comprehensive handover notes for our overseas collaborators",
    assignedAgent: "@Super Agent",
  },
];

const LIFE_TEMPLATES: AutomationTemplate[] = [
  {
    id: "life-birthday",
    category: "life",
    title: "Birthday / anniversary reminder",
    description: "Remind me ahead of time and suggest a gift",
    iconName: "cake",
    intent: "Reminder",
    intentLabel: "🎂 Reminder",
    intentDesc: "Track annual celebrations with thoughtful suggestions.",
    compiledPrompt: "Alert me 7 days before upcoming birthdays and anniversaries, and suggest 3 personalized gift options based on their interests",
    assignedAgent: "@My Personal AI",
  },
  {
    id: "life-health",
    category: "life",
    title: "Health / habit reminder",
    description: "Remind me at a set time every day",
    iconName: "pill",
    intent: "Habit",
    intentLabel: "💊 Daily Habit",
    intentDesc: "Maintain healthy routines with timely micro-checkins.",
    compiledPrompt: "Send me gentle habit reminders throughout the day for hydration, screen breaks, physical posture, and evening workouts",
    assignedAgent: "@My Personal AI",
  },
  {
    id: "life-family",
    category: "life",
    title: "Check in on family",
    description: "Regularly check in and alert me if something's off",
    iconName: "heart",
    intent: "Care",
    intentLabel: "🩺 Family Care",
    intentDesc: "Stay connected with family members and track milestones.",
    compiledPrompt: "Prompt me every weekend to reach out to family, and keep a shared log of important personal and medical check-ins",
    assignedAgent: "@My Personal AI",
  },
  {
    id: "life-together",
    category: "life",
    title: "Plan a get-together",
    description: "Match everyone's free time and suggest places",
    iconName: "coffee",
    intent: "Social",
    intentLabel: "☕ Social Event",
    intentDesc: "Coordinate schedules and recommend trending venues.",
    compiledPrompt: "Coordinate free time across group members, suggest top-rated local cafes and restaurants, and format an invitation message",
    assignedAgent: "@My Personal AI",
  },
  {
    id: "life-trip",
    category: "life",
    title: "Plan a trip",
    description: "Itinerary, stays and budget — collaborate with others",
    iconName: "plane",
    intent: "Travel",
    intentLabel: "✈️ Travel Plan",
    intentDesc: "Build multi-day travel itineraries and cost estimations.",
    compiledPrompt: "Design an optimized 4-day travel itinerary including recommended stays, flight estimates, activities, and budget guidelines",
    assignedAgent: "@Super Agent",
  },
  {
    id: "life-media",
    category: "life",
    title: "Make an image / short video",
    description: "Generate visual content I can post to my Feed",
    iconName: "image",
    intent: "Creative",
    intentLabel: "🎨 Media Creator",
    intentDesc: "Generate prompts, visual assets, and video reel scripts.",
    compiledPrompt: "Generate an aesthetic social media visual prompt along with engaging captions and hashtag suggestions for my Feed",
    assignedAgent: "@Super Agent",
  },
  {
    id: "life-interest",
    category: "life",
    title: "Daily interest brief",
    description: "Each day, a digest of a topic I care about",
    iconName: "mobile",
    intent: "Briefing",
    intentLabel: "📱 Interest Digest",
    intentDesc: "Daily briefing on personal hobbies, tech, or culture.",
    compiledPrompt: "Deliver a curated 3-minute morning briefing summarizing breakthrough developments in AI, indie hacking, and open source",
    assignedAgent: "@Super Agent",
  },
  {
    id: "life-finance",
    category: "life",
    title: "Personal finance decision",
    description: "Think through a spending or money decision together",
    iconName: "wallet",
    intent: "Finance",
    intentLabel: "👛 Personal Finance",
    intentDesc: "Evaluate budget allocations, investments, and purchase ROI.",
    compiledPrompt: "Help me evaluate this upcoming financial purchase against my savings goals and provide an objective pros-and-cons analysis",
    assignedAgent: "@Super Agent",
  },
  {
    id: "life-skill",
    category: "life",
    title: "Learn a skill (goal)",
    description: "A weekly plan with practice and check-ins",
    iconName: "book",
    intent: "Learn",
    intentLabel: "🎓 Learning Plan",
    intentDesc: "Structured multi-week curriculum with accountability.",
    compiledPrompt: "Create a 4-week structured curriculum to master Next.js 15 and AI agents, including daily practice exercises and weekly milestones",
    assignedAgent: "@Super Agent",
  },
  {
    id: "life-album",
    category: "life",
    title: "Memory / photo album",
    description: "Turn photos into a shareable memory album",
    iconName: "camera",
    intent: "Memories",
    intentLabel: "📷 Memory Album",
    intentDesc: "Organize visual media into chronological highlight albums.",
    compiledPrompt: "Organize uploaded photos into a curated highlight album with storytelling captions and a shareable summary overview",
    assignedAgent: "@My Personal AI",
  },
  {
    id: "life-friend",
    category: "life",
    title: "Be there for a friend",
    description: "Switch to listening mode when a friend is low",
    iconName: "moon",
    intent: "Support",
    intentLabel: "🌙 Listening Mode",
    intentDesc: "Thoughtful ideas and empathetic messages to support loved ones.",
    compiledPrompt: "Provide supportive, non-intrusive message suggestions and care package ideas for a friend going through a tough week",
    assignedAgent: "@My Personal AI",
  },
  {
    id: "life-deals",
    category: "life",
    title: "Shopping deal watch",
    description: "Watch a price and alert me when it drops",
    iconName: "cart",
    intent: "Shopping",
    intentLabel: "🛒 Price Alert",
    intentDesc: "Track product prices and ping immediately when discounts go live.",
    compiledPrompt: "Track price drops and active discount vouchers on desired items, and alert me with direct checkout links whenever the price falls",
    assignedAgent: "@Super Agent",
  },
];

function renderTemplateIcon(iconName: string) {
  switch (iconName) {
    case "bell":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      );
    case "newspaper":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
        </svg>
      );
    case "eye":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "flask":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m14.25-5.682l-4.091-4.091a2.25 2.25 0 00-1.591-.659V3.104M9.75 3.104a2.25 2.25 0 014.5 0M9.75 3.104h4.5M3 18.75a3 3 0 003 3h12a3 3 0 003-3c0-.98-.473-1.85-1.205-2.4l-3.32-3.32a.75.75 0 00-.53-.22H8.055a.75.75 0 00-.53.22L4.205 16.35C3.473 16.9 3 17.77 3 18.75z" />
        </svg>
      );
    case "chart":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case "code":
    case "globe":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "tasks":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      );
    case "chat":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.074-.75 5.952 5.952 0 011.085-2.915C4.004 15.86 3 14.03 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      );
    case "trend":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      );
    case "target":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "send":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      );
    case "cake":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25a3 3 0 11-6 0 3 3 0 016 0zm6 6.375a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 14.625V18a3 3 0 003 3h12a3 3 0 003-3v-3.375z" />
        </svg>
      );
    case "pill":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l-15 0m15 0c0 1.232-.046 2.453-.138 3.662a4.006 4.006 0 01-3.7 3.7 48.656 48.656 0 01-7.324 0 4.006 4.006 0 01-3.7-3.7c-.017-.22-.032-.441-.046-.662" />
        </svg>
      );
    case "heart":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    case "coffee":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20m0 0l-3 1m3-1l3 1M3 6h15a3 3 0 013 3v2a3 3 0 01-3 3H3V6zm15 2h1.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5H18V8z" />
        </svg>
      );
    case "plane":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      );
    case "image":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
        </svg>
      );
    case "mobile":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <rect x="6" y="2" width="12" height="20" rx="3" />
          <path strokeLinecap="round" d="M11 18h2" />
        </svg>
      );
    case "wallet":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      );
    case "book":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case "camera":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
      );
    case "moon":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      );
    case "cart":
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.143a.75.75 0 00-.712-.982H5.106M7.5 14.25L5.106 5.25M7.5 14.25l.383 1.437m0 0a3 3 0 105.734 0m-5.734 0h5.734m0 0a3 3 0 105.734 0" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
}

export default function AutomationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my" | "work" | "life">("work");
  const [searchQuery, setSearchQuery] = useState("");
  const [myAutomations, setMyAutomations] = useState<MyAutomationItem[]>(INITIAL_MY_AUTOMATIONS);
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<any | null>(null);

  // Detail / Composer State
  const [editablePrompt, setEditablePrompt] = useState("");
  const [currentSchedule, setCurrentSchedule] = useState("Run now");
  const [currentIntent, setCurrentIntent] = useState("");
  const [assignedAgent, setAssignedAgent] = useState("@My Personal AI");
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [showIntentDropdown, setShowIntentDropdown] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAutomations = async () => {
    try {
      const items = await api.listAutomations();
      if (items && items.length > 0) {
        setMyAutomations(
          items.map((i: any) => ({
            id: i.id,
            title: i.title,
            schedule: i.schedule_cron || "Daily at 09:00",
            agent: i.agent_name || "Super Agent",
            enabled: i.is_active,
            last_run_at: i.last_run_at,
            last_result: i.last_result,
          }))
        );
      }
    } catch (err) {
      console.warn("Backend automations offline, using local fallback:", err);
    }
  };

  useEffect(() => {
    loadAutomations();
  }, []);

  const openTemplateComposer = (template: AutomationTemplate) => {
    setSelectedTemplate(template);
    setEditablePrompt(template.compiledPrompt);
    setCurrentIntent(template.intent);
    setAssignedAgent(template.assignedAgent);
    setCurrentSchedule("Run now");
  };

  const toggleMyAutomation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.toggleAutomation(id);
      setMyAutomations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, enabled: updated.is_active } : item))
      );
      showToast(`Automation ${updated.is_active ? "activated" : "paused"}`);
    } catch {
      setMyAutomations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
      );
    }
  };

  const handleRunNow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRunningId(id);
    showToast("Executing automation with autonomous agent...");
    try {
      const res = await api.runAutomation(id);
      setRunResult(res);
      showToast("Automation execution finished successfully!");
      loadAutomations();
    } catch (err: any) {
      showToast(err.message || "Failed to execute automation");
    } finally {
      setRunningId(null);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!selectedTemplate) return;
    const finalTaskPrompt = `${editablePrompt}\n\n[Auto-Composed Execution Rule]\nRun schedule: ${currentSchedule}. Assigned agent: ${assignedAgent}. Intent: ${currentIntent}. Deliver result as sourced document.`;

    try {
      await api.createAutomation({
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        prompt_template: editablePrompt,
        schedule_cron: currentSchedule,
        category: selectedTemplate.category,
        is_active: true,
      });
      showToast("Automation created & saved to workspace!");
      loadAutomations();
    } catch (err) {
      console.warn("Could not save to backend:", err);
    }

    // Store in localStorage so Chat page can automatically populate or execute
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_agent_task", finalTaskPrompt);
      localStorage.setItem("selected_agent_name", assignedAgent.replace("@", ""));
    }
    router.push("/chat");
  };

  // Filter templates
  const workFiltered = WORK_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lifeFiltered = LIFE_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myFiltered = myAutomations.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800">
      {/* 1. Global Navigation Rail */}
      <NavigationRail />

      {/* 2. Main Automations Canvas */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md z-20 px-8 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Automations</h1>

            {/* Segmented Filter Pills */}
            <div className="flex items-center gap-2">
              {/* My Automations */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("my");
                  setSelectedTemplate(null);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  activeTab === "my" && !selectedTemplate
                    ? "bg-[#00D35A] text-white shadow-emerald-200"
                    : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span>My Automations</span>
              </button>

              {/* Work */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("work");
                  setSelectedTemplate(null);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  activeTab === "work" && !selectedTemplate
                    ? "bg-[#00D35A] text-white shadow-emerald-200"
                    : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                <span>Work</span>
              </button>

              {/* Life */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("life");
                  setSelectedTemplate(null);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  activeTab === "life" && !selectedTemplate
                    ? "bg-[#00D35A] text-white shadow-emerald-200"
                    : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span>Life</span>
              </button>
            </div>
          </div>

          {/* Search Box on Right */}
          <div className="relative w-72">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search automations..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D35A] focus:bg-white transition"
            />
          </div>
        </header>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl animate-fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D35A] animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Live Execution Result Modal */}
        {runResult && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{runResult.title}</h3>
                    <p className="text-[11px] text-slate-400">Executed by {runResult.agent_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRunResult(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 max-h-60 overflow-y-auto mb-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {runResult.output}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRunResult(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                {runResult.conversation_id && (
                  <button
                    type="button"
                    onClick={() => router.push(`/chat?conversationId=${runResult.conversation_id}`)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00D35A] hover:bg-[#00be51] text-white flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Open in Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {/* VIEW 1: Detail Composer View when Template Clicked (Screenshot 4) */}
          {selectedTemplate ? (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm animate-in fade-in zoom-in-95 duration-200">
              {/* Header with Back Arrow */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
                  title="Back to Automations"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedTemplate.title}</h2>
                  <p className="text-xs text-slate-500">Edit chips below — the prompt rewrites itself</p>
                </div>
              </div>

              {/* Compiled Prompt Box */}
              <div className="bg-[#FAFBFD] border border-slate-200/80 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider">COMPILED PROMPT</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md flex items-center gap-1 border border-emerald-200/60">
                    <span>#</span>
                    <span>AUTO-COMPOSED</span>
                  </span>
                </div>

                {/* Editable main prompt */}
                <textarea
                  value={editablePrompt}
                  onChange={(e) => setEditablePrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-sm text-slate-800 leading-relaxed font-normal focus:outline-none resize-none"
                />

                {/* Dotted separator */}
                <div className="border-t border-dotted border-slate-200 my-3" />

                {/* Execution Rule in green */}
                <div className="text-xs font-medium text-[#00A843] leading-relaxed flex items-start gap-1.5">
                  <span className="text-sm font-bold">+</span>
                  <span>
                    Run schedule: {currentSchedule}. Assign this to agent {assignedAgent}. Deliver the result as a sourced, co-editable document. Run once, then stop.
                  </span>
                </div>
              </div>

              {/* INTENT Section */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  INTENT <span className="normal-case font-normal text-slate-400">what</span>
                </label>
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowIntentDropdown(!showIntentDropdown)}
                    className="px-3.5 py-1.5 bg-emerald-50/70 border border-emerald-300/80 rounded-full text-xs font-semibold text-emerald-800 flex items-center gap-1.5 hover:bg-emerald-100 transition"
                  >
                    <span>{selectedTemplate.intentLabel}</span>
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </button>

                  {showIntentDropdown && (
                    <div className="absolute top-9 left-0 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 text-xs">
                      {["Research", "Briefing", "Task Breakdown", "Monitor", "Draft", "Travel Plan", "Creative Media"].map((intentOption) => (
                        <button
                          key={intentOption}
                          type="button"
                          onClick={() => {
                            setCurrentIntent(intentOption);
                            setShowIntentDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg text-slate-700 transition"
                        >
                          {intentOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  <strong className="text-slate-700">{selectedTemplate.intent}:</strong> {selectedTemplate.intentDesc}
                </p>
              </div>

              {/* SCHEDULE Section */}
              <div className="mb-8">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  SCHEDULE <span className="normal-case font-normal text-slate-400">when</span>
                </label>
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                    className="px-3.5 py-1.5 bg-emerald-50/70 border border-emerald-300/80 rounded-full text-xs font-semibold text-emerald-800 flex items-center gap-1.5 hover:bg-emerald-100 transition"
                  >
                    <span>▷</span>
                    <span>{currentSchedule}</span>
                    <span className="text-emerald-600 font-bold">›</span>
                  </button>

                  {showScheduleDropdown && (
                    <div className="absolute top-9 left-0 w-60 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 text-xs">
                      {["Run now", "Daily at 00:00 (Midnight)", "Daily at 09:00 AM", "Every 4 Hours", "Weekly on Monday", "Custom schedule"].map((sch) => (
                        <button
                          key={sch}
                          type="button"
                          onClick={() => {
                            setCurrentSchedule(sch);
                            setShowScheduleDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg text-slate-700 transition"
                        >
                          {sch}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Big Green Generate Prompt Button */}
              <button
                type="button"
                onClick={handleGeneratePrompt}
                className="w-full py-3.5 bg-[#00D35A] hover:bg-[#00be51] text-white font-bold text-sm rounded-full shadow-md shadow-emerald-200/50 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Generate Prompt</span>
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2.5">
                A structured prompt will be generated — you can edit it anytime
              </p>
            </div>
          ) : activeTab === "my" ? (
            /* VIEW 2: My Automations List (Screenshot 2) */
            <div className="space-y-3.5 max-w-5xl mx-auto">
              {myFiltered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    const matched = WORK_TEMPLATES.find((t) => t.title === item.title) || WORK_TEMPLATES[0];
                    openTemplateComposer(matched);
                  }}
                  className="bg-white border border-slate-200/90 rounded-[28px] px-6 py-4 flex items-center justify-between hover:border-emerald-300 hover:shadow-sm transition cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Green Lightning Badge */}
                    <div className="w-10 h-10 rounded-full bg-[#00D35A] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </div>

                    {/* Automation Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          {item.title}
                        </h3>
                        <span className="text-slate-400 text-xs font-bold">›</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" />
                          <path strokeLinecap="round" d="M12 6v6l4 2" />
                        </svg>
                        <span>{item.schedule}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">{item.agent}</span>
                        {item.last_run_at && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium text-[11px]">
                              Run {new Date(item.last_run_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Run Now + Toggle */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      type="button"
                      disabled={runningId === item.id}
                      onClick={(e) => handleRunNow(item.id, e)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                      title="Run automation immediately"
                    >
                      {runningId === item.id ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current text-emerald-700" />
                          <span>Run Now</span>
                        </>
                      )}
                    </button>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={(e) => toggleMyAutomation(item.id, e)}
                      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                        item.enabled ? "bg-[#00D35A]" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          item.enabled ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}

              {myFiltered.length === 0 && (
                <div className="text-center py-16 bg-white border border-slate-200/90 rounded-3xl">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#00D35A] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No active automations found</h3>
                  <p className="text-xs text-slate-500 mt-1">Select any Work or Life template to activate a recurring automated task.</p>
                </div>
              )}
            </div>
          ) : activeTab === "work" ? (
            /* VIEW 3: Work Templates Grid (Screenshot 1) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workFiltered.map((template) => (
                <div
                  key={template.id}
                  onClick={() => openTemplateComposer(template)}
                  className="bg-white border border-slate-200/90 rounded-[26px] p-6 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Icon in soft circle */}
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      {renderTemplateIcon(template.iconName)}
                    </div>
                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition mb-1.5">
                      {template.title}
                    </h3>
                    {/* Subtitle / Description */}
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VIEW 4: Life Templates Grid (Screenshot 3) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lifeFiltered.map((template) => (
                <div
                  key={template.id}
                  onClick={() => openTemplateComposer(template)}
                  className="bg-white border border-slate-200/90 rounded-[26px] p-6 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Icon in soft circle */}
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      {renderTemplateIcon(template.iconName)}
                    </div>
                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition mb-1.5">
                      {template.title}
                    </h3>
                    {/* Subtitle / Description */}
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
