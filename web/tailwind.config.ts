// import defaultTheme from "tailwindcss/defaultTheme";
import { type Config } from "tailwindcss";
// import tailwindCssForms from "@tailwindcss/forms";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "mono": ['"Geist Mono"'],
        // "mono": ['"Geist Mono"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  // plugins: [tailwindCssForms],
  darkMode: "selector",
} satisfies Config;
