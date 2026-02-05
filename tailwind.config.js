/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/js/**/*.js",
    "./public/*.html"
  ],
  theme: {
    extend: {
      colors: {
        'ndtv-red': '#CC0000',
        'ndtv-dark': '#1a1a1a',
        'ndtv-gray': '#f8f9fa'
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'slide': 'slide 15s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        slide: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-100%)' }
        }
      }
    },
  },
  plugins: [],
}
