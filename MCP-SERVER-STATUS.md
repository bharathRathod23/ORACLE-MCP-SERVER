# MCP Server Status Check Guide

## Quick Status Check

Run the status check script:
```bash
./check-mcp-server.sh
```

This will verify:
- ✅ Server files are built
- ✅ Configuration file exists
- ✅ Server responds to MCP protocol messages
- ✅ Server version and capabilities

## Manual Status Checks

### 1. Check if Server Files Exist
```bash
ls -la dist/index.js
```

### 2. Test Server Response
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/index.js
```

Expected output should include:
- `"name": "oracle-mcp-server"`
- `"version": "1.0.0"`
- `"protocolVersion": "2024-11-05"`

### 3. Test Database Query
```bash
cat > test-query.json << 'EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"execute_query","arguments":{"query":"SELECT COUNT(*) as total FROM employees","limit":10}}}
EOF

cat test-query.json | node dist/index.js 2>/dev/null | grep -E "(result|error)"
```

### 4. Check Process Status
**Note:** MCP servers don't run as background processes. They communicate via stdio and are started by MCP clients when needed.

To check if a client has started the server:
```bash
ps aux | grep "[n]ode dist/index.js"
```

## Common Issues

### Issue: "dist/index.js not found"
**Solution:**
```bash
npm run build
```

### Issue: "Database credentials not configured"
**Solution:**
- Check if `.env` file exists: `ls -la .env`
- Verify Oracle database is running: `./check-oracle-status.sh`

### Issue: "Oracle Client library not found"
**Solution:**
- Install Oracle Instant Client (ARM64 for Apple Silicon):
  ```bash
  brew install instantclienttap/instantclient/instantclient-arm64-basic
  ```

### Issue: Server doesn't respond
**Possible causes:**
1. Server not built: Run `npm run build`
2. Oracle database not running: Run `./check-oracle-status.sh`
3. Wrong .env configuration: Check `.env` file

## Integration with MCP Clients

### Claude Desktop Configuration

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "node",
      "args": ["/Users/captain/Documents/Codes/ORACLE-MCP-SERVER/dist/index.js"]
    }
  }
}
```

### Cursor IDE Configuration

The MCP server should be automatically detected if configured in Cursor's MCP settings.

## Server Information

- **Name:** oracle-mcp-server
- **Version:** 1.0.0
- **Protocol:** MCP (Model Context Protocol)
- **Communication:** stdio (standard input/output)
- **Database:** Oracle XE (via Docker)

## Available Tools

1. **execute_query** - Execute SQL queries
2. **describe_table** - Get table schemas
3. **list_tables** - List database tables

## Quick Commands Reference

```bash
# Check MCP server status
./check-mcp-server.sh

# Check Oracle database status
./check-oracle-status.sh

# Build the server
npm run build

# Test the server manually
npm start

# View server logs (if running via client)
# Logs are typically handled by the MCP client
```

