/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // URJC institutional palette.
        urjc: {
          red: "#C00000",
          "red-dark": "#8A0000",
          "red-light": "#E64545",
        },
      },
      minHeight: {
        // Minimum touch target per RNF-09 (≥ 44px).
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
