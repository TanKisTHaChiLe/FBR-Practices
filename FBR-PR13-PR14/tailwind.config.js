/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'flicker': 'flicker 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s infinite',
        'fireParticle': 'fireParticle 2s ease-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '0.6', textShadow: '0 0 5px rgba(255, 100, 30, 0.5)' },
          '50%': { opacity: '1', textShadow: '0 0 20px rgba(255, 100, 30, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        fireParticle: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '100%': { transform: 'translateY(-100px) scale(0)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}