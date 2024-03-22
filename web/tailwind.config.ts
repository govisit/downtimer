import { type Config } from "tailwindcss";
import tailwindCssForms from "@tailwindcss/forms";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  plugins: [tailwindCssForms],
} satisfies Config;
