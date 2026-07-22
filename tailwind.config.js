/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Mirrors the canonical CSS tokens in globals.css :root so Tailwind
        // utility classes resolve to the same brand palette as var() usage.
        brand: {
          red: '#bf1d23',
          'red-dark': '#9e0006',
          navy: '#111827',
          'navy-light': '#374151',
          'navy-card': '#1f2937',
        },
        ba: {
          red: '#bf1d23',
          'red-deep': '#9e0006',
          navy: '#111827',
          muted: '#737d8c',
          green: '#189a55',
          amber: '#c47d10',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
