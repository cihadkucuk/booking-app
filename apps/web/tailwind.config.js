/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'IBM Plex Sans'", "sans-serif"]
      },
      colors: {
        ink: "#111113",
        sand: "#f6f0e8",
        ember: "#d95f39",
        moss: "#4f6f52"
      }
    }
  },
  plugins: []
};
