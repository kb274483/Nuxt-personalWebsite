/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [],
  theme: {
    extend: {
      colors: {
        "neo-accent": "#FF6B6B",
        "neo-secondary": "#FFD93D",
        "neo-muted": "#C4B5FD",
        "neo-bg": "#FFFDF5",
      },
      fontFamily: {
        sans: ['"Space Grotesk"', "sans-serif"],
      },
      boxShadow: {
        "neo-sm": "4px 4px 0px 0px #000",
        "neo-md": "8px 8px 0px 0px #000",
        "neo-lg": "12px 12px 0px 0px #000",
        "neo-sm-w": "4px 4px 0px 0px #fff",
        "neo-md-w": "8px 8px 0px 0px #fff",
      },
    },
  },
  plugins: [],
};
