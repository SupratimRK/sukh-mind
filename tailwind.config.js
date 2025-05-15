/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sukh: {
          primary: '#4f46e5', // Main brand color
          secondary: '#818cf8', // Secondary color
          light: '#f0f4f9', // Light background
          card: '#ffffff', // Card background
          hover: '#e8eaed', // Hover state
          border: '#eaeaea',
          text: {
            primary: '#333333',
            secondary: '#666666',
            muted: '#888888',
          }
        },
        // Keep some Gemini colors for inspiration but don't use by default
        gemini: {
          sidebar: '#202124',
          main: '#17181a',
          card: '#303134',
          hover: '#3c4043',
          accent: '#8ab4f8',
        }
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}

