import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "subscription_db",
  synchronize: true,
  logging: false,
  entities: [__dirname + "/../models/*.{ts,js}"],
  migrations: [__dirname + "/../migrations/*.{ts,js}"],
  subscribers: [],
});
