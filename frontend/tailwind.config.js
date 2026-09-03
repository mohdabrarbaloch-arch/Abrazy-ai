/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        abrazy: {
          primary: '#00D35A',
          dark: '#00B84D',
          purple: '#7C3AED',
          'purple-dark': '#6D28D9',
          black: '#0A0A0A',
          gray: '#F5F5F5',
          border: '#E5E5E5',
          'message-user': '#DCF8C6',
          'message-bot': '#FFFFFF',
          studio: '#1E1B4B',
        },
      },
    },
  },
  plugins: [],
};
