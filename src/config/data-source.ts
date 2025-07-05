import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENV } from "./index";

// Parse DATABASE_URL from Railway if available
const getDatabaseConfig = () => {
  if (ENV.DB_URL) {
    // Railway provides DATABASE_URL in format: postgresql://user:password@host:port/database
    const url = new URL(ENV.DB_URL);
    return {
      type: "postgres" as const,
      host: url.hostname,
      port: Number(url.port),
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
    };
  }
  
  return {
    type: "postgres" as const,
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    username: ENV.DB_USER,
    password: ENV.DB_PASS,
    database: ENV.DB_NAME,
  };
};

export const AppDataSource = new DataSource({
  ...getDatabaseConfig(),
  synchronize: ENV.NODE_ENV === "development", // Only in development
  logging: ENV.NODE_ENV === "development",
  entities: [__dirname + "/../models/*.{ts,js}"],
  migrations: [__dirname + "/../migrations/*.{ts,js}"],
  subscribers: [],
  ssl: ENV.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  extra: {
    connectionLimit: 10,
  },
});

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};
