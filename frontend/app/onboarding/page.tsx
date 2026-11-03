"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

// ── helpers ──────────────────────────────────────────────────────────────────

function randomSeed(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function decodeJwtName(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.full_name || payload.name || "";
  } catch {
    return "";
  }
}

// ── data maps ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { id: "Technology & Software", label: "Technology & Software", icon: "🤖", bg: "#dbeafe" },
  { id: "Advertising & Marketing", label: "Advertising & Marketing", icon: "📢", bg: "#fce7f3" },
  { id: "Media & Entertainment", label: "Media & Entertainment", icon: "🎬", bg: "#ede9fe" },
  { id: "Financial Services", label: "Financial Services", icon: "💰", bg: "#d1fae5" },
  { id: "Education", label: "Education", icon: "📚", bg: "#fef3c7" },
  { id: "Healthcare", label: "Healthcare", icon: "🏥", bg: "#fee2e2" },
  { id: "Legal", label: "Legal", icon: "⚖️", bg: "#e0e7ff" },
  { id: "E-commerce", label: "E-commerce", icon: "🛒", bg: "#fef9c3" },
] as const;

type Industry = (typeof INDUSTRIES)[number]["id"];

const ROLES_MAP: Record<Industry, string[]> = {
  "Technology & Software": ["Software Engineer", "Product Manager", "Data Scientist", "DevOps Engineer", "UI/UX Designer"],
  "Advertising & Marketing": ["Growth Marketer", "Content Creator", "Copywriter", "SEO Specialist", "Brand Strategist"],
  "Media & Entertainment": ["Video Producer", "Journalist", "Podcast Host", "Graphic Designer", "Social Media Manager"],
  "Financial Services": ["Financial Analyst", "Investment Banker", "Accountant", "Risk Manager", "CFO"],
  "Education": ["Teacher", "Professor", "Curriculum Designer", "EdTech Developer", "Tutor"],
  "Healthcare": ["Doctor", "Nurse", "Health Admin", "Medical Researcher", "Therapist"],
  "Legal": ["Lawyer", "Paralegal", "Legal Analyst", "Compliance Officer", "Judge"],
  "E-commerce": ["Store Owner", "Product Manager", "Marketing Manager", "Operations Lead", "Customer Success"],
};

const MORE_CONNECTORS = [
  { id: "outlook", name: "Outlook", icon: "📧" },
  { id: "slack", name: "Slack", icon: "💬" },
  { id: "notion", name: "Notion", icon: "📝" },
  { id: "github", name: "GitHub", icon: "🐙" },
  { id: "jira", name: "Jira", icon: "🔵" },
  { id: "trello", name: "Trello", icon: "📋" },
  { id: "asana", name: "Asana", icon: "🎯" },
  { id: "zapier", name: "Zapier", icon: "⚡" },
];

