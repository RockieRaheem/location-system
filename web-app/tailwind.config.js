/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        uganda: {
          black: "#000000",
          yellow: "#FCDC04",
          red: "#D90000",
          yellowDark: "#E6C200",
          redDark: "#B00000",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
