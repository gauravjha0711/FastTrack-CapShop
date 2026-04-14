# CapShop SQL Server data migration (Host SQL -> Docker SQL)

## Important
- Your existing Windows SQL Server data will **NOT** automatically appear inside Docker SQL Server.
- You must export it (recommended: `.bak` backups), then restore into the Docker SQL Server container.

## Why `.bak` backup/restore is recommended here
- Highest fidelity (schema + data + indexes)
- Fast and reliable
- Works well for multiple microservice databases

## 1) Start the Docker SQL Server
From repo root:

```powershell
cp .env.example .env
# edit .env and set CAPSHOP_DOCKER_SA_PASSWORD

docker compose up -d sqlserver
```

Docker SQL Server will listen on:
- Host: `localhost,14333`
- User: `sa`
- Password: value of `CAPSHOP_DOCKER_SA_PASSWORD`

## 2) Create backups from your current Windows SQL Server
For each DB you want to move (typical CapShop DBs):
- `CapShopAuthDb`
- `CapShopCatalogDb`
- `CapShopOrderDb`
- `CapShopAdminDb`

Using SSMS:
- Right click DB → Tasks → Back Up...
- Backup type: Full
- Destination: choose a path you can access
- Produce files:
  - `CapShopAuthDb.bak`
  - `CapShopCatalogDb.bak`
  - `CapShopOrderDb.bak`
  - `CapShopAdminDb.bak`

Copy the `.bak` files into:
- `db/migration/backups/`

### If your backup is multi-file (striped)
If you created the backup with multiple destinations in SSMS, SQL Server will require *all* backup parts during restore.
- Copy *all* parts into `db/migration/backups/`.
- Name them with a common prefix so they match `CapShopAuthDb*.bak` (same idea for Catalog/Order/Admin).
  - Example: `CapShopAuthDb_1.bak` and `CapShopAuthDb_2.bak`

The `restore.ps1` script restores from all matching `CapShopXxxDb*.bak` files automatically.

### Recommended: create single-file backups (simplest)
In SSMS, make sure the backup has **only one Destination** (Disk). Remove any extra destinations, then back up again.

Or run a single-file backup command like:

```sql
BACKUP DATABASE [CapShopCatalogDb]
TO DISK = N'C:\\backups\\CapShopCatalogDb.bak'
WITH INIT, FORMAT, STATS = 10;
```

## 3) Restore backups into Docker SQL Server
From repo root:

```powershell
# Ensure sqlserver is running
docker compose up -d sqlserver

# Restore
powershell -ExecutionPolicy Bypass -File .\db\migration\restore.ps1 -SaPassword "$env:CAPSHOP_DOCKER_SA_PASSWORD"
```

## 4) Verify data exists
- Connect via SSMS:
  - Server name: `localhost,14333`
  - Authentication: SQL Server Authentication
  - Login: `sa`
  - Password: `CAPSHOP_DOCKER_SA_PASSWORD`
- Check tables (e.g., products):

```sql
USE CapShopCatalogDb;
SELECT TOP 20 * FROM Products ORDER BY Id DESC;
```

## Persistence
- Docker SQL data is stored in the named volume `capshop-sql-data`.
- It persists across `docker compose down` and restarts.
- It is removed only if you delete volumes, e.g. `docker compose down -v`.

## Troubleshooting
### sqlcmd missing inside sqlserver container
Some SQL Server images don’t include `sqlcmd`.
- The provided `restore.ps1` already runs restores using `mcr.microsoft.com/mssql-tools:latest` (so it does not depend on `sqlcmd` being present inside the SQL Server container).

### Restore fails because files already exist / DB in use
The restore script drops the DB before restoring (`SINGLE_USER WITH ROLLBACK IMMEDIATE`).
If you want to keep existing Docker DB, remove the drop step.