const TASKS_MAP: Record<Industry, { oneOff: string[]; routines: string[] }> = {
  "Technology & Software": {
    oneOff: ["Set up CI/CD pipeline", "Write API documentation", "Code review a PR", "Debug production issue", "Create system architecture diagram", "Write unit tests"],
    routines: ["Daily standup summary", "Weekly sprint report", "Monthly dependency audit", "Quarterly tech debt review"],
  },
  "Advertising & Marketing": {
    oneOff: ["Write a campaign brief", "Draft social media posts", "Analyze competitor ads", "Create email newsletter", "Build landing page copy", "Keyword research report"],
    routines: ["Weekly content calendar", "Monthly analytics report", "Quarterly brand review", "Daily social monitoring"],
  },
  "Media & Entertainment": {
    oneOff: ["Write a video script", "Draft press release", "Create content calendar", "Write episode summary", "Design show notes", "Pitch story idea"],
    routines: ["Weekly content roundup", "Monthly audience report", "Daily news digest", "Quarterly trend analysis"],
  },
  "Financial Services": {
    oneOff: ["Prepare financial report", "Draft investment memo", "Create budget model", "Write risk assessment", "Prepare board deck", "Analyze market data"],
    routines: ["Daily market briefing", "Weekly portfolio review", "Monthly compliance check", "Quarterly earnings summary"],
  },
  "Education": {
    oneOff: ["Create lesson plan", "Write quiz questions", "Draft curriculum outline", "Grade assignment rubric", "Write student feedback", "Design course syllabus"],
    routines: ["Weekly progress report", "Monthly parent newsletter", "Daily attendance summary", "Quarterly curriculum review"],
  },
  "Healthcare": {
    oneOff: ["Draft patient summary", "Write care plan", "Create training material", "Prepare research abstract", "Write incident report", "Design patient handout"],
    routines: ["Daily shift briefing", "Weekly team huddle notes", "Monthly quality review", "Quarterly compliance audit"],
  },
  "Legal": {
    oneOff: ["Draft contract clause", "Write legal memo", "Prepare case summary", "Research precedents", "Create compliance checklist", "Draft NDA"],
    routines: ["Weekly case status update", "Monthly billing summary", "Daily deadline tracker", "Quarterly regulatory review"],
  },
  "E-commerce": {
    oneOff: ["Write product description", "Draft promotion email", "Analyze sales data", "Create FAQ page", "Write return policy", "Draft supplier email"],
    routines: ["Daily sales report", "Weekly inventory check", "Monthly customer review", "Quarterly strategy review"],
  },
};

const AVATAR_COLORS = ["#b5ead7", "#ffd1dc", "#b5d5f5", "#ffe5b4", "#e2d9f3", "#d4edda"];

// ── sub-components ────────────────────────────────────────────────────────────

interface HScrollProps {
  children: React.ReactNode;
}
function HScroll({ children }: HScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  function scroll(dir: number) {
    ref.current?.scrollBy({ left: dir * 140, behavior: "smooth" });
  }
  return (
    <div className="relative flex items-center gap-1">
      <button
        type="button"
        onClick={() => scroll(-1)}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-all"
        aria-label="Scroll left"
      >
        ‹
      </button>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll(1)}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-all"
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
}

interface IndustryCardProps {
  icon: string;
  bg: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}
function IndustryCard({ icon, bg, label, selected, onClick }: IndustryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-shrink-0 w-[120px] flex flex-col items-center gap-2 p-3 bg-white rounded-xl border-2 transition-all ${
        selected ? "border-[#1a7f4b]" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div
        className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#1a7f4b] rounded-full flex items-center justify-center text-white text-[10px]">
          ✓
        </span>
      )}
    </button>
  );
}

