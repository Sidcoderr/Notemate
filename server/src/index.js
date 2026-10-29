import { validateEnv } from "./lib/env.js";

// 1. Validate environment variables at startup
validateEnv();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRouter from "./routes/health.js";
import notesRouter from "./routes/notes.js";

const app = express();
const port = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

// CORS configuration (supports comma-separated list, strips trailing slashes)
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API Routes
app.use("/api", healthRouter);
app.use("/api/notes", notesRouter);

// 404 handler for unrecognized routes
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central Error Handler
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  const statusCode = err.status || err.statusCode || (err.message?.includes("CORS") ? 403 : 500);

  if (!isProd) {
    console.error(`[Error] ${req.method} ${req.url}:`, err);
  }

  const response = {
    error: err.message || "Internal Server Error",
  };

  if (!isProd) {
    response.stack = err.stack;
    if (err.details) response.details = err.details;
  }

  res.status(statusCode).json(response);
});

app.listen(port, () => {
  console.log(`NoteMate Server listening on port ${port} in ${process.env.NODE_ENV || "development"} mode`);
});
