/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#b3e0ff',
          200: '#80caff',
          300: '#4db3ff',
          400: '#1a9dff',
          500: '#0088ff', // primary
          600: '#006ecc',
          700: '#005499',
          800: '#003a66',
          900: '#002033',
        },
        secondary: {
          50: '#e6fff9',
          100: '#b3ffed',
          200: '#80ffe1',
          300: '#4dffd5',
          400: '#1affc9',
          500: '#00ffbd', // secondary
          600: '#00cc97',
          700: '#009971',
          800: '#00664c',
          900: '#003326',
        },
        accent: {
          50: '#fff9e6',
          100: '#ffecb3',
          200: '#ffe080',
          300: '#ffd34d',
          400: '#ffc61a',
          500: '#ffb900', // accent
          600: '#cc9400',
          700: '#996f00',
          800: '#664a00',
          900: '#332500',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}