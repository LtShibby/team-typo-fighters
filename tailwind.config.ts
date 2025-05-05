import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'arcade': {
          'primary': '#FF6B00',       // ACV orange
          'secondary': '#4ECDC4',
          'background': '#1A1A1A',     // Jet black
          'surface': '#F7F7F7',        // Light background
          'border': '#CCCCCC',         // Light gray
          'text': '#FFFFFF',           // White text
          'muted': '#888888',          // Subtle muted text
          'accent': '#FFE66D',
        }
      },
      fontFamily: {
        arcade: ['"Press Start 2P"', 'cursive'],
        sans: ['Inter', 'sans-serif'], // fallback
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
export default config 
