import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#211711",
        cream: "#fffaf1",
        saffron: { 50: "#fff7e7", 100: "#ffedbf", 500: "#f97316", 600: "#e85d04", 700: "#bf4300" },
        leaf: "#24705b"
      },
      boxShadow: { warm: "0 18px 55px rgba(107, 53, 12, .12)" },
      borderRadius: { "4xl": "2rem" }
    }
  },
  plugins: []
};

export default config;
