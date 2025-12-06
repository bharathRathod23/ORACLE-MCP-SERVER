#!/bin/bash

# MCP Server Status Check Script

echo "=========================================="
echo "MCP Server Status Check"
echo "=========================================="
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Build folder 'dist' not found"
    echo "   Run: npm run build"
    exit 1
fi

# Check if dist/index.js exists
if [ ! -f "dist/index.js" ]; then
    echo "❌ Server file 'dist/index.js' not found"
    echo "   Run: npm run build"
    exit 1
fi

echo "✅ Server files found"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Database connection may fail"
    echo ""
else
    echo "✅ Configuration file (.env) found"
    echo ""
fi

# Test if server responds to MCP protocol
echo "Testing MCP server response..."
echo ""

# Create a test message
TEST_MSG='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# Send test message and capture response
# MCP servers output JSON to stdout, status messages to stderr
RESPONSE=$(echo "$TEST_MSG" | node dist/index.js 2>/dev/null | grep -E "^\{" | head -1)

if [ -z "$RESPONSE" ]; then
    echo "❌ Server did not respond (may be waiting for input)"
    echo ""
    echo "Note: MCP servers run via stdio and are typically started by MCP clients."
    echo "They don't run as background processes."
    exit 1
fi

# Check if response contains expected MCP fields
if echo "$RESPONSE" | grep -q "oracle-mcp-server"; then
    echo "✅ MCP Server is responding correctly!"
    echo ""
    echo "Server Info:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | grep -E "(name|version|protocolVersion)" | sed 's/^/   /' || echo "$RESPONSE" | head -1
    echo ""
    echo "Status: READY"
    echo ""
    echo "The server is ready to accept MCP protocol messages."
    echo ""
    echo "To use with an MCP client, configure it to run:"
    echo "  Command: node"
    echo "  Args: [\"$(pwd)/dist/index.js\"]"
else
    echo "⚠️  Server responded but with unexpected format:"
    echo "$RESPONSE" | head -3
    echo ""
    echo "This might indicate an error. Check the response above."
fi

echo ""
echo "Useful Commands:"
echo "  Test server:     echo '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\",\"params\":{\"protocolVersion\":\"2024-11-05\",\"capabilities\":{},\"clientInfo\":{\"name\":\"test\",\"version\":\"1.0\"}}}' | node dist/index.js"
echo "  Start server:    npm start"
echo "  Build server:    npm run build"
echo "  Check Oracle DB: ./check-oracle-status.sh"
echo ""

