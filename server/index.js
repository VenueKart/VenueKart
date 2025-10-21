import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleDemo } from "./routes/demo.js";
import authRoutes from "./routes/auth.js";
import venuesRoutes from "./routes/venues.js";
import bookingsRoutes from "./routes/bookings.js";
import uploadRoutes from "./routes/upload.js";
import favoritesRoutes from "./routes/favorites.js";
import paymentsRoutes from "./routes/payments.js";
import { initializeDatabase } from "./config/database.js";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env"), override: true });

export function createServer() {
  const app = express();

  // Initialize database
  initializeDatabase();

  // Trust reverse proxy (ALB/Nginx) for secure cookies and correct IPs
  app.set("trust proxy", 1);

  // Middleware
  const envOrigins = [process.env.CORS_ALLOWED_ORIGINS, process.env.FRONTEND_URL, process.env.CLIENT_URL]
    .filter(Boolean)
    .flatMap(v => v.split(',').map(s => s.trim()).filter(Boolean));

  const devDefaults = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

  const allowedOrigins = new Set(envOrigins.length ? envOrigins : devDefaults);

  const isProd = process.env.NODE_ENV === 'production';
  app.use(cors({
    "origin": "*",
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Note: Session and Passport were removed as authentication uses stateless JWTs in routes/auth.js.

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server VenueKart" });
  });

  app.get("/api/demo", handleDemo);
  app.use("/api/auth", authRoutes);
  app.use("/api/venues", venuesRoutes);
  app.use("/api/bookings", bookingsRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/favorites", favoritesRoutes);
  app.use("/api/payments", paymentsRoutes);

  // Handle unknown API routes
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Centralized error handler (non-crashing)
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('API Error:', err && err.stack ? err.stack : err);
    const status = err?.status || err?.statusCode || 500;
    const message = (typeof err === 'string' ? err : err?.message) || 'Internal server error';
    res.status(status).json({ error: message });
  });

  return app;
}
