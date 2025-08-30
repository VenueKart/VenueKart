import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./client"),
      "@shared": path.resolve(process.cwd(), "./shared"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      clientPort: 8080,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
