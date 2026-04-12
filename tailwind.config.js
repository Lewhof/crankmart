/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EA580C',
          hover: '#C44A0A',
          foreground: '#ffffff',
          ghost: 'rgba(234,88,12,0.06)',
          ring: 'rgba(234,88,12,0.15)',
        },
        ink: '#1a1a1a',
        background: '#ffffff',
        foreground: '#09090b',
        muted: {
          DEFAULT: '#f4f4f5',
          foreground: '#71717a',
        },
        border: '#e4e4e7',
        input: '#e4e4e7',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#09090b',
        },
        success: '#10B981',
        warning: '#F59E0B',
        destructive: '#EF4444',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.3px',
      },
      screens: {
        xs: '375px',
        sm: '430px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
}
