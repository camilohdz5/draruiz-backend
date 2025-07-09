import "reflect-metadata";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ENV } from "./config";
import { PrismaClient } from "./generated/prisma";
import authRoutes from "./routes/auth.routes";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

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
    // Prisma Client is ready to use
    const PORT = ENV.PORT;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port: ${PORT}`);
      console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received, starting graceful shutdown...`);
      await prisma.$disconnect();
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
