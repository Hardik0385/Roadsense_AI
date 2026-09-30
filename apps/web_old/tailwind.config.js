export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          600: '#374151'
        },
        primary: {
          500: '#3B82F6',
          600: '#2563EB',
        },
        accent: {
          500: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
