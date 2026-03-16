/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          soft: '#fdf0f4',
          light: '#f8e0e8',
          mid: '#e0a0b4',
          deep: '#c4728a',
        },
        brown: {
          warm: '#be9470',
          deep: '#9a6e54',
        },
        cream: '#fdf8f5',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      animation: {
        heartbeat: 'heartbeat 1.8s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease forwards',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.08)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.05)' },
          '56%': { transform: 'scale(1)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(196,114,138,0.35)' },
          '70%': { boxShadow: '0 0 0 30px rgba(196,114,138,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(196,114,138,0)' },
        },
      },
    },
  },
  plugins: [],
}
