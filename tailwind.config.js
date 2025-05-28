/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#5cc37c',
        secondary: '#ff6361',
        dark: {
          100: '#1a1a1a',
          200: '#2d2d2d',
          300: '#3d3d3d',
          400: '#525252',
          500: '#737373',
        }
      },
    },
  },
  plugins: [],
}
