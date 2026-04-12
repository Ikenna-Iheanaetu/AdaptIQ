/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark:    '#1E3A5F',
          light:   '#DBEAFE',
        },
        success: {
          DEFAULT: '#10B981',
          light:   '#D1FAE5',
        },
        warning: {
          DEFAULT: '#D97706',
          light:   '#FEF3C7',
        },
        error: {
          DEFAULT: '#EF4444',
          light:   '#FEE2E2',
        },
        purple: {
          DEFAULT: '#7C3AED',
          light:   '#EDE9FE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card:   '12px',
        button: '8px',
        badge:  '999px',
        modal:  '16px',
      },
      boxShadow: {
        card:     '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        elevated: '0 4px 16px rgba(0,0,0,0.12)',
        hover:    '0 8px 24px rgba(37,99,235,0.12)',
      },
    },
  },
  plugins: [],
}
