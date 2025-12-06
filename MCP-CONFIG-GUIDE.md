# MCP Configuration Guide

This guide explains how to configure the Oracle MCP Server for use with MCP clients like Cursor IDE or Claude Desktop.

## Configuration File Location

### Cursor IDE
- **Location:** `~/.cursor/mcp.json` (macOS/Linux) or `%APPDATA%\Cursor\mcp.json` (Windows)
- The file should already exist. Edit it to add the Oracle MCP server configuration.

### Claude Desktop
- **Location:** 
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
  - Linux: `~/.config/Claude/claude_desktop_config.json`

## Configuration Structure

See `mcp.json.reference` for a complete example configuration file.

### Basic Configuration (without environment variables)

If you have a `.env` file in the project root, you can use this simpler configuration:

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

**Note:** Make sure to replace `/absolute/path/to/ORACLE-MCP-SERVER` with the actual absolute path to your project directory.

### Configuration with Environment Variables

If the `.env` file isn't being loaded (common when MCP server runs from a different working directory), you can specify environment variables directly in the configuration:

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "node",
      "args": ["/absolute/path/to/ORACLE-MCP-SERVER/dist/index.js"],
      "env": {
        "ORACLE_USER": "system",
        "ORACLE_PASSWORD": "Oracle18",
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "XEPDB1"
      }
    }
  }
}
```

## Configuration Fields

### `mcpServers`
Object containing all MCP server configurations. Each key is a unique server identifier.

### `command`
The command to execute the MCP server. For this project, use `"node"`.

### `args`
Array of arguments to pass to the command. Must include the absolute path to `dist/index.js`.

**Important:** Use an absolute path, not a relative path. For example:
- ✅ Correct: `"/Users/captain/Documents/Codes/ORACLE-MCP-SERVER/dist/index.js"`
- ❌ Incorrect: `"./dist/index.js"` or `"dist/index.js"`

### `env` (Optional)
Object containing environment variables. These will be available to the MCP server process.

**Available Environment Variables:**
- `ORACLE_USER` - Database username (required)
- `ORACLE_PASSWORD` - Database password (required)
- `ORACLE_HOST` - Database host (default: "localhost")
- `ORACLE_PORT` - Database port (default: "1521")
- `ORACLE_SERVICE_NAME` - Database service name or SID (required)

**Alternative variable names** (also supported):
- `DB_USER` instead of `ORACLE_USER`
- `DB_PASSWORD` instead of `ORACLE_PASSWORD`
- `DB_HOST` instead of `ORACLE_HOST`
- `DB_PORT` instead of `ORACLE_PORT`
- `DB_SERVICE_NAME` instead of `ORACLE_SERVICE_NAME`
- `ORACLE_SID` instead of `ORACLE_SERVICE_NAME`

## Setup Steps

1. **Build the MCP server:**
   ```bash
   npm run build
   ```

2. **Get the absolute path to your project:**
   ```bash
   pwd
   # Example output: /Users/captain/Documents/Codes/ORACLE-MCP-SERVER
   ```

3. **Edit the MCP configuration file:**
   - Open the appropriate config file for your MCP client (see locations above)
   - Add or update the `oracle-db` server configuration
   - Replace the path in `args` with your absolute path
   - Add environment variables if needed

4. **Restart your MCP client:**
   - For Cursor: Restart Cursor IDE
   - For Claude Desktop: Restart Claude Desktop

## Verification

After configuration, you can verify the setup by:

1. **Check MCP server status:**
   ```bash
   ./check-mcp-server.sh
   ```

2. **Test database connection:**
   ```bash
   ./check-oracle-status.sh
   ```

3. **Try using MCP tools:**
   - In Cursor: Ask to list tables or execute a query
   - In Claude Desktop: Use the MCP tools through the interface

## Troubleshooting

### "Database credentials not configured"
- Ensure environment variables are set in the `env` section of `mcp.json`
- Or ensure `.env` file exists in the project root with correct credentials
- Verify the path to `dist/index.js` is absolute and correct

### "Cannot find module" or "dist/index.js not found"
- Run `npm run build` to build the server
- Verify the path in `args` is correct and absolute
- Check that `dist/index.js` exists

### Server not responding
- Restart your MCP client (Cursor/Claude Desktop)
- Check that the Oracle database is running: `docker ps | grep oracle`
- Verify the database connection details are correct

### Path issues
- Always use absolute paths in the `args` array
- On macOS/Linux, paths start with `/`
- On Windows, use forward slashes or escaped backslashes: `"C:\\path\\to\\project\\dist\\index.js"`

## Example: Complete Configuration

Here's a complete example for macOS:

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "node",
      "args": [
        "/Users/captain/Documents/Codes/ORACLE-MCP-SERVER/dist/index.js"
      ],
      "env": {
        "ORACLE_USER": "system",
        "ORACLE_PASSWORD": "Oracle18",
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "XEPDB1"
      }
    }
  }
}
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `mcp.json` with real credentials** to version control
2. **Use environment variables** or `.env` files for sensitive data
3. **Consider using a read-only database user** for MCP server access
4. **Restrict file permissions** on configuration files containing passwords:
   ```bash
   chmod 600 ~/.cursor/mcp.json
   ```

## Multiple MCP Servers

You can configure multiple MCP servers in the same file:

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "node",
      "args": ["/path/to/oracle-mcp/dist/index.js"],
      "env": { ... }
    },
    "another-server": {
      "command": "node",
      "args": ["/path/to/another/dist/index.js"]
    }
  }
}
```

