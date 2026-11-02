"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  
  // Auth Method: "email" (Google/GitHub/Email) or "whatsapp" (🇵🇰 WhatsApp OTP)
  const [authMethod, setAuthMethod] = useState<"email" | "whatsapp">("email");
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signin");
  
  // Email states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  // WhatsApp states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  
  // Status states
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Email Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "magic") {
        await api.sendMagicLink({ email });
        setSuccess("Check your email! We sent you a magic link to sign in.");
      } else if (mode === "signup") {
        await api.register({ email, password, full_name: fullName });
        const r = await api.login({ email, password });
        localStorage.setItem("token", r.access_token);
        if (r.refresh_token) localStorage.setItem("refresh_token", r.refresh_token);
        router.push("/dashboard");
      } else {
        const r = await api.login({ email, password });
        localStorage.setItem("token", r.access_token);
        if (r.refresh_token) localStorage.setItem("refresh_token", r.refresh_token);
        router.push("/dashboard");
      }
    } catch (e: any) {
      setErr(e.message || "Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Google / GitHub Fast Social Login Handler
  async function handleOAuth(provider: string) {
    setErr("");
    setSocialLoading(provider);
    try {
      // 1. Fast direct 1-click social sign-in
      const res = await api.socialQuickLogin({ provider });
      localStorage.setItem("token", res.access_token);
      if (res.refresh_token) localStorage.setItem("refresh_token", res.refresh_token);
      setSuccess(`Signed in with ${provider === "google" ? "Google" : "GitHub"}!`);
      router.push("/dashboard");
    } catch (e: any) {
      console.warn("Fast social login fallback to connect:", e);
      try {
        const result = await api.oauthConnect(provider);
        if (result && result.url) {
          window.location.href = result.url;
          return;
        }
        throw new Error("No redirect URL");
      } catch (innerErr: any) {
        setErr(`Sign-in failed: ${innerErr.message || e.message}`);
      }
    } finally {
      setSocialLoading(null);
    }
  }

  // Send WhatsApp OTP
  async function handleSendWhatsAppOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErr("");
    setSuccess("");
    if (!phone.trim()) {
      setErr("Please enter your WhatsApp mobile number (e.g. 0300 1234567)");
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendWhatsAppOtp({ phone });
      setOtpSent(true);
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
        setOtp(res.dev_otp); // Auto-fill for convenience
      }
      setSuccess(res.message || `Verification code sent to WhatsApp: ${phone}`);
    } catch (e: any) {
      setErr(e.message || "Failed to send WhatsApp verification code.");
    } finally {
      setLoading(false);
    }
  }

  // Verify WhatsApp OTP
  async function handleVerifyWhatsAppOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSuccess("");
    if (!otp.trim()) {
      setErr("Please enter the 6-digit code received on your WhatsApp.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyWhatsAppOtp({ phone, otp });
      localStorage.setItem("token", res.access_token);
      if (res.refresh_token) localStorage.setItem("refresh_token", res.refresh_token);
      setSuccess("WhatsApp number verified! Signing in...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (e: any) {
      setErr(e.message || "Invalid code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Quick Demo Login Helper
  function fillDemoAccount(demoEmail: string, demoPass: string) {
    setAuthMethod("email");
    setMode("signin");
    setEmail(demoEmail);
    setPassword(demoPass);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding & Pakistani AI Ecosystem */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00a884] via-[#00897b] to-[#00796b] p-12 flex-col justify-between text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium tracking-wide mb-4">
            <span>🇵🇰</span> Built in Pakistan for Modern AI Teams
          </div>
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Abrazy AI Platform</h1>
          <p className="text-xl opacity-90 font-light">Your intelligent multi-agent squad is one tap away</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">300+ Autonomous AI Agents</h3>
              <p className="text-sm opacity-80 leading-relaxed">Collaborate with specialized agents for engineering, marketing, content, research, and local Pakistani business workflows.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-inner">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Ultra-Fast Hybrid Intelligence</h3>
              <p className="text-sm opacity-80 leading-relaxed">Zero-latency Groq, Gemini 2.5 Flash, and local Ollama inference router with multi-agent round-robin collaboration.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-inner">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Instant Pakistani WhatsApp Access</h3>
              <p className="text-sm opacity-80 leading-relaxed">Login directly using your Pakistani mobile number (+92) via WhatsApp OTP code or social authentications.</p>
            </div>
          </div>
        </div>

        <div className="text-xs opacity-75 flex items-center justify-between border-t border-white/20 pt-4">
          <span>© 2026 Abrazy.ai • All rights reserved</span>
          <span className="font-mono">v1.2 Production</span>
        </div>
      </div>

      {/* Right side - Auth Card */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f0f2f5]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-gray-100">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-[#00a884] font-bold text-2xl mb-2 shadow-sm">
                A
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Abrazy AI</h2>
              <p className="text-xs text-gray-500 mt-1">Sign in with Google, GitHub, Email, or WhatsApp</p>
            </div>

            {/* Primary Login Method Switcher: Email/Social vs WhatsApp */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100/80 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setAuthMethod("email"); setErr(""); setSuccess(""); }}
                className={`py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === "email"
                    ? "bg-white text-gray-900 shadow-sm font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>✉️</span>
                <span>Email & Social</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMethod("whatsapp"); setErr(""); setSuccess(""); }}
                className={`py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === "whatsapp"
                    ? "bg-[#25D366] text-white shadow-md font-bold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="text-sm">💬</span>
                <span>🇵🇰 WhatsApp (+92)</span>
              </button>
            </div>

            {/* Feedback Alerts */}
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
                <span className="text-base leading-none">⚠️</span>
                <span className="flex-1 font-medium">{err}</span>
                <button onClick={() => setErr("")} className="text-red-400 hover:text-red-700 font-bold">×</button>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
                <span className="text-base leading-none">✅</span>
                <span className="flex-1 font-medium">{success}</span>
                <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-700 font-bold">×</button>
              </div>
            )}

            {/* --- METHOD 1: EMAIL & SOCIAL LOGINS --- */}
            {authMethod === "email" && (
              <div className="space-y-4">
                {/* Social Login Buttons: Google & GitHub */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={socialLoading !== null}
                    onClick={() => handleOAuth("google")}
                    className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all hover:shadow active:scale-[0.99] disabled:opacity-50"
                  >
                    {socialLoading === "google" ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    disabled={socialLoading !== null}
                    onClick={() => handleOAuth("github")}
                    className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all hover:shadow active:scale-[0.99] disabled:opacity-50"
                  >
                    {socialLoading === "github" ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>Continue with GitHub</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider text-gray-400">
                    <span className="px-3 bg-white">Or with Email</span>
                  </div>
                </div>

                {/* Sign In / Sign Up Mode Sub-tabs */}
                <div className="flex border-b border-gray-200 text-xs font-semibold mb-2">
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className={`flex-1 pb-2 border-b-2 transition-all ${
                      mode === "signin"
                        ? "border-[#00a884] text-[#00a884]"
                        : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`flex-1 pb-2 border-b-2 transition-all ${
                      mode === "signup"
                        ? "border-[#00a884] text-[#00a884]"
                        : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    Sign Up (New Account)
                  </button>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {mode === "signup" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 transition-all"
                        placeholder="Ali Khan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 transition-all"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {mode !== "magic" && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-medium text-gray-700">Password</label>
                        {mode === "signin" && (
                          <Link href="/forgot-password" className="text-xs text-[#00a884] hover:underline font-medium">
                            Forgot?
                          </Link>
                        )}
                      </div>
                      <input
                        type="password"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-to-r from-[#00a884] to-[#00897b] text-white rounded-xl py-2.5 text-sm font-semibold hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : mode === "signup" ? (
                      "Create Account"
                    ) : mode === "magic" ? (
                      "Send Magic Link"
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                {/* Demo User Fast-Fill */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("user@abrazy.ai", "password123")}
                    className="text-xs text-gray-400 hover:text-[#00a884] underline"
                  >
                    💡 Quick Fill Demo: user@abrazy.ai
                  </button>
                </div>
              </div>
            )}

            {/* --- METHOD 2: 🇵🇰 PAKISTANI WHATSAPP OTP LOGIN --- */}
            {authMethod === "whatsapp" && (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                    💬
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Instant WhatsApp Authentication</h4>
                    <p className="text-[11px] text-gray-500">Sign in securely using any Pakistani mobile number (+92)</p>
                  </div>
                </div>

                {!otpSent ? (
                  // Step 1: Enter Phone Number
                  <form onSubmit={handleSendWhatsAppOtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pakistani WhatsApp Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
                          <span>🇵🇰</span>
                          <span>+92</span>
                        </div>
                        <input
                          type="tel"
                          className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all font-mono"
                          placeholder="300 1234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Accepts 0300 1234567, 3001234567 or +923001234567</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send WhatsApp OTP Code</span>
                          <span>→</span>
                        </>
                      )}
                    </button>

                    {/* Quick Pakistani Demo Number Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setPhone("0300 1234567");
                        setTimeout(() => handleSendWhatsAppOtp(), 50);
                      }}
                      className="w-full py-2 px-3 border border-dashed border-gray-300 hover:border-[#25D366] text-gray-600 hover:text-[#00897b] rounded-xl text-xs font-medium transition-all"
                    >
                      ⚡ One-Click Demo: Use +92 300 1234567
                    </button>
                  </form>
                ) : (
                  // Step 2: Enter 6-digit OTP
                  <form onSubmit={handleVerifyWhatsAppOtp} className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-medium text-gray-700">Enter 6-Digit WhatsApp Code</label>
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtp(""); setDevOtp(""); }}
                          className="text-xs text-[#00a884] hover:underline"
                        >
                          Change Number
                        </button>
                      </div>

                      <input
                        type="text"
                        maxLength={6}
                        className="w-full border-2 border-[#25D366] bg-emerald-50/30 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest outline-none focus:ring-4 focus:ring-[#25D366]/20 transition-all font-bold text-gray-900"
                        placeholder="786012"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        required
                        autoFocus
                      />

                      {devOtp && (
                        <div className="mt-2 p-2 bg-emerald-100/70 border border-emerald-300 rounded-lg text-center text-xs text-emerald-900 flex items-center justify-center gap-2">
                          <span>📲 Auto-detected OTP:</span>
                          <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded shadow-sm">{devOtp}</span>
                          <button
                            type="button"
                            onClick={() => setOtp(devOtp)}
                            className="text-[11px] underline font-semibold text-emerald-700 hover:text-emerald-900"
                          >
                            Fill
                          </button>
                        </div>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1 text-center">
                        Master test codes <code className="bg-gray-100 px-1 rounded text-gray-700">786000</code> or <code className="bg-gray-100 px-1 rounded text-gray-700">123456</code> are also active
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying code...</span>
                        </>
                      ) : (
                        <span>Verify & Launch Abrazy AI</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Terms and Privacy Footer */}
            <p className="text-center text-[11px] text-gray-400 pt-2 border-t border-gray-100">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-[#00a884] hover:underline font-medium">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="text-[#00a884] hover:underline font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
