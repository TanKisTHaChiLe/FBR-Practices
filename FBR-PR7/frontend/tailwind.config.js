/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f0f4fd',
          100: '#ced9e9',
          200: '#adbecf',
          300: '#8ba2b5',
          400: '#6a879b',
          500: '#4a6d82',
          600: '#3b5669',
          700: '#2d4050',
          800: '#1f2a37',
          900: '#0f141e',
        },
        accent: {
          100: '#fffde7',
          200: '#fff9c4',
          300: '#fff59d',
          400: '#fff176',
          500: '#ffee58',
          600: '#fdd835',
        },
        light: {
          300: '#81d4fa',
          400: '#4fc3f7',
          500: '#29b6f6',
          600: '#039be5',
          700: '#0288d1',
        }
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom, #0f141e 0%, #1f2a37 50%, #2d4050 100%)',
        'gradient-light': 'radial-gradient(circle at 30% 20%, rgba(255, 245, 157, 0.2) 0%, transparent 50%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2)' },
        },
      },
      boxShadow: {
        'soft': '0 0 20px rgba(255, 245, 157, 0.3)',
        'dark': '0 10px 40px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}