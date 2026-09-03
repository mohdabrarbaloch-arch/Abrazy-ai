"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../lib/api";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const provider = searchParams.get("provider") || "google";
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      try {
        const result = await api.oauthCallback(provider, code, state || undefined);
        localStorage.setItem("token", result.access_token);
        localStorage.setItem("refresh_token", result.refresh_token);
        
        // Check if user is new (you might want to add a flag in the response)
        router.push("/dashboard");
      } catch (e: any) {
        setError(e.message || "Authentication failed");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f2f5] to-[#e5e7eb]">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
        {error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <svg
                className="animate-spin h-12 w-12 text-[#00a884] mx-auto"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Completing sign in...</h1>
            <p className="text-gray-600">Please wait while we set up your account</p>
          </>
        )}
      </div>
    </div>
  );
}
