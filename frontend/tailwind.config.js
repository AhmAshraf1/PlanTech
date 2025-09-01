import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        pathlo: '#163022',
        axolotl: '#5f6f52',
        asparagus: '#98a668',
        deer: '#b88248',
        royalbrown: '#523930',
        white: '#ffffff',
        // Dark mode variants
        'dark-bg': '#1a1a1a',
        'dark-card': '#2d2d2d',
        'dark-text': '#e5e5e5',
      },
      fontFamily: {
        hank: ['HankRnd Black', ...defaultTheme.fontFamily.sans],
        helvetica: ['HelveticaNeue Light', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in-left': 'slideInFromLeft 0.6s ease-out',
        'slide-in-right': 'slideInFromRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
