/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#1d6fa4',
          600: '#0f5a8a',
          700: '#0a4570',
          800: '#073457',
          900: '#051f36',
        },
        gold: {
          400: '#f5c842',
          500: '#e6b800',
          600: '#c9a200',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
  future: { hoverOnlyWhenSupported: true }
};
