/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#F5C842',
          400: '#D4AF37',
          500: '#B8960C',
          600: '#92740A',
          700: '#6B5408',
          800: '#473805',
          900: '#2A2000',
        },
        dark: {
          50:  '#2A2A2A',
          100: '#222222',
          200: '#1A1A1A',
          300: '#141414',
          400: '#111111',
          500: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold:    '0 0 20px rgba(212,175,55,0.15)',
        'gold-lg':'0 0 40px rgba(212,175,55,0.25)',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%,100%': { boxShadow: '0 0 10px rgba(212,175,55,0.1)' },
          '50%':     { boxShadow: '0 0 30px rgba(212,175,55,0.35)' },
        },
      },
    },
  },
  plugins: [],
}
