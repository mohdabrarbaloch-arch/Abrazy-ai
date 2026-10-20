"use client";
import React from "react";

interface ConnectorIconProps {
  id: string;
  name?: string;
  className?: string;
  size?: number;
}

export default function ConnectorIcon({ id, name, className = "", size = 28 }: ConnectorIconProps) {
  const normId = (id || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  // Render authentic brand SVGs
  switch (normId) {
    case "gmail":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
          <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
          <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
          <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
          <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C8.132,7.553,5.656,8.04,4.502,9.914L3,12.298z" />
          <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341c1.744-1.306,4.22-0.819,5.374,1.055L45,12.298z" />
        </svg>
      );

    case "github":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <circle cx="12" cy="12" r="12" fill="#181717" />
          <path
            fill="#ffffff"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );

    case "gcal":
    case "googlecalendar":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
          <rect width="36" height="36" x="6" y="6" fill="#1e88e5" rx="4" />
          <path fill="#fff" d="M14 16h6v4h-6zm0 6h6v4h-6zm0 6h6v4h-6zm8-12h6v4h-6zm0 6h6v4h-6zm0 6h6v4h-6zm8-12h6v4h-6zm0 6h6v4h-6zm0 6h6v4h-6z" />
          <text x="24" y="32" fill="#fff" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">31</text>
        </svg>
      );

    case "notion":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={`shrink-0 ${className}`}>
          <rect width="100" height="100" rx="20" fill="#000000" />
          <path
            fill="#ffffff"
            d="M26.4 20.3c3.8.3 4.8.4 8.7 2.9l43 27.2c3.2 2 4.1 3.5 4.1 6.8v22.7c0 4.1-1.3 5.4-5.3 5.1-3.6-.3-5.3-1.6-8.9-3.9L24.8 53.6c-2.9-1.9-4.2-3.8-4.2-7.1V25.2c0-3.5 1.9-5.2 5.8-4.9z"
          />
          <path
            fill="#000000"
            d="M38.8 38.6v33.7l6.8 3.9V42.5l24.9 15.8v-8.8L45.6 34.7l-6.8 3.9z"
          />
        </svg>
      );

    case "gsheets":
    case "googlesheets":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
          <path fill="#0f9d58" d="M37,45H11c-2.2,0-4-1.8-4-4V7c0-2.2,1.8-4,4-4h18l12,12v26C41,43.2,39.2,45,37,45z" />
          <path fill="#87ceac" d="M29,3v12h12L29,3z" />
          <path fill="#fff" d="M15 21h18v16H15z" />
          <path fill="#0f9d58" d="M21 21v16h-2V21h2zm6 0v16h-2V21h2zm-8 5h14v2H19v-2zm0 6h14v2H19v-2z" />
        </svg>
      );

    case "slack":
    case "slackbot":
      return (
        <svg width={size} height={size} viewBox="0 0 128 128" className={`shrink-0 ${className}`}>
          <path d="M27.2 80c0 7.3-6 13.3-13.3 13.3S.5 87.3.5 80s6-13.3 13.3-13.3H27.2V80zm6.7 0c0-7.3 6-13.3 13.3-13.3s13.3 6 13.3 13.3v33.4c0 7.3-6 13.3-13.3 13.3s-13.3-6-13.3-13.3V80z" fill="#E01E5A" />
          <path d="M47.2 27.2c-7.3 0-13.3-6-13.3-13.3S39.9.5 47.2.5s13.3 6 13.3 13.3V27.2H47.2zm0 6.7c7.3 0 13.3 6 13.3 13.3s-6 13.3-13.3 13.3H13.8C6.5 60.5.5 54.5.5 47.2s6-13.3 13.3-13.3h33.4z" fill="#36C5F0" />
          <path d="M100.8 47.2c0-7.3 6-13.3 13.3-13.3s13.3 6 13.3 13.3-6 13.3-13.3 13.3H100.8V47.2zm-6.7 0c0 7.3-6 13.3-13.3 13.3s-13.3-6-13.3-13.3V13.8C80.8 6.5 86.8.5 94.1.5s13.3 6 13.3 13.3v33.4z" fill="#2EB67D" />
          <path d="M80.8 100.8c7.3 0 13.3 6 13.3 13.3s-6 13.3-13.3 13.3-13.3-6-13.3-13.3V100.8h13.3zm0-6.7c-7.3 0-13.3-6-13.3-13.3s6-13.3 13.3-13.3h33.4c7.3 0 13.3 6 13.3 13.3s-6 13.3-13.3 13.3H80.8z" fill="#ECB22E" />
        </svg>
      );

    case "supabase":
      return (
        <svg width={size} height={size} viewBox="0 0 106 100" className={`shrink-0 ${className}`}>
          <rect width="106" height="100" rx="20" fill="#1C1C1C" />
          <path
            fill="#3ECF8E"
            d="M60.1 91.5c-2.3 3.1-7.3 1.8-7.8-2.1L45.4 34.7h35.8c6 0 9.2 7 5.2 11.5L60.1 91.5z"
          />
          <path
            fill="#24B47E"
            d="M45.9 8.5c2.3-3.1 7.3-1.8 7.8 2.1l6.9 54.7H24.8c-6 0-9.2-7-5.2-11.5L45.9 8.5z"
          />
        </svg>
      );

    case "outlook":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
          <rect width="28" height="28" x="16" y="10" fill="#0078d4" rx="3" />
          <path fill="#fff" d="M16 14l14 10 14-10v20H16z" opacity=".2" />
          <rect width="22" height="22" x="4" y="13" fill="#005a9e" rx="4" />
          <text x="15" y="29" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">O</text>
        </svg>
      );

    case "twitter":
    case "x":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path
            fill="#ffffff"
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          />
        </svg>
      );

    case "gdrive":
    case "googledrive":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
          <path fill="#FFC107" d="M17 6L3 30h14l14-24z" />
          <path fill="#2196F3" d="M45 30H17l-7 12h28c2.2 0 4-1.8 4-4z" />
          <path fill="#4CAF50" d="M31 6H17l14 24h14z" />
        </svg>
      );

    case "gdocs":
    case "googledocs":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
          <path fill="#2196F3" d="M37,45H11c-2.2,0-4-1.8-4-4V7c0-2.2,1.8-4,4-4h18l12,12v26C41,43.2,39.2,45,37,45z" />
          <path fill="#BBDEFB" d="M29,3v12h12L29,3z" />
          <path fill="#ffffff" d="M15 22h18v3H15zm0 6h18v3H15zm0 6h12v3H15z" />
        </svg>
      );

    case "hubspot":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#FF7A59" />
          <path fill="#ffffff" d="M17 10.5V8.2c.8-.4 1.3-1.2 1.3-2.2 0-1.4-1.1-2.5-2.5-2.5s-2.5 1.1-2.5 2.5c0 1 .5 1.8 1.3 2.2v2.3L10.9 13c-.5-.4-1.1-.6-1.8-.6-1.6 0-3 1.3-3 3s1.3 3 3 3c1.5 0 2.8-1.2 3-2.7l3.8 2.2c-.1.3-.1.6-.1.9 0 1.9 1.6 3.5 3.5 3.5s3.5-1.6 3.5-3.5-1.6-3.5-3.5-3.5c-.7 0-1.4.2-1.9.6L17 10.5zM15.8 5c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm-6.7 12.4c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" />
        </svg>
      );

    case "linear":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={`shrink-0 ${className}`}>
          <rect width="100" height="100" rx="20" fill="#5E6AD2" />
          <path fill="#ffffff" d="M30 65L65 30m-20 40L75 40M25 55L55 25" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );

    case "airtable":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#202124" />
          <path fill="#FCB400" d="M11.5 3.5L3.5 7.8v7.4l8-4.3z" />
          <path fill="#18BFFF" d="M12.5 3.5l8 4.3v7.4l-8-4.3z" />
          <path fill="#F82B60" d="M3.5 16.5l8 4.3 8-4.3-8-4.3z" />
        </svg>
      );

    case "jira":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#0052CC" />
          <path fill="#ffffff" d="M12 2a5 5 0 0 0-5 5v5a5 5 0 0 0 5 5 5 5 0 0 0 5-5V7a5 5 0 0 0-5-5zm0 14a4 4 0 0 1-4-4V7a4 4 0 0 1 8 0v5a4 4 0 0 1-4 4z" opacity=".4" />
          <path fill="#ffffff" d="M12 6a5 5 0 0 0-5 5v5a5 5 0 0 0 5 5 5 5 0 0 0 5-5v-5a5 5 0 0 0-5-5z" />
        </svg>
      );

    case "youtube":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
          <path fill="#FF0000" d="M43.2,12.5c-0.5-1.9-2-3.4-3.9-3.9C35.8,7.5,24,7.5,24,7.5s-11.8,0-15.3,1c-1.9,0.5-3.4,2-3.9,3.9 C3.8,16,3.8,24,3.8,24s0,8,1,11.5c0.5,1.9,2,3.4,3.9,3.9c3.5,1,15.3,1,15.3,1s11.8,0,15.3-1c1.9-0.5,3.4-2,3.9-3.9c1-3.5,1-11.5,1-11.5 S44.2,16,43.2,12.5z" />
          <polygon fill="#FFFFFF" points="20,31 31,24 20,17" />
        </svg>
      );

    case "discord":
    case "discordbot":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#5865F2" />
          <path fill="#ffffff" d="M19.3 5.3A15.9 15.9 0 0 0 15.5 4a.1.1 0 0 0-.1.1 11 11 0 0 0-.5 1 14.6 14.6 0 0 0-5.8 0 10.7 10.7 0 0 0-.5-1 .1.1 0 0 0-.1-.1 15.9 15.9 0 0 0-3.8 1.3.1.1 0 0 0 0 .1C2.3 8.9 1.6 12.4 2 15.8a.1.1 0 0 0 .1.1 16 16 0 0 0 4.8 2.4.1.1 0 0 0 .1 0c.4-.5.7-1 1-1.6a.1.1 0 0 0-.1-.1 10.5 10.5 0 0 1-1.5-.7.1.1 0 0 1 0-.2c.1-.1.2-.2.3-.3a11.4 11.4 0 0 0 9.8 0c.1.1.2.2.3.3a.1.1 0 0 1 0 .2c-.5.3-1 .5-1.5.7a.1.1 0 0 0-.1.1c.3.6.7 1.1 1 1.6a.1.1 0 0 0 .1 0 15.9 15.9 0 0 0 4.8-2.4.1.1 0 0 0 .1-.1c.5-4-.8-7.5-2.7-10.5a.1.1 0 0 0 0-.1zM8.5 13.7c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8c1 0 1.7.8 1.6 1.8 0 1-.7 1.8-1.6 1.8zm7 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8c1 0 1.7.8 1.6 1.8 0 1-.7 1.8-1.6 1.8z" />
        </svg>
      );

    case "figma":
      return (
        <svg width={size} height={size} viewBox="0 0 38 57" className={`shrink-0 ${className}`}>
          <path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
          <path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
          <path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
          <path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
          <path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
        </svg>
      );

    case "reddit":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <circle cx="12" cy="12" r="12" fill="#FF4500" />
          <path fill="#ffffff" d="M12 4.5c-.3 0-.6.2-.7.5l-1.3 4.2c-1.3.1-2.5.4-3.6.9-.3-.3-.7-.5-1.2-.5-1 0-1.8.8-1.8 1.8 0 .6.3 1.2.8 1.5-.1.4-.1.7-.1 1.1 0 2.8 3.5 5 7.9 5s7.9-2.2 7.9-5c0-.4 0-.7-.1-1.1.5-.3.8-.9.8-1.5 0-1-.8-1.8-1.8-1.8-.5 0-.9.2-1.2.5-1.1-.5-2.3-.8-3.6-.9l1-3.2 2.7.6c0 .8.7 1.4 1.5 1.4.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5c-.5 0-1 .3-1.3.7l-3.1-.7c-.2 0-.3 0-.4.2zm-2.8 7.5c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3-1.3-.6-1.3-1.3.6-1.3 1.3-1.3zm5.6 0c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3-1.3-.6-1.3-1.3.6-1.3 1.3-1.3zm-5.4 4c.8.6 2 .9 2.6.9s1.8-.3 2.6-.9c.2-.1.4-.1.5.1.1.2.1.4-.1.5-.9.8-2.3 1.1-3 1.1s-2.1-.3-3-1.1c-.2-.1-.2-.3-.1-.5.1-.2.3-.2.5-.1z" />
        </svg>
      );

    case "shopify":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#95BF47" />
          <path fill="#ffffff" d="M18.8 6.5l-1.4-.4c-.1 0-.2 0-.3.1l-.8 8.4-5.3-2.7-3.4 1-2.3-2.8-.7 11.4 13.9 2.5zm-5.2-1.8l-1.4 2.8-1.9-.4 2.4-4.8 2.2.8c0 .5-.6 1.1-1.3 1.6z" opacity=".7" />
          <path fill="#ffffff" d="M12.8 9.5c-2.4 0-3.5 1.5-3.5 2.5 0 2.4 3.7 2.2 3.7 3.9 0 .8-.6 1.3-1.5 1.3-1.2 0-2.1-.8-2.1-.8l-.4 1.6s1 .7 2.3.7c2.5 0 3.8-1.5 3.8-2.8 0-2.6-3.8-2.3-3.8-3.9 0-.7.5-1.1 1.3-1.1 1 0 1.7.5 1.7.5l.4-1.5s-.8-.4-1.9-.4z" />
        </svg>
      );

    case "stripe":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#635BFF" />
          <path fill="#ffffff" d="M13.9 9.8c0-.7-.6-1.1-1.6-1.1-1.4 0-3.2.4-4.6 1.2V6.2c1.6-.7 3.3-1 4.9-1 3.9 0 6.5 2 6.5 5.8 0 5.6-7.7 4.7-7.7 7.1 0 .9.8 1.2 1.9 1.2 1.7 0 3.8-.7 5.2-1.6v3.7c-1.7.8-3.6 1.1-5.4 1.1-4.1 0-7-2-7-5.9 0-6.1 7.8-5 7.8-7.8z" />
        </svg>
      );

    case "whatsapp":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <circle cx="12" cy="12" r="12" fill="#25D366" />
          <path fill="#ffffff" d="M17.5 14.4c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1-.2.2-.6.7-.7.9-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.8-1.1-.7-.6-1.1-1.3-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.2.3-.4.1-.1.1-.2.2-.4.1-.1 0-.3 0-.4-.1-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.5 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.7.1.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3z" />
        </svg>
      );

    case "zoom":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#2D8CFF" />
          <path fill="#ffffff" d="M5 9c0-.6.4-1 1-1h8c.6 0 1 .4 1 1v6c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1V9zm11 1.2l3-2.2v8l-3-2.2v-3.6z" />
        </svg>
      );

    case "linkedin":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#0A66C2" />
          <path fill="#ffffff" d="M7.1 9.5H4.2V19h2.9V9.5zM5.6 4.8C4.7 4.8 4 5.5 4 6.4c0 .9.7 1.6 1.6 1.6.9 0 1.6-.7 1.6-1.6 0-.9-.7-1.6-1.6-1.6zm14.2 8.7c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5V9.5h-2.9c.1.8 0 9.5 0 9.5h2.9v-5.3c0-.3 0-.6.1-.8.2-.6.8-1.2 1.7-1.2 1.2 0 1.7.9 1.7 2.3V19h2.9v-5.5h-.2z" />
        </svg>
      );

    case "sentry":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#362D59" />
          <path fill="#FF4F64" d="M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm1 12.5h-2v-2h2zm0-4h-2V7h2z" />
        </svg>
      );

    case "snowflake":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#29B5E8" />
          <path fill="#ffffff" d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1L19.1 4.9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "teams":
    case "microsoftteams":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" x="20" y="12" fill="#5059C9" rx="3" />
          <rect width="18" height="18" x="4" y="15" fill="#7B83EB" rx="3" />
          <text x="13" y="29" fill="#fff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">T</text>
        </svg>
      );

    case "asana":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#F06A6A" />
          <circle cx="12" cy="7.5" r="3" fill="#ffffff" />
          <circle cx="6.5" cy="15.5" r="3" fill="#ffffff" />
          <circle cx="17.5" cy="15.5" r="3" fill="#ffffff" />
        </svg>
      );

    case "clickup":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#7B68EE" />
          <path fill="#ffffff" d="M5.5 13.5l6.5-6.5 6.5 6.5-2.2 2.2-4.3-4.3-4.3 4.3z" />
          <circle cx="12" cy="18" r="1.5" fill="#ffffff" />
        </svg>
      );

    case "mailchimp":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#FFE01B" />
          <circle cx="12" cy="12" r="7" fill="#000000" />
          <circle cx="10" cy="11" r="1.5" fill="#FFE01B" />
          <circle cx="14" cy="11" r="1.5" fill="#FFE01B" />
          <path d="M10 14c.6.8 1.4 1 2 1s1.4-.2 2-1" stroke="#FFE01B" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case "dropbox":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#0061FF" />
          <path fill="#ffffff" d="M7 6l5 3.3L7 12.7 2 9.3zm10 0l5 3.3-5 3.4-5-3.4zM2 16.1l5-3.4 5 3.4-5 3.3zm20 0l-5-3.4-5 3.4 5 3.3zM12 17.5l5-3.3v1.8l-5 3.3-5-3.3v-1.8z" />
        </svg>
      );

    case "canvas":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#E72429" />
          <circle cx="12" cy="12" r="6" stroke="#fff" strokeWidth="2.5" fill="none" strokeDasharray="4 2" />
        </svg>
      );

    case "bitbucket":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <rect width="24" height="24" rx="5" fill="#0052CC" />
          <path fill="#ffffff" d="M4.5 4h15l-2.2 14.5a1.5 1.5 0 0 1-1.5 1.3H8.2a1.5 1.5 0 0 1-1.5-1.3L4.5 4zm5.5 10.5h4l.8-5h-5.6l.8 5z" />
        </svg>
      );

    default: {
      // Dynamic fallback monogram logo with harmonious color palette based on app name
      const displayName = name || id || "App";
      const initial = displayName.charAt(0).toUpperCase();
      const colors = [
        { bg: "#3B82F6", fg: "#FFFFFF" },
        { bg: "#10B981", fg: "#FFFFFF" },
        { bg: "#8B5CF6", fg: "#FFFFFF" },
        { bg: "#F59E0B", fg: "#FFFFFF" },
        { bg: "#EC4899", fg: "#FFFFFF" },
        { bg: "#06B6D4", fg: "#FFFFFF" },
        { bg: "#6366F1", fg: "#FFFFFF" },
        { bg: "#14B8A6", fg: "#FFFFFF" },
        { bg: "#F97316", fg: "#FFFFFF" },
      ];
      let hash = 0;
      for (let i = 0; i < displayName.length; i++) {
        hash = (hash << 5) - hash + displayName.charCodeAt(i);
        hash |= 0;
      }
      const pair = colors[Math.abs(hash) % colors.length];

      return (
        <div
          style={{ width: size, height: size, backgroundColor: pair.bg, color: pair.fg }}
          className={`shrink-0 rounded-lg flex items-center justify-center font-bold text-sm select-none shadow-sm ${className}`}
        >
          {initial}
        </div>
      );
    }
  }
}
