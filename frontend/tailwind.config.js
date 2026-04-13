/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* shadcn/ui CSS variable mappings — required for @apply border-border etc. */
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        border:      'var(--border)',
        input:       'var(--input)',
        ring:        'var(--ring)',
        primary: {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:    'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT:    'var(--destructive)',
        },
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT:    'var(--popover)',
          foreground: 'var(--popover-foreground)',
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
        brand: {
          primary:                    '#004ac6',
          'primary-dim':              '#b4c5ff',
          'primary-fixed':            '#dbe1ff',
          'primary-container':        '#2563eb',
          'on-primary':               '#ffffff',
          tertiary:                   '#6a1edb',
          'tertiary-container':       '#8343f4',
          secondary:                  '#455f87',
          'secondary-container':      '#b5d0fd',
          surface:                    '#f9f9ff',
          'surface-bright':           '#f9f9ff',
          'surface-container-lowest': '#ffffff',
          'surface-container-low':    '#f1f3ff',
          'surface-container':        '#e9edff',
          'surface-container-high':   '#e1e8fd',
          'surface-container-highest':'#dce2f7',
          'on-surface':               '#141b2b',
          'on-surface-variant':       '#434655',
          'outline-variant':          '#c3c6d7',
          outline:                    '#737686',
          'inverse-surface':          '#293040',
          'inverse-on-surface':       '#edf0ff',
          'hero-start':               '#00174b',
          'hero-end':                 '#004ac6',
        },
      },
      fontFamily: {
        sans:     ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
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
      backdropBlur: {
        'xs':  '2px',
        '4xl': '72px',
      },
    },
  },
  plugins: [],
}
