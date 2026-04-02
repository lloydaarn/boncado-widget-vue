import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => ({
  plugins: [
    vue({
      customElement: mode === "widget",
    }),
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
  // In dev mode, Vite uses index.html which points to main.dev.js
  // No special config needed for dev
  build:
    mode === "widget"
      ? {
          lib: {
            entry: "./src/main.ce.js",
            name: "BoncadoWidget",
            fileName: "boncado-widget",
            formats: ["iife"],
          },
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
            },
          },
          cssCodeSplit: false,
        }
      : {},
}));