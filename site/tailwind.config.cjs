/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        paper: '#F4EFE6',
        'paper-dim': '#E8E1D3',
        red: {
          DEFAULT: '#C9242A',
          deep: '#9E1B21',
        },
        'dark-bg': '#0c0c0c',
        'on-dark': '#F4EFE6',

        // Plan-view "blueprint" palette (for the SVG plan inset)
        'blueprint-bg': '#0a0908',
        'blueprint-gold': '#d4a24c',
        'blueprint-gold-bright': '#f0c674',

        // Journey colour chips (from pitch deck zone markers)
        zone: {
          1: '#E8B23A',
          2: '#E27A2D',
          3: '#8A5AB0',
          4: '#2AA5A0',
          5: '#C9242A',
          6: '#2E7D5F',
        },
      },
      fontFamily: {
        display: ['Oswald', 'Impact', 'Haettenschweiler', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tight: '-0.01em',
        kicker: '0.22em',
        eyebrow: '0.28em',
        wide: '0.3em',
      },
      lineHeight: {
        display: '0.92',
        body: '1.55',
        quote: '1.05',
      },
    },
  },
  plugins: [],
};
