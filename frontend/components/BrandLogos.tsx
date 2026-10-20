import React from "react";

export function GroqLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        fill="#F55036"
        stroke="#F55036"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GeminiLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
        fill="url(#geminiBrandGrad)"
      />
      <defs>
        <linearGradient id="geminiBrandGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1BA1E3" />
          <stop offset="0.5" stopColor="#5B76EC" />
          <stop offset="1" stopColor="#9B51E0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function OpenAILogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.657a4.47 4.47 0 0 1 2.34-1.975v5.679a.795.795 0 0 0 .392.68l5.84 3.37-2.02 1.168a.076.076 0 0 1-.071 0l-4.839-2.793A4.504 4.504 0 0 1 2.34 8.657zm15.9-1.968l-4.784-2.76a.792.792 0 0 0-.78 0L6.833 7.301v-2.33a.08.08 0 0 1 .033-.062l4.84-2.795a4.5 4.5 0 0 1 6.534 4.575zm3.42 6.027a4.484 4.484 0 0 1-2.34 1.975v-5.68a.795.795 0 0 0-.392-.68l-5.84-3.37 2.02-1.168a.076.076 0 0 1 .071 0l4.839 2.793a4.504 4.504 0 0 1 1.642 6.13zM15.42 13.5l-3.42 1.975-3.42-1.975v-3.95l3.42-1.975 3.42 1.975z" />
    </svg>
  );
}

export function ClaudeLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#D97757" className={className}>
      <path d="M13.5 2h-3l.5 6.5-5.5-3.5-1.5 2.5 5.5 3.5-6.5.5v3l6.5.5-5.5 3.5 1.5 2.5 5.5-3.5-.5 6.5h3l-.5-6.5 5.5 3.5 1.5-2.5-5.5-3.5 6.5-.5v-3l-6.5-.5 5.5-3.5-1.5-2.5-5.5 3.5z" />
    </svg>
  );
}
