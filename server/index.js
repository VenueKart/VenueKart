import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import { handleDemo } from "./routes/demo.js";
import authRoutes from "./routes/auth.js";
import venuesRoutes from "./routes/venues.js";
import bookingsRoutes from "./routes/bookings.js";
import uploadRoutes from "./routes/upload.js";
import favoritesRoutes from "./routes/favorites.js";
import paymentsRoutes from "./routes/payments.js";
import { initializeDatabase } from "./config/database.js";

dotenv.config();

export function createServer() {
  const app = express();

  // Initialize database
  initializeDatabase();

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session middleware
  app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);
  app.use("/api/auth", authRoutes);
  app.use("/api/venues", venuesRoutes);
  app.use("/api/bookings", bookingsRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/favorites", favoritesRoutes);
  app.use("/api/payments", paymentsRoutes);

  return app;
}
