import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          50: "#f6f7f8",
          100: "#e9ecef",
          300: "#b4bcc6",
          500: "#65717f",
          700: "#303946",
          900: "#111821",
          950: "#090d13",
        },
        inema: {
          blue: "#112f63",
          violet: "#6f45d8",
          gold: "#d9b35b",
          teal: "#2f918b",
          mist: "#eef4f7",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(17, 24, 33, 0.11)",
        line: "0 0 0 1px rgba(17, 24, 33, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
