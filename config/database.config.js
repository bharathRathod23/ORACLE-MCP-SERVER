import * as dotenv from "dotenv";
dotenv.config();
export function getDatabaseConfig() {
    const user = process.env.ORACLE_USER || process.env.DB_USER || "";
    const password = process.env.ORACLE_PASSWORD || process.env.DB_PASSWORD || "";
    const host = process.env.ORACLE_HOST || process.env.DB_HOST || "localhost";
    const port = parseInt(process.env.ORACLE_PORT || process.env.DB_PORT || "1521", 10);
    const serviceName = process.env.ORACLE_SERVICE_NAME ||
        process.env.DB_SERVICE_NAME ||
        process.env.ORACLE_SID ||
        "";
    if (!user || !password) {
        throw new Error("Database credentials not configured. Please set ORACLE_USER and ORACLE_PASSWORD environment variables.");
    }
    if (!serviceName) {
        throw new Error("Database service name not configured. Please set ORACLE_SERVICE_NAME or ORACLE_SID environment variable.");
    }
    return {
        user,
        password,
        host,
        port,
        serviceName,
    };
}
//# sourceMappingURL=database.config.js.map