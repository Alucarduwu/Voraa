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
          DEFAULT: '#6C4DFF',
          dark: '#4B32C3',
          light: '#F3F0FF',
        },
        success: '#16A34A',
        danger: '#EF4444',
        warning: '#F59E0B',
        lavender: '#F3F0FF',
        text: {
          DEFAULT: '#1F1F2E',
          muted: '#6B7280',
        }
      }
    },
  },
  plugins: [],
}
