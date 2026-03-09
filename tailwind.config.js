/** @type {import('tailwindcss').Config} */
module.exports = {
  // Add the app directory to the content array!
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        card: '#FFFFFF',
        primary: '#0D9488',
        secondary: '#CCFBF1',
        feature: '#FB7185',
        textmain: '#0F172A',
        textmuted: '#64748B',
        border: '#E2E8F0',
      },
    },
    boxShadow: {
      'ev-card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    },
  },
  plugins: [],
};
