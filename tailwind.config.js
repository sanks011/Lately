// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enables dark mode based on the 'class' strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#646cff',  // Primary color
        secondary: '#535bf2', // Secondary color
        background: '#242424', // Background color
        text: '#ffffff', // Text color
      },
      fontFamily: {
        ahkio: ['Ahkio', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
