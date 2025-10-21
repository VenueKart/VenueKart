import express from "express";
import { createServer } from "./index.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function serveStatic(app) {
  const staticDir = join(__dirname, "../spa");
  const indexPath = join(staticDir, "index.html");

  let indexTemplate;
  try {
    indexTemplate = readFileSync(indexPath, "utf-8");
  } catch (err) {
    console.warn("Could not read index.html, SPA mode disabled");
    return;
  }

  // Cache immutable build assets aggressively
  app.use(
    "/assets",
    express.static(join(staticDir, "assets"), {
      immutable: true,
      maxAge: "31536000s",
    })
  );

  // Serve other static files with moderate caching (favicon, manifest, etc.)
  app.use(
    express.static(staticDir, {
      maxAge: "3600s",
    })
  );

  // SPA fallback for non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    if (req.method !== "GET") return next();

    if (req.path === "/" || !req.path.includes(".")) {
      res.header("Content-Type", "text/html");
      res.send(indexTemplate);
    } else {
      next();
    }
  });
}

const app = createServer();
serveStatic(app);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
