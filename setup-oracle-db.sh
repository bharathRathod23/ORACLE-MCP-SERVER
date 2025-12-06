#!/bin/bash

# Oracle Database Setup Script for macOS
# This script helps set up Oracle Database Express Edition (XE) using Docker

set -e

echo "=========================================="
echo "Oracle Database Setup for macOS"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo ""
    echo "Please install Docker Desktop for macOS:"
    echo "1. Visit: https://www.docker.com/products/docker-desktop/"
    echo "2. Download and install Docker Desktop"
    echo "3. Start Docker Desktop"
    echo "4. Run this script again"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running."
    echo "Please start Docker Desktop and run this script again."
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check if Oracle container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^oracle-xe$"; then
    echo "⚠️  Oracle Database container 'oracle-xe' already exists"
    read -p "Do you want to remove it and create a new one? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stopping and removing existing container..."
        docker stop oracle-xe 2>/dev/null || true
        docker rm oracle-xe 2>/dev/null || true
    else
        echo "Starting existing container..."
        docker start oracle-xe
        echo ""
        echo "✅ Oracle Database is running!"
        echo ""
        echo "Connection details:"
        echo "  Host: localhost"
        echo "  Port: 1521"
        echo "  Service Name: XEPDB1"
        echo "  Username: system"
        echo "  Password: Oracle18"
        echo ""
        echo "To connect: sqlplus system/Oracle18@localhost:1521/XEPDB1"
        exit 0
    fi
fi

echo "Pulling Oracle Database Express Edition image..."
echo "Using community-maintained image (no Oracle login required)..."
echo "This may take several minutes depending on your internet connection..."
echo ""

# Pull Oracle XE image from Docker Hub (community-maintained, no login required)
docker pull gvenzl/oracle-xe:21-slim

echo ""
echo "Creating and starting Oracle Database container..."
echo ""

# Create and start Oracle XE container
docker run -d \
  --name oracle-xe \
  -p 1521:1521 \
  -e ORACLE_PASSWORD=Oracle18 \
  -e ORACLE_DATABASE=XE \
  gvenzl/oracle-xe:21-slim

echo ""
echo "⏳ Waiting for Oracle Database to start..."
echo "This may take 1-2 minutes..."

# Wait for database to be ready
max_attempts=120
attempt=0
echo "This may take 2-3 minutes for the database to fully initialize..."
while [ $attempt -lt $max_attempts ]; do
    # Check if database is ready by checking logs or trying to connect
    if docker exec oracle-xe /bin/bash -c "sqlplus -s system/Oracle18@XEPDB1 <<< 'SELECT 1 FROM DUAL;' > /dev/null 2>&1" 2>/dev/null; then
        echo ""
        echo "✅ Oracle Database is ready!"
        break
    fi
    attempt=$((attempt + 1))
    if [ $((attempt % 10)) -eq 0 ]; then
        echo -n " [${attempt}s]"
    else
        echo -n "."
    fi
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo ""
    echo "❌ Oracle Database failed to start within expected time"
    echo "Check logs with: docker logs oracle-xe"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Oracle Database Setup Complete!"
echo "=========================================="
echo ""
echo "Connection Details:"
echo "  Host: localhost"
echo "  Port: 1521"
echo "  Service Name: XEPDB1 (Pluggable Database)"
echo "  Username: system"
echo "  Password: Oracle18"
echo ""
echo "Note: This image uses XEPDB1 as the default pluggable database"
echo ""
echo "Useful Commands:"
echo "  Stop database:  docker stop oracle-xe"
echo "  Start database: docker start oracle-xe"
echo "  View logs:      docker logs oracle-xe"
echo "  Remove:         docker stop oracle-xe && docker rm oracle-xe"
echo ""
echo "Next Steps:"
echo "1. Update your .env file with these connection details"
echo "2. Install Oracle Instant Client (see README.md)"
echo "3. Run: npm install && npm run build && npm start"
echo ""

