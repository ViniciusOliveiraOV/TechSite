// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyberBlue: '#00ffff',
        pukeYellow: '#e0ff00',
        retroGray: '#999999',
      },
      fontFamily: {
        retro: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}