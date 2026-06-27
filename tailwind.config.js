/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Fonts ───────────────────────────────────────────────────────────
      fontFamily: {
        arabic: ['Cairo', 'Noto Sans Arabic', 'sans-serif'],
        sans:   ['Cairo', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
      },

      // ── Colors ──────────────────────────────────────────────────────────
      colors: {
        // CSS-var driven (Radix / shadcn compatibility)
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // ── Design system tokens (use directly in className) ────────────

        // Ink — warm near-black scale (replaces slate/gray)
        ink: {
          950: '#1A1814',
          800: '#2E2A24',
          600: '#4B4640',
          400: '#6B6560',
          200: '#9B9590',
          100: '#C8C2BC',
        },

        // Paper — warm white/cream scale (replaces white/gray-50)
        paper: {
          50:  '#FAFAF8',
          100: '#F5F2ED',
          200: '#EDE8E0',
          300: '#E8E4DC',
          400: '#D9D3C8',
        },

        // Teal — trust, interactive, editorial approval
        teal: {
          600: '#0D7C6F',
          500: '#0F9080',
          100: '#D0F0EC',
          50:  '#E8FAF7',
        },

        // Gold — quality signal, editorial badge, trust mark
        gold: {
          600:    '#C9A84C',
          400:    '#D9BC76',
          100:    '#F5F0E8',
          border: '#E8D9A8',
        },

        // Semantic
        success: { 600: '#16A34A', 50: '#F0FDF4' },
        warning: { 600: '#D97706', 50: '#FFFBEB' },
        error:   { 600: '#DC2626', 50: '#FEF2F2' },
      },

      // ── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',   // standard card — maps to var(--radius)
        xl:   '20px',
        '2xl': '24px',
        lg_var: 'var(--radius)',
        md_var: 'calc(var(--radius) - 4px)',
        sm_var: 'calc(var(--radius) - 8px)',
      },

      // ── Box shadows — warm, not cool ─────────────────────────────────────
      boxShadow: {
        xs:          '0 1px 2px rgba(26,24,20,0.04)',
        card:        '0 1px 4px rgba(26,24,20,0.06), 0 1px 2px rgba(26,24,20,0.04)',
        'card-hover':'0 4px 12px rgba(26,24,20,0.08), 0 1px 4px rgba(26,24,20,0.04)',
        modal:       '0 8px 24px rgba(26,24,20,0.10), 0 2px 8px rgba(26,24,20,0.06)',
        // Legacy aliases (keep for compatibility)
        sm:          '0 1px 4px rgba(26,24,20,0.06), 0 1px 2px rgba(26,24,20,0.04)',
        md:          '0 4px 12px rgba(26,24,20,0.08), 0 1px 4px rgba(26,24,20,0.04)',
        lg:          '0 8px 24px rgba(26,24,20,0.10), 0 2px 8px rgba(26,24,20,0.06)',
      },

      // ── Keyframes ────────────────────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        shimmer:          'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
