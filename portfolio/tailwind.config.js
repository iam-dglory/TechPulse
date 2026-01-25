/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#070A12',
          950: '#040611',
        },
      },
      boxShadow: {
        glass:
          '0 10px 30px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)',
      },
      backgroundImage: {
        'ai-radial':
          'radial-gradient(1200px circle at 20% 10%, rgba(124,58,237,.35), transparent 45%), radial-gradient(1000px circle at 80% 30%, rgba(34,211,238,.22), transparent 40%), radial-gradient(900px circle at 60% 90%, rgba(59,130,246,.18), transparent 45%)',
        'grid-faint':
          'linear-gradient(to right, rgba(148,163,184,.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,.07) 1px, transparent 1px)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '.65' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 2.2s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

