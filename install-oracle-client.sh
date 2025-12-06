#!/bin/bash

# Oracle Instant Client Installation Script for macOS

set -e

echo "=========================================="
echo "Oracle Instant Client Installation"
echo "=========================================="
echo ""

# Check if already installed
if [ -d "/usr/local/lib" ] && ls /usr/local/lib/libclntsh.dylib* 2>/dev/null | grep -q .; then
    echo "✅ Oracle Instant Client appears to be installed"
    ls -lh /usr/local/lib/libclntsh.dylib* 2>/dev/null | head -3
    exit 0
fi

echo "Oracle Instant Client is required for the MCP server to connect to Oracle Database."
echo ""
echo "Installation Options:"
echo ""
echo "Option 1: Manual Download (Recommended)"
echo "  1. Visit: https://www.oracle.com/database/technologies/instant-client/macos-arm64-downloads.html"
echo "     (or https://www.oracle.com/database/technologies/instant-client/macos-intel-x86-downloads.html for Intel Macs)"
echo "  2. Download 'Basic Package' and 'SDK Package'"
echo "  3. Extract both ZIP files"
echo "  4. Create directory: sudo mkdir -p /usr/local/lib"
echo "  5. Copy libraries: sudo cp instantclient_*/libclntsh.dylib* /usr/local/lib/"
echo "  6. Create symlink: sudo ln -s /usr/local/lib/libclntsh.dylib.* /usr/local/lib/libclntsh.dylib"
echo ""
echo "Option 2: Using Homebrew Tap (if available)"
echo "  brew tap InstantClientTap/instantclient"
echo "  brew install instantclient-basic"
echo ""
echo "After installation, verify with:"
echo "  ls -lh /usr/local/lib/libclntsh.dylib*"
echo ""
echo "Then restart the MCP server."
echo ""

