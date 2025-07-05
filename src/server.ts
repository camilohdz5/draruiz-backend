import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ENV } from "./config";
import { initializeDatabase } from "./config/data-source";
import authRoutes from "./routes/auth.routes";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ENV.CORS_ORIGIN,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "🎯 Dr. Ruiz Backend API",
    version: "1.0.0",
    environment: ENV.NODE_ENV,
    endpoints: {
      health: "/health",
      auth: "/api/auth",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Global error handler:", error);
  
  res.status(error.status || 500).json({
    error: ENV.NODE_ENV === "production" ? "Internal server error" : error.message,
    ...(ENV.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start HTTP server
    const PORT = ENV.PORT;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port: ${PORT}`);
      console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
