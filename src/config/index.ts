export const ENV = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASS: process.env.DB_PASS || "postgres",
  DB_NAME: process.env.DB_NAME || "draruiz_db",
  DB_URL: process.env.DATABASE_URL, // Railway provides this
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "supersecret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
  // External APIs (for future use)
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  
  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
