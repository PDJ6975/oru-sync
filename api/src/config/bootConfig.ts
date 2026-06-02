import dotenv from "dotenv";
import path from "node:path";

const envPath =
  process.env.ORU_BOOT_ENV_PATH ?? path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath, quiet: true });

export const bootEnv = {
  // Configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  ORU_LOG_LEVEL: process.env.ORU_LOG_LEVEL || "info",

  // Database
  DATABASE_URL: process.env.DATABASE_URL,
};
