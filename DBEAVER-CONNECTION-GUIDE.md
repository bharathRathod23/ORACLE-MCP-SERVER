# Connecting to Oracle Database with DBeaver

## Connection Details

Use these details to connect to your local Oracle database:

- **Host:** `localhost`
- **Port:** `1521`
- **Service Name:** `XEPDB1` (not SID)
- **Username:** `system`
- **Password:** `Oracle18`

## Step-by-Step Instructions

### 1. Install DBeaver (if not already installed)

**macOS:**
```bash
brew install --cask dbeaver-community
```

Or download from: https://dbeaver.io/download/

### 2. Open DBeaver and Create New Connection

1. Open DBeaver
2. Click **"New Database Connection"** button (plug icon) or go to **Database** → **New Database Connection**
3. In the connection type selection, search for **"Oracle"**
4. Select **"Oracle"** and click **Next**

### 3. Configure Connection Settings

Fill in the connection details:

**Main Tab:**
- **Host:** `localhost`
- **Port:** `1521`
- **Database/Schema:** Leave empty or use `XEPDB1`
- **Username:** `system`
- **Password:** `Oracle18`
- **Show all databases:** Check this box

**Oracle Tab (click on it):**
- **Service name:** `XEPDB1` ⚠️ **Important: Use Service Name, not SID**
- **Role:** `Default` (or `SYSDBA` if you need admin privileges)

**Driver Properties Tab (optional):**
- You can leave defaults, but if you have connection issues, you might want to set:
  - `oracle.net.CONNECT_TIMEOUT` = `10000`
  - `oracle.jdbc.ReadTimeout` = `30000`

### 4. Test Connection

1. Click **"Test Connection"** button at the bottom
2. If this is your first time connecting to Oracle, DBeaver will prompt you to download the Oracle JDBC driver
3. Click **"Download"** and wait for the driver to download
4. Once downloaded, click **"Test Connection"** again
5. You should see: **"Connected"** message

### 5. Save and Connect

1. Click **"Finish"** to save the connection
2. The connection will appear in the Database Navigator panel
3. Double-click the connection to connect, or right-click → **Connect**

## Alternative: Using Connection String

If you prefer to use a connection string:

1. In the connection wizard, go to the **"Main"** tab
2. Instead of filling individual fields, you can use:
   - **JDBC URL:** `jdbc:oracle:thin:@localhost:1521/XEPDB1`
   - **Username:** `system`
   - **Password:** `Oracle18`

## Troubleshooting

### Issue: "IO Error: The Network Adapter could not establish the connection"

**Solutions:**
- Verify Oracle container is running: `docker ps --filter name=oracle-xe`
- Check if port 1521 is accessible: `lsof -i :1521`
- Make sure you're using **Service Name** (`XEPDB1`), not SID

### Issue: "ORA-12514: TNS:listener does not currently know of service requested"

**Solution:**
- Make sure you're using **Service Name** = `XEPDB1` (not SID)
- In DBeaver, go to **Oracle** tab and set **Service name** to `XEPDB1`

### Issue: "ORA-12541: TNS:no listener"

**Solutions:**
- Start the Oracle container: `docker start oracle-xe`
- Wait 1-2 minutes for database to fully start
- Check container logs: `docker logs oracle-xe`

### Issue: Driver download fails

**Solutions:**
- Manually download Oracle JDBC driver from Oracle website
- In DBeaver: **Window** → **Preferences** → **Connections** → **Drivers** → **Oracle**
- Click **"Edit"** and add the driver JAR file manually

### Issue: Connection timeout

**Solutions:**
- Increase timeout in **Driver Properties** tab:
  - `oracle.net.CONNECT_TIMEOUT` = `30000`
- Check if database is fully initialized: `docker logs oracle-xe | tail -20`

## Quick Connection Test

Before connecting in DBeaver, verify the database is accessible:

```bash
# Check if container is running
docker ps --filter name=oracle-xe

# Test connection from command line (if sqlplus is available)
docker exec oracle-xe sqlplus system/Oracle18@XEPDB1
```

## Connection String Formats

For reference, here are the connection string formats:

**Service Name (Recommended):**
```
jdbc:oracle:thin:@localhost:1521/XEPDB1
```

**TNS Name (if using tnsnames.ora):**
```
jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=XEPDB1)))
```

## After Connecting

Once connected, you can:
- Browse database objects (tables, views, procedures)
- Run SQL queries
- View table data
- Create/edit database objects
- Export/import data

## Default Schemas

After connecting, you'll see several default schemas:
- **SYSTEM** - System schema (you're connected as this user)
- **SYS** - System schema with admin privileges
- **XEPDB1** - The pluggable database

You can create your own schemas/users for your application.

