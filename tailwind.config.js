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
        /** 짙은 중립 그레이 (입력·보조 버튼·패널) — zinc 계열 */
        surface: {
          800: '#18181b',
          700: '#27272a',
          600: '#3f3f46',
          500: '#52525b',
        },
        /** 포인트 — 다크모드 UI 액센트 */
        brand: {
          DEFAULT: '#00B854',
          hover: '#00ca66',
          soft: '#052e14',
        },
        accent: {
          violet: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
}
