# Oracle Database Setup Guide

## Step 1: Install Docker Desktop

Since Docker is not currently installed, you need to install Docker Desktop first:

### Option A: Using Homebrew (Recommended)
```bash
brew install --cask docker
```

After installation, open Docker Desktop from Applications.

### Option B: Manual Download
1. Visit: https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Mac (Apple Silicon or Intel)
3. Open the downloaded `.dmg` file
4. Drag Docker to Applications folder
5. Open Docker Desktop from Applications
6. Complete the initial setup wizard

### Verify Docker Installation
```bash
docker --version
docker info
```

## Step 2: Run the Setup Script

**No Oracle login required!** The setup script uses a community-maintained Oracle XE image from Docker Hub.

Once Docker is running:

```bash
./setup-oracle-db.sh
```

The script will:
- Pull Oracle Database Express Edition
- Create a container named `oracle-xe`
- Start the database
- Wait for it to be ready

## Step 3: Configure Environment Variables

After the database is running, create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with these values:
```env
ORACLE_USER=system
ORACLE_PASSWORD=Oracle18
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XEPDB1
```

**Note:** The `.env` file has already been created with these values if you ran the setup script.

## Step 4: Install Oracle Instant Client

The Node.js `oracledb` package requires Oracle Instant Client:

```bash
brew install instantclient-basic instantclient-sdk
```

## Step 5: Test the Connection

You can test the connection using SQL*Plus (if installed) or wait until the MCP server is running.

## Troubleshooting

### Docker Issues
- Make sure Docker Desktop is running (check the menu bar)
- Restart Docker Desktop if containers won't start
- Check Docker Desktop settings for resource allocation

### Oracle Container Issues
- Check logs: `docker logs oracle-xe`
- Wait 2-3 minutes after container starts for database to fully initialize
- If using Apple Silicon (M1/M2), the image runs via emulation which may be slower

### Connection Issues
- Wait 1-2 minutes after container starts for database to initialize
- Verify port 1521 is not in use: `lsof -i :1521`
- Check container status: `docker ps -a`

