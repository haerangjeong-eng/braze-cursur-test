/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
        },
        accent: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
}
