import type { Config } from "tailwindcss";

const color = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: color("ink"),
        canvas: color("canvas"),
        surface: color("surface"),
        line: color("line"),
        muted: color("muted"),
        brand: {
          50: color("brand-light"),
          100: color("brand-border"),
          600: color("brand"),
          700: color("brand-hover")
        }
      },
      boxShadow: { card: "0 1px 2px rgb(36 30 26 / .05)", raised: "0 12px 32px rgb(36 30 26 / .12)" }
    }
  },
  plugins: []
} satisfies Config;
