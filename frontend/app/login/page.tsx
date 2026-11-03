"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /login → /auth/login (canonical auth route)
export default function LoginRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/auth/login"); }, [router]);
  return null;
}
