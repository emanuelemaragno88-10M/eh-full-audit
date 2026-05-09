import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#1a1a2e',
        card: '#2a2a3e',
        'card-hover': '#33334a',
        border: '#3a3a52',
        accent: '#ff523f',
        'accent-hover': '#ff6b5a',
        gold: '#c9a84c',
        'gold-soft': '#d6b96a',
        muted: '#9a9ab0',
        'muted-strong': '#c4c4d4',
        success: '#34d399',
        warning: '#fbbf24',
        critical: '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
