import express from "express";
import cors from "cors";
import "dotenv/config";

import {
  testDatabaseConnection,
} from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

const app = express();

/* =========================================
   CORS
========================================= */

const defaultCorsOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://jobs-one-blond.vercel.app",
  "https://jobs-4jjl4dwf0-rb-group-ltd.vercel.app",
  "https://techjobsindia.netlify.app",
];

const configuredCorsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedCorsOrigins = new Set([
  ...defaultCorsOrigins,
  ...configuredCorsOrigins,
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedCorsOrigins.has(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS request blocked for origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);

/* =========================================
   BODY PARSER
========================================= */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* =========================================
   UPLOADS
========================================= */

app.use(
  "/uploads",
  express.static("uploads")
);

/* =========================================
   TEST ROUTE
========================================= */

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "JobFinder Backend API is running",
  });
});

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "JobFinder Backend API is healthy",
  });
});

/* =========================================
   API ROUTES
========================================= */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/companies",
  companyRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

/* =========================================
   404
========================================= */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================================
   SERVER
========================================= */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );

  await testDatabaseConnection();
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the existing Node process or set PORT to an available port.`
    );
    process.exit(1);
  }

  console.error("Backend server error:", error);
  process.exit(1);
});