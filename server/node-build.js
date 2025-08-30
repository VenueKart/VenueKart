
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

  app.use("/assets", (req, res, next) => {
    res.header("Cache-Control", "public, max-age=31536000, immutable");
    next();
  });

  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

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
