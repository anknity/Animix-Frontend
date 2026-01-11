/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF3333',
        secondary: '#FF6B35',
        dark: {
          900: '#0A0A0A',
          800: '#141414',
          700: '#1F1F1F',
          600: '#2A2A2A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
