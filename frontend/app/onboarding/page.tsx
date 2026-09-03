"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

interface OnboardingData {
  role?: string;
  useCase?: string;
  teamSize?: string;
  interests?: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: "developer", label: "Developer", icon: "💻", desc: "Build and ship products" },
    { id: "designer", label: "Designer", icon: "🎨", desc: "Create beautiful experiences" },
    { id: "product", label: "Product Manager", icon: "📊", desc: "Drive product strategy" },
    { id: "marketing", label: "Marketing", icon: "📢", desc: "Grow your audience" },
    { id: "founder", label: "Founder", icon: "🚀", desc: "Build your startup" },
    { id: "other", label: "Other", icon: "✨", desc: "Something else" },
  ];

  const useCases = [
    { id: "automation", label: "Workflow Automation", icon: "⚡" },
    { id: "research", label: "Research & Analysis", icon: "🔍" },
    { id: "content", label: "Content Creation", icon: "✍️" },
    { id: "coding", label: "Coding Assistant", icon: "🤖" },
    { id: "team", label: "Team Collaboration", icon: "👥" },
    { id: "personal", label: "Personal Productivity", icon: "📝" },
  ];

  const teamSizes = [
    { id: "solo", label: "Just me", icon: "👤" },
    { id: "small", label: "2-10 people", icon: "👥" },
    { id: "medium", label: "11-50 people", icon: "👨‍👩‍👧‍👦" },
    { id: "large", label: "50+ people", icon: "🏢" },
  ];

  async function handleComplete() {
    setLoading(true);
    try {
      // Update user profile with onboarding data
      await api.updateProfile(data);
      router.push("/dashboard");
    } catch (e: any) {
      console.error("Onboarding error:", e);
      // Continue anyway
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  function toggleInterest(interest: string) {
    const current = data.interests || [];
    if (current.includes(interest)) {
      setData({ ...data, interests: current.filter((i) => i !== interest) });
    } else {
      setData({ ...data, interests: [...current, interest] });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f2f5] to-[#e5e7eb] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of 3</span>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#00a884] to-[#00897b] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Step 1: Role */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Teamily AI! 👋</h1>
                <p className="text-gray-600">Let's personalize your experience. What best describes your role?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setData({ ...data, role: role.id })}
                    className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                      data.role === role.id
                        ? "border-[#00a884] bg-[#00a884]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{role.icon}</div>
                    <div className="font-semibold text-gray-900 mb-1">{role.label}</div>
                    <div className="text-sm text-gray-600">{role.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!data.role}
                className="w-full bg-gradient-to-r from-[#00a884] to-[#00897b] text-white rounded-lg py-4 text-base font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Use Case */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">What brings you here?</h1>
                <p className="text-gray-600">Select all that apply to help us customize your AI agents</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {useCases.map((useCase) => (
                  <button
                    key={useCase.id}
                    onClick={() => toggleInterest(useCase.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                      data.interests?.includes(useCase.id)
                        ? "border-[#00a884] bg-[#00a884]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{useCase.icon}</div>
                    <div className="font-semibold text-gray-900">{useCase.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 rounded-lg py-4 text-base font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!data.interests || data.interests.length === 0}
                  className="flex-1 bg-gradient-to-r from-[#00a884] to-[#00897b] text-white rounded-lg py-4 text-base font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Team Size */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">How big is your team?</h1>
                <p className="text-gray-600">This helps us recommend the right collaboration features</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setData({ ...data, teamSize: size.id })}
                    className={`p-6 rounded-xl border-2 text-center transition-all hover:shadow-md ${
                      data.teamSize === size.id
                        ? "border-[#00a884] bg-[#00a884]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-4xl mb-3">{size.icon}</div>
                    <div className="font-semibold text-gray-900">{size.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 rounded-lg py-4 text-base font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!data.teamSize || loading}
                  className="flex-1 bg-gradient-to-r from-[#00a884] to-[#00897b] text-white rounded-lg py-4 text-base font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Setting up...
                    </span>
                  ) : (
                    "Get Started"
                  )}
                </button>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-[#00a884]/10 to-[#00897b]/10 rounded-lg border border-[#00a884]/20">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎉</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">You're almost ready!</h3>
                    <p className="text-sm text-gray-600">
                      We've prepared your first AI agent based on your preferences. You can start chatting right away!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
