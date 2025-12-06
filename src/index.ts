#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as dotenv from "dotenv";
import { getDatabaseConfig } from "./database.config.js";

// Use createRequire to load CommonJS module in ES module context
const require = createRequire(import.meta.url);
const oracledb = require("oracledb");

// Import types for TypeScript
import type { Connection } from "oracledb";

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
// Try project root first (where .env should be), then fallback to current directory
const projectRoot = join(__dirname, "..");
dotenv.config({ path: join(projectRoot, ".env") });
// Also try current directory as fallback
dotenv.config();

// Initialize Oracle DB (with error handling)
try {
  // Check if initOracleClient function exists
  if (typeof oracledb.initOracleClient === 'function') {
    // Try to initialize with Homebrew installation path first
    try {
      oracledb.initOracleClient({ libDir: "/opt/homebrew/lib" });
    } catch {
      // If that fails, try default initialization
      try {
        oracledb.initOracleClient();
      } catch (initError) {
        // Silently continue - client might be auto-detected
      }
    }
  }
} catch (error) {
  // If initOracleClient fails, try to continue anyway
  // The client might be in system PATH or configured differently
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (!errorMessage.includes("Cannot locate") && !errorMessage.includes("is not a function")) {
    console.error("[Oracle Client Init Error]", errorMessage);
  }
}

class OracleMCPServer {
  private server: Server;
  private connection: Connection | null = null;

  constructor() {
    this.server = new Server(
      {
        name: "oracle-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "execute_query",
            description:
              "Execute a SQL query against the Oracle database and return results",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The SQL query to execute",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of rows to return (default: 100)",
                  default: 100,
                },
              },
              required: ["query"],
            },
          },
          {
            name: "describe_table",
            description:
              "Get the schema/structure of a database table",
            inputSchema: {
              type: "object",
              properties: {
                tableName: {
                  type: "string",
                  description: "Name of the table to describe",
                },
                schema: {
                  type: "string",
                  description: "Schema name (optional, defaults to current user)",
                },
              },
              required: ["tableName"],
            },
          },
          {
            name: "list_tables",
            description:
              "List all tables in the database or a specific schema",
            inputSchema: {
              type: "object",
              properties: {
                schema: {
                  type: "string",
                  description: "Schema name (optional)",
                },
              },
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        await this.ensureConnection();

        if (!args) {
          throw new Error("Arguments are required");
        }

        switch (name) {
          case "execute_query":
            return await this.executeQuery(
              args.query as string,
              (args.limit as number) || 100
            );

          case "describe_table":
            return await this.describeTable(
              args.tableName as string,
              args.schema as string | undefined
            );

          case "list_tables":
            return await this.listTables(args.schema as string | undefined);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      async () => {
        return {
          resources: [
            {
              uri: "oracle://connection",
              name: "Database Connection Info",
              description: "Information about the current database connection",
              mimeType: "application/json",
            },
          ],
        };
      }
    );

    // Handle resource reads
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const { uri } = request.params;

        if (uri === "oracle://connection") {
          try {
            await this.ensureConnection();
            const config = getDatabaseConfig();
            return {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify(
                    {
                      connected: true,
                      host: config.host,
                      port: config.port,
                      serviceName: config.serviceName,
                      user: config.user,
                      // Don't expose password
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          } catch (error) {
            return {
              contents: [
                {
                  uri,
                  mimeType: "text/plain",
                  text: `Connection error: ${error}`,
                },
              ],
            };
          }
        }

        throw new Error(`Unknown resource: ${uri}`);
      }
    );
  }

  private async ensureConnection() {
    if (!this.connection) {
      const config = getDatabaseConfig();
      this.connection = await oracledb.getConnection({
        user: config.user,
        password: config.password,
        connectionString: `${config.host}:${config.port}/${config.serviceName}`,
      });
    }
    return this.connection;
  }

  private async executeQuery(query: string, limit: number) {
    const connection = await this.ensureConnection();
    if (!connection) {
      throw new Error("Failed to establish database connection");
    }

    // Add safety limit if not present
    const safeQuery = query.trim().toUpperCase();
    if (
      !safeQuery.includes("LIMIT") &&
      !safeQuery.includes("ROWNUM") &&
      !safeQuery.includes("FETCH")
    ) {
      // For SELECT queries, add FETCH FIRST N ROWS ONLY
      if (safeQuery.startsWith("SELECT")) {
        query = `${query.trim()} FETCH FIRST ${limit} ROWS ONLY`;
      }
    }

    const result = await connection.execute(query, {}, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      maxRows: limit,
    });

    const rows = result.rows || [];
    const columns = result.metaData || [];

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              columns: columns.map((col: any) => col.name),
              rows: rows,
              rowCount: rows.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async describeTable(
    tableName: string,
    schema?: string
  ) {
    const connection = await this.ensureConnection();
    if (!connection) {
      throw new Error("Failed to establish database connection");
    }

    const query = `
      SELECT 
        column_name,
        data_type,
        data_length,
        data_precision,
        data_scale,
        nullable,
        data_default
      FROM all_tab_columns
      WHERE table_name = UPPER(:tableName)
      ${schema ? "AND owner = UPPER(:schema)" : ""}
      ORDER BY column_id
    `;

    const binds = schema
      ? { tableName, schema }
      : { tableName };

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              table: schema ? `${schema}.${tableName}` : tableName,
              columns: result.rows || [],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async listTables(schema?: string) {
    const connection = await this.ensureConnection();
    if (!connection) {
      throw new Error("Failed to establish database connection");
    }

    const query = schema
      ? `
        SELECT table_name, owner
        FROM all_tables
        WHERE owner = UPPER(:schema)
        ORDER BY table_name
      `
      : `
        SELECT table_name, owner
        FROM all_tables
        WHERE owner = USER
        ORDER BY table_name
      `;

    const binds = schema ? { schema } : {};

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              tables: result.rows || [],
              count: (result.rows || []).length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.close();
      process.exit(0);
    });
  }

  async close() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Oracle MCP Server running on stdio");
  }
}

// Start the server
const server = new OracleMCPServer();
server.run().catch(console.error);

