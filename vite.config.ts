import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  clearScreen: false,
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
  },
  plugins: [tailwindcss(), sveltekit()],
  optimizeDeps: {
    include: [
      "axios",
      "idb",
      "clsx",
      "tailwind-merge",
      "tailwind-variants",
      "lucide-svelte",
      "bits-ui",
      "@internationalized/date",
    ],
  },
});