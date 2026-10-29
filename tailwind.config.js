/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        chi: {
          green: '#176B45',
          orange: '#F59E0B',
          cream: '#FFF9F0',
          ink: '#202820',
          muted: '#777777',
          light: '#E2F5E9',
          border: '#E8E8E8',
        },
      },
    },
  },
  plugins: [],
};
