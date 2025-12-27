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
  build:
    mode === "widget"
      ? {
        lib: {
          entry: "./src/main.ce.js",
          name: "TableBookingWidget",
          fileName: "table-booking-widget",
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