

import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    ssr: true,
    outDir: "dist/server",
    rollupOptions: {
      input: "server/node-build.js",
      output: {
        entryFileNames: "node-build.mjs",
      },
    },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(process.cwd(), "./shared"),
    },
  },
  ssr: {
    noExternal: ["express"],
  },
});
