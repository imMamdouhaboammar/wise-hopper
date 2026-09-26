import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6',
        foreground: '#1A1626',
        primary: {
          DEFAULT: '#5D3EBC',
          hover: '#4B2F9F',
          active: '#3D2483',
          foreground: '#FFFFFF',
        },
        lavender: {
          light: '#F8F6FD',
          DEFAULT: '#EFEBF9',
          dark: '#DFD8F3',
          border: '#E8E2F2',
        },
        ink: {
          primary: '#1A1626',
          secondary: '#4E485F',
          muted: '#767087',
          border: '#EDE8E1',
        },
        paper: {
          DEFAULT: '#FAF9F6',
          warm: '#F7F5F0',
          pure: '#FFFFFF',
        },
      },
      fontFamily: {
        arabic: ['var(--font-ibm-plex-arabic)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      maxWidth: {
        prose: '70ch',
        '8xl': '88rem',
      },
      boxShadow: {
        'soft-xs': '0 1px 3px rgba(26, 22, 38, 0.03)',
        'soft-sm': '0 2px 8px -2px rgba(26, 22, 38, 0.04)',
        'soft-md': '0 6px 20px -4px rgba(26, 22, 38, 0.05), 0 2px 6px -1px rgba(93, 62, 188, 0.03)',
        'soft-lg': '0 12px 32px -8px rgba(26, 22, 38, 0.07), 0 4px 12px -2px rgba(93, 62, 188, 0.04)',
        'soft-xl': '0 20px 48px -12px rgba(26, 22, 38, 0.09), 0 8px 24px -4px rgba(93, 62, 188, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
