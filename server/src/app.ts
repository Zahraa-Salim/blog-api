/**
 * Express app configuration.
 * Purpose: Register global middlewares, routes, 404 handler, and error handler.
 * Note: `app` is exported and used by server.ts.
 */

import express from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";

import authRoutes from "./routes/auth.routes";
import authorRoutes from "./routes/author.routes";
import postRoutes from "./routes/post.routes";
import userRoutes from "./routes/user.routes";

export const app = express();

/* -------------------- Global Middlewares -------------------- */

// Enable CORS (so Postman / frontend can access API)
app.use(cors());

// Logger for development
app.use(morgan("dev"));

// Parse incoming JSON
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* -------------------- Health Check Route -------------------- */

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

/* -------------------- API Routes -------------------- */

// Auth routes must stay public (no JWT required)
app.use("/api/auth", authRoutes);

// Dashboard routes (JWT required inside each router via router.use(protect))
app.use("/api/authors", authorRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

/* -------------------- 404 Handler -------------------- */

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* -------------------- Global Error Handler -------------------- */

app.use(errorHandler);
