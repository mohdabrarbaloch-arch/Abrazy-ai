"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  // Allow scroll on auth page
  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, []);

  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Email states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

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
      if (mode === "signup") {
        await api.register({ email, password, full_name: fullName });
        const r = await api.login({ email, password });
        localStorage.setItem("token", r.access_token);
        if (r.refresh_token) localStorage.setItem("refresh_token", r.refresh_token);
        router.push("/onboarding");
      } else {
        const r = await api.login({ email, password });
        localStorage.setItem("token", r.access_token);
        if (r.refresh_token) localStorage.setItem("refresh_token", r.refresh_token);
        // Check onboarding status
        try {
          const user: any = await api.me();
          if (user?.user_metadata?.onboarding_complete === true) {
            router.push("/chat");
          } else {
            router.push("/onboarding");
          }
        } catch {
          router.push("/onboarding");
        }
      }
    } catch (e: any) {
      setErr(e.message || "Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Google / OAuth Handler — go directly to provider redirect
  async function handleOAuth(provider: string) {
    setErr("");
    setSocialLoading(provider);
    try {
      const result = await api.oauthConnect(provider);
      if (result && result.url) {
        window.location.href = result.url;
        return;
      }
      throw new Error("No redirect URL received from server");
    } catch (e: any) {
      setErr(`Sign-in with ${provider} failed: ${e.message}`);
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 relative">
      {/* Language selector — decorative */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm select-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
          <path strokeLinecap="round" strokeWidth="1.5" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <span className="font-medium">EN</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-[12px] shadow-lg p-8 space-y-5">
        {/* Title */}
        <h1 className="text-[24px] font-bold text-gray-900 text-center leading-tight">
          Sign in or create an account
        </h1>

        {/* Error / Success alerts */}
        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <span className="flex-1">{err}</span>
            <button onClick={() => setErr("")} className="text-red-400 hover:text-red-700 font-bold ml-1">×</button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">✅</span>
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-700 font-bold ml-1">×</button>
          </div>
        )}

        {/* Continue with Google */}
        <button
          type="button"
          disabled={socialLoading !== null}
          onClick={() => handleOAuth("google")}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm py-2.5 px-4 rounded-full shadow-sm transition-all disabled:opacity-50"
        >
          {socialLoading === "google" ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* 4 icon-only social buttons (decorative) */}
        <div className="flex items-center justify-center gap-3">
          {/* Apple */}
          <button
            type="button"
            title="Coming soon"
            className="w-12 h-12 flex items-center justify-center border border-gray-200 bg-white rounded-xl opacity-50 cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          </button>
          {/* Microsoft */}
          <button
            type="button"
            title="Coming soon"
            className="w-12 h-12 flex items-center justify-center border border-gray-200 bg-white rounded-xl opacity-50 cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
          </button>
          {/* Facebook */}
          <button
            type="button"
            title="Coming soon"
            className="w-12 h-12 flex items-center justify-center border border-gray-200 bg-white rounded-xl opacity-50 cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          {/* Slack */}
          <button
            type="button"
            title="Coming soon"
            className="w-12 h-12 flex items-center justify-center border border-gray-200 bg-white rounded-xl opacity-50 cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.52 2.528 2.528 0 01-2.52-2.52 2.528 2.528 0 012.52-2.52h2.52v2.52zM6.313 15.165a2.528 2.528 0 012.52-2.52 2.528 2.528 0 012.52 2.52v6.313a2.528 2.528 0 01-2.52 2.52 2.528 2.528 0 01-2.52-2.52v-6.313zM8.833 5.042a2.528 2.528 0 01-2.52-2.52 2.528 2.528 0 012.52-2.52 2.528 2.528 0 012.52 2.52v2.52h-2.52zM8.833 6.313a2.528 2.528 0 012.52 2.52 2.528 2.528 0 01-2.52 2.52H2.52A2.528 2.528 0 010 8.833a2.528 2.528 0 012.52-2.52h6.313zM18.956 8.833a2.528 2.528 0 012.52-2.52 2.528 2.528 0 012.52 2.52 2.528 2.528 0 01-2.52 2.52h-2.52v-2.52zM17.688 8.833a2.528 2.528 0 01-2.52 2.52 2.528 2.528 0 01-2.52-2.52V2.52A2.528 2.528 0 0115.168 0a2.528 2.528 0 012.52 2.52v6.313zM15.168 18.956a2.528 2.528 0 012.52 2.52 2.528 2.528 0 01-2.52 2.52 2.528 2.528 0 01-2.52-2.52v-2.52h2.52zM15.168 17.688a2.528 2.528 0 01-2.52-2.52 2.528 2.528 0 012.52-2.52h6.313a2.528 2.528 0 012.52 2.52 2.528 2.528 0 01-2.52 2.52h-6.313z" fill="#E01E5A" />
            </svg>
          </button>
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email / Phone pill tabs */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-full w-fit mx-auto">
          <button
            type="button"
            className="px-5 py-1.5 text-sm font-medium rounded-full bg-gray-900 text-white transition-all"
          >
            Email
          </button>
          <button
            type="button"
            title="Coming soon"
            className="px-5 py-1.5 text-sm font-medium rounded-full text-gray-500 opacity-50 cursor-not-allowed transition-all"
          >
            Phone
          </button>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1a7f4b] focus:ring-2 focus:ring-[#1a7f4b]/20 transition-all"
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
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1a7f4b] focus:ring-2 focus:ring-[#1a7f4b]/20 transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-700">Password</label>
              {mode === "signin" && (
                <Link href="/forgot-password" className="text-xs text-[#1a7f4b] hover:underline font-medium">
                  Forgot?
                </Link>
              )}
            </div>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1a7f4b] focus:ring-2 focus:ring-[#1a7f4b]/20 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 bg-[#1a7f4b] hover:bg-[#15663d] text-white rounded-full py-2.5 text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === "signup" ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <p className="text-center text-xs text-gray-500">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setErr(""); setSuccess(""); }}
                className="text-[#1a7f4b] font-medium hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signin"); setErr(""); setSuccess(""); }}
                className="text-[#1a7f4b] font-medium hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Terms */}
        <p className="text-center text-[11px] text-gray-400 border-t border-gray-100 pt-4">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-[#1a7f4b] hover:underline font-medium">Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" className="text-[#1a7f4b] hover:underline font-medium">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
