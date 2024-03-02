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
          "50": "#ffffff",
          "100": "#fbfaff",
          "200": "#e4defd",
          "300": "#bab3f9",
          "400": "#8b84f6",
          "500": "#685ef3",
          "600": "#5446ec",
          "700": "#4337e1",
          "800": "#2d28c8",
          "900": "#2931a3",
          "950": "#151d65",
        },
        secondary: {
          "50": "#f0fdfb",
          "100": "#ccfbf5",
          "200": "#99f6ea",
          "300": "#5eead8",
          "400": "#2dd4bf",
          "500": "#14b8a3",
          "600": "#0d9483",
          "700": "#0f7669",
          "800": "#115e54",
          "900": "#134e47",
          "950": "#042f2a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
