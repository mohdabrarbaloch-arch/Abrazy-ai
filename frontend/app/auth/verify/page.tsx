"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../lib/api";

export default function VerifyMagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("Invalid or missing verification token");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      try {
        const result = await api.verifyMagicLink(token);
        localStorage.setItem("token", result.access_token);
        localStorage.setItem("refresh_token", result.refresh_token);
        router.push("/dashboard");
      } catch (e: any) {
        setError(e.message || "Verification failed");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f2f5] to-[#e5e7eb]">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
        {error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your magic link...</h1>
            <p className="text-gray-600">Please wait a moment</p>
          </>
        )}
      </div>
    </div>
  );
}
