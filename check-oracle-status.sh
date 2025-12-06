#!/bin/bash

# Quick Oracle Database Status Check Script

echo "=========================================="
echo "Oracle Database Status Check"
echo "=========================================="
echo ""

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^oracle-xe$"; then
    echo "❌ Oracle container 'oracle-xe' does not exist"
    echo "Run: ./setup-oracle-db.sh to create it"
    exit 1
fi

# Check container status
CONTAINER_STATUS=$(docker ps --filter name=oracle-xe --format "{{.Status}}" 2>/dev/null)

if [ -z "$CONTAINER_STATUS" ]; then
    echo "❌ Oracle container is STOPPED"
    echo ""
    echo "To start it, run:"
    echo "  docker start oracle-xe"
    exit 1
else
    echo "✅ Oracle container is RUNNING"
    echo "   Status: $CONTAINER_STATUS"
    echo ""
    
    # Show port mapping
    echo "Port Mapping:"
    docker ps --filter name=oracle-xe --format "   {{.Ports}}" | sed 's/,/\n   /g'
    echo ""
    
    # Try to connect to database
    echo "Testing database connection..."
    if docker exec oracle-xe /bin/bash -c "sqlplus -s system/Oracle18@XEPDB1 <<< 'SELECT 1 FROM DUAL;' > /dev/null 2>&1" 2>/dev/null; then
        echo "✅ Database is READY and accepting connections"
        echo ""
        echo "Connection Details:"
        echo "  Host: localhost"
        echo "  Port: 1521"
        echo "  Service: XEPDB1"
        echo "  Username: system"
        echo "  Password: Oracle18"
    else
        echo "⏳ Database is starting up (may take a few more seconds)"
        echo "   Check logs with: docker logs oracle-xe"
    fi
fi

echo ""
echo "Useful Commands:"
echo "  View logs:      docker logs oracle-xe"
echo "  Follow logs:   docker logs -f oracle-xe"
echo "  Stop:          docker stop oracle-xe"
echo "  Start:         docker start oracle-xe"
echo "  Restart:       docker restart oracle-xe"
echo ""

