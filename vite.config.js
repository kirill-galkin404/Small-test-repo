import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps asset URLs relative so the built app works from any path.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
