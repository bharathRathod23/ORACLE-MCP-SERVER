# Oracle MCP Server

A Model Context Protocol (MCP) server that connects to an Oracle Database, allowing LLM models to interact with the database and retrieve data.

## Features

- Execute SQL queries against Oracle Database
- Describe table schemas
- List available tables
- Secure connection management
- Configurable database connection

## Prerequisites

- Node.js 18+ 
- Docker Desktop (for local Oracle Database setup)
- Oracle Instant Client or Oracle Database Client installed
- Access to an Oracle Database

## Setting Up Local Oracle Database

### Quick Setup (Recommended)

We provide a setup script to quickly install Oracle Database Express Edition using Docker:

1. **Install Docker Desktop** (if not already installed):
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop

2. **Run the setup script**:
   ```bash
   chmod +x setup-oracle-db.sh
   ./setup-oracle-db.sh
   ```

   This script will:
   - Check for Docker installation
   - Pull Oracle Database Express Edition image
   - Create and start a container named `oracle-xe`
   - Wait for the database to be ready

3. **Default Connection Details** (after setup):
   - Host: `localhost`
   - Port: `1521`
   - Service Name: `XEPDB1`
   - Username: `system`
   - Password: `Oracle18`

4. **Update your `.env` file**:
   ```env
   ORACLE_USER=system
   ORACLE_PASSWORD=Oracle18
   ORACLE_HOST=localhost
   ORACLE_PORT=1521
   ORACLE_SERVICE_NAME=XEPDB1
   ```

### Manual Docker Setup

If you prefer to set up manually:

```bash
# Pull Oracle XE image (community-maintained, no login required)
docker pull gvenzl/oracle-xe:21-slim

# Create and start container
docker run -d \
  --name oracle-xe \
  -p 1521:1521 \
  -e ORACLE_PASSWORD=Oracle18 \
  -e ORACLE_DATABASE=XE \
  gvenzl/oracle-xe:21-slim
```

**Note:** This uses a community-maintained image that doesn't require Oracle login or license acceptance.

### Docker Commands

```bash
# Start database
docker start oracle-xe

# Stop database
docker stop oracle-xe

# View logs
docker logs oracle-xe

# Remove container (stops and deletes)
docker stop oracle-xe && docker rm oracle-xe
```

### Installing Oracle Client

**macOS:**
```bash
# Using Homebrew
brew install instantclient-basic instantclient-sdk

# Or download from Oracle website
# https://www.oracle.com/database/technologies/instant-client/downloads.html
```

**Linux:**
```bash
# Download Oracle Instant Client from Oracle website
# Extract and set LD_LIBRARY_PATH
export LD_LIBRARY_PATH=/path/to/instantclient_21_1:$LD_LIBRARY_PATH
```

**Windows:**
- Download Oracle Instant Client from Oracle website
- Extract to a directory and add to PATH

## Installation

1. Clone or create the project directory
2. Install dependencies:
```bash
npm install
```

3. Configure database connection by copying `.env.example` to `.env`:
```bash
cp .env.example .env
```

4. Edit `.env` with your Oracle database credentials:
```env
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XEPDB1
```

## Building

```bash
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### Connecting from an MCP Client

The server communicates via stdio. Configure your MCP client (like Claude Desktop) to use this server:

**Claude Desktop Configuration** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "node",
      "args": ["/absolute/path/to/ORACLE-MCP-SERVER/dist/index.js"]
    }
  }
}
```

## Available Tools

### 1. `execute_query`
Execute a SQL query against the Oracle database.

**Parameters:**
- `query` (required): SQL query string
- `limit` (optional): Maximum rows to return (default: 100)

**Example:**
```json
{
  "name": "execute_query",
  "arguments": {
    "query": "SELECT * FROM employees WHERE department = 'IT'",
    "limit": 50
  }
}
```

### 2. `describe_table`
Get the schema/structure of a database table.

**Parameters:**
- `tableName` (required): Name of the table
- `schema` (optional): Schema name (defaults to current user)

**Example:**
```json
{
  "name": "describe_table",
  "arguments": {
    "tableName": "employees",
    "schema": "HR"
  }
}
```

### 3. `list_tables`
List all tables in the database or a specific schema.

**Parameters:**
- `schema` (optional): Schema name to filter tables

**Example:**
```json
{
  "name": "list_tables",
  "arguments": {
    "schema": "HR"
  }
}
```

## Security Considerations

1. **Database User Permissions**: Use a database user with minimal required permissions (preferably read-only for queries)
2. **Environment Variables**: Never commit `.env` file to version control
3. **Query Limits**: The server automatically limits query results to prevent excessive data retrieval
4. **Production Use**: Consider using a read-only replica or dedicated database for LLM access

## Troubleshooting

### Connection Issues

- Verify Oracle Client is installed and accessible
- Check database credentials in `.env`
- Ensure database is accessible from your network
- Check firewall settings

### Module Not Found Errors

- Run `npm install` to install dependencies
- Ensure you've built the project with `npm run build`

## License

MIT