interface RoleCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}
function RoleCard({ label, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-shrink-0 w-[120px] flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-xl border-2 transition-all ${
        selected ? "border-[#1a7f4b]" : "border-gray-200 hover:border-gray-300"
      }`}
      style={{ minHeight: 72 }}
    >
      <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#1a7f4b] rounded-full flex items-center justify-center text-white text-[10px]">
          ✓
        </span>
      )}
    </button>
  );
}

// ── progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full max-w-md mx-auto mb-4 px-1">
      <p className="text-xs text-gray-500 mb-2 text-center">Step {step} of 4</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-[#1a7f4b]" : "bg-[#e5e7eb]"}`} />
            {i < 3 && (
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mx-0.5 transition-all ${s < step ? "bg-[#1a7f4b]" : "bg-[#e5e7eb]"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  // auth guard
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/auth/login");
    }
  }, [router]);

  const [step, setStep] = useState(1);
  const [finishLoading, setFinishLoading] = useState(false);

  // step 1
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // step 2
  const [connectedApps, setConnectedApps] = useState<Set<string>>(new Set());

  // step 3
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);

  // step 4
  const [avatarSeed, setAvatarSeed] = useState(randomSeed);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [agentName, setAgentName] = useState(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      if (t) {
        const name = decodeJwtName(t);
        if (name) return `${name.split(" ")[0]}'s Personal Agent`;
      }
    }
    return "Your Personal Agent";
  });

  function toggleApp(id: string) {
    setConnectedApps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleTask(task: string) {
    setSelectedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  }

  function toggleRoutine(r: string) {
    setSelectedRoutines((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }

  async function handleFinish() {
    setFinishLoading(true);
    try {
      await api.updateProfile({
        user_metadata: {
          industry,
          role,
          connected_apps: Array.from(connectedApps),
          selected_tasks: selectedTasks,
          selected_routines: selectedRoutines,
          avatar_config: { seed: avatarSeed, color: avatarColor, name: agentName },
          onboarding_complete: true,
        },
      });
    } catch (e) {
      console.error("Onboarding save error:", e);
    } finally {
      router.push("/chat");
    }
  }

  const taskData = industry ? TASKS_MAP[industry] : null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-start py-10 px-4">
      <ProgressBar step={step} />

      <div className="w-full max-w-md bg-white rounded-[12px] shadow-lg">
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">A little about your work</h2>
              <p className="text-sm text-gray-500 mt-1">Tell us about your industry and role</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Your industry</p>
              <HScroll>
                {INDUSTRIES.map((ind) => (
                  <IndustryCard
                    key={ind.id}
                    icon={ind.icon}
                    bg={ind.bg}
                    label={ind.label}
                    selected={industry === ind.id}
                    onClick={() => {
                      setIndustry(ind.id as Industry);
                      setRole(null);
                    }}
                  />
                ))}
              </HScroll>
            </div>

            {/* Role section — fade in after industry selected */}
            <div
              className={`transition-all duration-300 ${industry ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
            >
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Your role</p>
              {industry && (
                <HScroll>
                  {ROLES_MAP[industry].map((r) => (
                    <RoleCard
                      key={r}
                      label={r}
                      selected={role === r}
                      onClick={() => setRole(r)}
                    />
                  ))}
                </HScroll>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div />
              <button
                type="button"
                onClick={() => router.push("/chat")}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Skip for now
              </button>
              <button
                type="button"
                disabled={!industry || !role}
                onClick={() => setStep(2)}
                className="bg-[#1a7f4b] hover:bg-[#15663d] text-white text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Connect the apps you use</h2>
              <p className="text-sm text-gray-500 mt-1">We'll use these to help automate your workflows</p>
            </div>

            {/* Highly recommended */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Highly Recommended
              </p>
              <div className="flex flex-col gap-3">
                {/* Gmail */}
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-100 flex-shrink-0 text-xl">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M6 18L2 20V4.5C2 3.67 2.67 3 3.5 3h17c.83 0 1.5.67 1.5 1.5V18H6z" fill="#EA4335" />
                      <path d="M22 5L12 13 2 5" stroke="#FFF" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Gmail</p>
                    <p className="text-xs text-gray-500">Read &amp; send emails</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleApp("gmail")}
                    className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
                      connectedApps.has("gmail")
                        ? "bg-[#1a7f4b] text-white border-[#1a7f4b]"
                        : "text-[#1a7f4b] border-[#1a7f4b] hover:bg-[#1a7f4b]/5"
                    }`}
                  >
                    {connectedApps.has("gmail") ? "✓ Connected" : "+ Connect"}
                  </button>
                </div>

                {/* Google Calendar */}
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-100 flex-shrink-0 text-xl">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="17" rx="2" stroke="#4285F4" strokeWidth="1.5" />
                      <path d="M3 9h18" stroke="#4285F4" strokeWidth="1.5" />
                      <rect x="8" y="2" width="2" height="4" rx="1" fill="#4285F4" />
                      <rect x="14" y="2" width="2" height="4" rx="1" fill="#4285F4" />
                      <path d="M8 13h2v2H8zm3 0h2v2h-2zm3 0h2v2h-2z" fill="#34A853" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Google Calendar</p>
                    <p className="text-xs text-gray-500">Schedule &amp; manage events</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleApp("google-calendar")}
                    className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
                      connectedApps.has("google-calendar")
                        ? "bg-[#1a7f4b] text-white border-[#1a7f4b]"
                        : "text-[#1a7f4b] border-[#1a7f4b] hover:bg-[#1a7f4b]/5"
                    }`}
                  >
                    {connectedApps.has("google-calendar") ? "✓ Connected" : "+ Connect"}
                  </button>
                </div>
              </div>
            </div>

            {/* More connectors */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                More Connectors
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MORE_CONNECTORS.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl"
                  >
                    <span className="text-xl">{c.icon}</span>
                    <span className="flex-1 text-xs font-medium text-gray-700 truncate">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleApp(c.id)}
                      className={`text-[11px] font-semibold rounded-full px-2 py-1 border flex-shrink-0 transition-all ${
                        connectedApps.has(c.id)
                          ? "bg-[#1a7f4b] text-white border-[#1a7f4b]"
                          : "text-[#1a7f4b] border-[#1a7f4b] hover:bg-[#1a7f4b]/5"
                      }`}
                    >
                      {connectedApps.has(c.id) ? "✓" : "+ Add"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-[#1a7f4b] hover:bg-[#15663d] text-white text-sm font-semibold rounded-full px-5 py-2 transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">What could we take off your plate?</h2>
              <p className="text-sm text-gray-500 mt-1">Select tasks you'd like help with</p>
            </div>

            {taskData && (
              <>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">One-off tasks</p>
                  <div className="flex flex-col gap-2">
                    {taskData.oneOff.map((task) => (
                      <button
                        key={task}
                        type="button"
                        onClick={() => toggleTask(task)}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-all text-left"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            selectedTasks.includes(task)
                              ? "bg-[#1a7f4b] border-[#1a7f4b]"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedTasks.includes(task) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{task}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Ongoing routines</p>
                  <div className="flex flex-col gap-2">
                    {taskData.routines.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRoutine(r)}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-all text-left"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            selectedRoutines.includes(r)
                              ? "bg-[#1a7f4b] border-[#1a7f4b]"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedRoutines.includes(r) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{r}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!taskData && (
              <p className="text-sm text-gray-500 text-center py-6">
                No task data available. Go back and select an industry.
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="bg-[#1a7f4b] hover:bg-[#15663d] text-white text-sm font-semibold rounded-full px-5 py-2 transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Customize your Personal Agent</h2>
              <p className="text-sm text-gray-500 mt-1">Give your AI companion a look &amp; name</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left — avatar preview */}
              <div className="flex flex-col items-center gap-3 md:w-1/2">
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=${avatarColor.replace("#", "")}`}
                  alt="Agent avatar"
                  className="w-28 h-28 rounded-2xl border-2 border-gray-100 shadow-md"
                />
                <p className="text-sm italic text-gray-500">{agentName}</p>
                <button
                  type="button"
                  onClick={() => setAvatarSeed(randomSeed())}
                  className="text-sm font-medium text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-all"
                >
                  Remix 🎲
                </button>
              </div>

              {/* Right — customization */}
              <div className="flex flex-col gap-4 md:w-1/2">
                {/* Color swatches */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAvatarColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          avatarColor === c ? "border-gray-800 scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Agent name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Agent name</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a7f4b] focus:ring-2 focus:ring-[#1a7f4b]/20 transition-all"
                    placeholder="Your Personal Agent"
                  />
                </div>
              </div>
            </div>

            {/* Back button */}
            <div className="flex items-center pt-1">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar for step 4 */}
      {step === 4 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-6 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-xl">🤖</span>
            <span className="font-medium">Ready when you are</span>
          </div>
          <button
            type="button"
            disabled={finishLoading}
            onClick={handleFinish}
            className="bg-[#1a7f4b] hover:bg-[#15663d] text-white font-semibold rounded-full px-6 py-2 text-sm disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {finishLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Enter Abrazy →"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
