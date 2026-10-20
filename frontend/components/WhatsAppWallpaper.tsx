"use client";
import React from "react";

export default function WhatsAppWallpaper() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
      style={{
        backgroundColor: "#f2f7f2",
      }}
    >
      <svg
        className="w-full h-full opacity-[0.065]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="abrazy-doodle-pattern"
            width="320"
            height="320"
            patternUnits="userSpaceOnUse"
          >
            {/* Chat Bubble 1 */}
            <path
              d="M30 30h36a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10H46l-10 8v-8h-6a10 10 0 0 1-10-10V40a10 10 0 0 1 10-10z"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Text lines in bubble */}
            <line x1="36" y1="45" x2="62" y2="45" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />
            <line x1="36" y1="55" x2="52" y2="55" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />

            {/* Coffee Cup */}
            <path
              d="M120 40h28v20a14 14 0 0 1-28 0V40zm28 5h6a5 5 0 0 1 0 10h-6M116 66h36"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Lightbulb */}
            <path
              d="M220 30a12 12 0 0 0-7 22c2 2 3 5 3 8h8c0-3 1-6 3-8a12 12 0 0 0-7-22zm-3 34h6m-4 4h2"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Headphones */}
            <path
              d="M280 44a20 20 0 0 1 36 0v16a6 6 0 0 1-6 6h-2V50h2a6 6 0 0 0 6-6 16 16 0 0 0-32 0 6 6 0 0 0 6 6h2v16h-2a6 6 0 0 1-6-6V44z"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Robot Head */}
            <rect
              x="30"
              y="120"
              width="36"
              height="30"
              rx="6"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
            />
            <circle cx="42" cy="133" r="2.5" fill="#00A844" />
            <circle cx="54" cy="133" r="2.5" fill="#00A844" />
            <line x1="48" y1="112" x2="48" y2="120" stroke="#00A844" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="48" cy="110" r="2" fill="#00A844" />
            <line x1="40" y1="142" x2="56" y2="142" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />

            {/* Camera */}
            <path
              d="M110 130h6l4-6h16l4 6h6a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6h-36a6 6 0 0 1-6-6v-20a6 6 0 0 1 6-6z"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="128" cy="144" r="7" fill="none" stroke="#00A844" strokeWidth="2.5" />

            {/* Paper Airplane */}
            <path
              d="M200 120l36 12-16 16-20-28zm20 28l-4 12 8-8"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Star Sparkle */}
            <path
              d="M285 125l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8z"
              fill="none"
              stroke="#00A844"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Music Note */}
            <path
              d="M40 215v20a6 6 0 1 1-5-5.8v-18l24-6v18a6 6 0 1 1-5-5.8v-12z"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Smartphone */}
            <rect
              x="115"
              y="200"
              width="24"
              height="44"
              rx="4"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
            />
            <line x1="123" y1="205" x2="131" y2="205" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />
            <circle cx="127" cy="238" r="1.5" fill="#00A844" />

            {/* Heart */}
            <path
              d="M195 215a7 7 0 0 0-10 0l-3 3-3-3a7 7 0 1 0-10 10l13 13 13-13a7 7 0 0 0 0-10z"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Gamepad */}
            <rect
              x="260"
              y="210"
              width="38"
              height="24"
              rx="8"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
            />
            <path d="M268 222h6m-3-3v6" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />
            <circle cx="288" cy="220" r="1.5" fill="#00A844" />
            <circle cx="292" cy="224" r="1.5" fill="#00A844" />

            {/* Clock */}
            <circle cx="48" cy="285" r="14" fill="none" stroke="#00A844" strokeWidth="2.5" />
            <polyline points="48 277 48 285 53 288" fill="none" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />

            {/* Speech Bubble 2 */}
            <path
              d="M115 280a14 14 0 0 1 24 10c0 4-2 7-5 9l2 7-7-3a14 14 0 0 1-14-23z"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* AI Chip / Processor */}
            <rect
              x="195"
              y="275"
              width="24"
              height="24"
              rx="3"
              fill="none"
              stroke="#00A844"
              strokeWidth="2.5"
            />
            <rect x="201" y="281" width="12" height="12" fill="none" stroke="#00A844" strokeWidth="1.8" />
            <line x1="200" y1="272" x2="200" y2="275" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />
            <line x1="207" y1="272" x2="207" y2="275" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />
            <line x1="214" y1="272" x2="214" y2="275" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />
            <line x1="200" y1="299" x2="200" y2="302" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />
            <line x1="207" y1="299" x2="207" y2="302" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />
            <line x1="214" y1="299" x2="214" y2="302" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />

            {/* Sun / Flower */}
            <circle cx="280" cy="285" r="7" fill="none" stroke="#00A844" strokeWidth="2.5" />
            <path d="M280 273v3m0 18v3m-12-12h3m18 0h3m-13-9l2 2m10 10l2 2m0-14l-2 2m-10 10l-2 2" stroke="#00A844" strokeWidth="2" strokeLinecap="round" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#abrazy-doodle-pattern)" />
      </svg>
    </div>
  );
}
