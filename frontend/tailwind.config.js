/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DB954',
        secondary: '#282828',
        dark: '#121212',
        light: '#282828',
        'lightest': '#B3B3B3',
      },
    },
  },
  plugins: [],
} 