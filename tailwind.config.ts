import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          "50": "#eff2fe",
          "100": "#e1e9fe",
          "200": "#c9d4fc",
          "300": "#a9b9f8",
          "400": "#8692f3",
          "500": "#696feb",
          "600": "#524dde",
          "700": "#4e47c6",
          "800": "#3a359e",
          "900": "#32327d",
          "950": "#1f1d49",
        },
        secondary: {
          "50": "#fff8eb",
          "100": "#fdebc8",
          "200": "#fcd58b",
          "300": "#fab440",
          "400": "#f9a026",
          "500": "#f37c0d",
          "600": "#d75a08",
          "700": "#b23b0b",
          "800": "#912e0f",
          "900": "#772610",
          "950": "#441104",
        },
        terciary: {
          "50": "#e6e8ec",
          "100": "#cdd0d9",
          "200": "#9ca1b2",
          "300": "#6a728c",
          "400": "#394365",
          "500": "#07143f",
          "600": "#061032",
          "700": "#040c26",
          "800": "#030819",
          "900": "#01040d",
          "950": "#000000",
        },
      },
    },
  },
  plugins: [],
};

export default config;
