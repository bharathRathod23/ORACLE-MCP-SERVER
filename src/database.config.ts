import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
// Try project root first (where .env should be), then fallback to current directory
const projectRoot = join(__dirname, "..");
dotenv.config({ path: join(projectRoot, ".env") });
// Also try current directory as fallback
dotenv.config();

export interface DatabaseConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  serviceName: string;
}

export function getDatabaseConfig(): DatabaseConfig {
  const user = process.env.ORACLE_USER || process.env.DB_USER || "";
  const password = process.env.ORACLE_PASSWORD || process.env.DB_PASSWORD || "";
  const host = process.env.ORACLE_HOST || process.env.DB_HOST || "localhost";
  const port = parseInt(
    process.env.ORACLE_PORT || process.env.DB_PORT || "1521",
    10
  );
  const serviceName =
    process.env.ORACLE_SERVICE_NAME ||
    process.env.DB_SERVICE_NAME ||
    process.env.ORACLE_SID ||
    "";

  if (!user || !password) {
    throw new Error(
      "Database credentials not configured. Please set ORACLE_USER and ORACLE_PASSWORD environment variables."
    );
  }

  if (!serviceName) {
    throw new Error(
      "Database service name not configured. Please set ORACLE_SERVICE_NAME or ORACLE_SID environment variable."
    );
  }

  return {
    user,
    password,
    host,
    port,
    serviceName,
  };
}

