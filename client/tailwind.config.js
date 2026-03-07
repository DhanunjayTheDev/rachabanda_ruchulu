/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          gold: '#D4AF37',
          'accent-gold': '#E7C873',
        },
        secondary: {
          'dark-brown': '#2B1D15',
          'warm-brown': '#5A3E2B',
        },
        dark: {
          bg: '#0F0B08',
          card: '#1A1410',
          input: '#252019',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#E7E7E9',
            a: {
              color: '#D4AF37',
              '&:hover': {
                color: '#E7C873',
              },
            },
          },
        },
      },
      backdropFilter: {
        glass: 'blur(10px) brightness(1.05)',
      },
      boxShadow: {
        glass: '0 5px 15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        glow: '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.8s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
