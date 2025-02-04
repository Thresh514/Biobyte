/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // This will ensure Tailwind scans your React components
  ],
  theme: {
    extend: {
      colors: {
        darkest: "#2a2d34",
        darker: "#4b4e55",
        middle: "#6c6f76",
        lighter: "#8d9097",
        lightest: "#aeb1b8",
      },
    },
  },
  plugins: [],
}

