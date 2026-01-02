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
          50: '#fef3e2',
          100: '#fde7c5',
          200: '#fbcf8b',
          300: '#f9b751',
          400: '#f79f17',
          500: '#f58b02',
          600: '#c46f02',
          700: '#935302',
          800: '#623701',
          900: '#311c01',
        }
      },
      fontSize: {
        'tablet': '1.125rem',  // 18px - good for tablets
        'tablet-lg': '1.5rem', // 24px
        'tablet-xl': '2rem',   // 32px
      }
    },
  },
  plugins: [],
}

