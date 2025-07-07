import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pathlo: '#163022',
        axolotl: '#5f6f52',
        asparagus: '#98a668',
        deer: '#b88248',
        royalbrown: '#523930',
        white: '#ffffff',
      },
      fontFamily: {
        hank: ['HankRnd Black', ...defaultTheme.fontFamily.sans],
        helvetica: ['HelveticaNeue Light', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
