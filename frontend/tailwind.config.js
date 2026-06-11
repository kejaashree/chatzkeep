/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0faf7",
          100: "#dcf3ec",
          200: "#bce7d9",
          300: "#8dd4bf",
          400: "#57b99f",
          500: "#2d9e83",
          600: "#1e8068",
          700: "#196757",
          800: "#175246",
          900: "#15443b",
          DEFAULT: "#2A8F6F",
        },
        teal: {
          DEFAULT: "#2A8F6F",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
