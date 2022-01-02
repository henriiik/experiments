module.exports = {
  content: ["./src/**/*.html", "./src/**/*.svelte"],
  theme: {
    extend: {},
    container: {
      padding: "2rem",
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
