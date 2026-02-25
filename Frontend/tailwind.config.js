/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'strahd-dark': '#1a1a2e',
        'strahd-darker': '#16213e',
        'strahd-red': '#ff6b6b',
        'strahd-gray': '#4a5568',
      }
    },
  },
  plugins: [],
}
