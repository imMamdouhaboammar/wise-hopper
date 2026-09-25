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
        background: '#FFFFFF',
        foreground: '#242035',
        primary: {
          DEFAULT: '#7054D4',
          hover: '#5F44C0',
          active: '#4E34AB',
          foreground: '#FFFFFF',
        },
        lavender: {
          light: '#F8F6FF',
          DEFAULT: '#F0EAFF',
          dark: '#E0D4FF',
          border: '#E8E3F5',
        },
        ink: {
          primary: '#242035',
          secondary: '#706B80',
          muted: '#9E9AA8',
          border: '#EAE7F2',
        },
      },
      fontFamily: {
        arabic: ['var(--font-ibm-plex-arabic)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
