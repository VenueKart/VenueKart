import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), './.env'), override: true });

const apiPort = process.env.API_PORT || "5001";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(process.cwd(), "."),
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "."),
      "@shared": path.resolve(process.cwd(), "./shared"),
    },
  },
  build: {
    outDir: "dist/spa",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
});
