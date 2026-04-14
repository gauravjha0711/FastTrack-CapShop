-- Restores a single database from a .bak inside the container.
-- Use with: sqlcmd -C -S sqlserver -U sa -P <pwd> -v DB_NAME="CapShopCatalogDb" BAK_FILE="/backups/CapShopCatalogDb.bak" -i /scripts/restore-from-bak.sql

:setvar DB_NAME "CapShopCatalogDb"
:setvar BAK_FILE "/backups/CapShopCatalogDb.bak"

DECLARE @db sysname = N'$(DB_NAME)';
DECLARE @bak nvarchar(4000) = N'$(BAK_FILE)';

IF DB_ID(@db) IS NOT NULL
BEGIN
  PRINT 'Database already exists, setting to SINGLE_USER and dropping: ' + @db;
  DECLARE @sql nvarchar(max) = N'ALTER DATABASE [' + @db + N'] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [' + @db + N'];';
  EXEC sp_executesql @sql;
END

PRINT 'Inspecting backup file: ' + @bak;

DECLARE @fileList TABLE(
  LogicalName nvarchar(128),
  PhysicalName nvarchar(260),
  Type char(1),
  FileGroupName nvarchar(128),
  Size numeric(20,0),
  MaxSize numeric(20,0),
  FileId bigint,
  CreateLSN numeric(25,0),
  DropLSN numeric(25,0),
  UniqueId uniqueidentifier,
  ReadOnlyLSN numeric(25,0),
  ReadWriteLSN numeric(25,0),
  BackupSizeInBytes bigint,
  SourceBlockSize int,
  FileGroupId int,
  LogGroupGUID uniqueidentifier,
  DifferentialBaseLSN numeric(25,0),
  DifferentialBaseGUID uniqueidentifier,
  IsReadOnly bit,
  IsPresent bit,
  TDEThumbprint varbinary(32)
);

INSERT INTO @fileList
EXEC('RESTORE FILELISTONLY FROM DISK = ''' + @bak + '''');

DECLARE @dataLogical nvarchar(128) = (SELECT TOP 1 LogicalName FROM @fileList WHERE Type = 'D');
DECLARE @logLogical nvarchar(128) = (SELECT TOP 1 LogicalName FROM @fileList WHERE Type = 'L');

DECLARE @dataPath nvarchar(4000) = N'/var/opt/mssql/data/' + @db + N'.mdf';
DECLARE @logPath  nvarchar(4000) = N'/var/opt/mssql/data/' + @db + N'_log.ldf';

PRINT 'Restoring ' + @db + '...';

DECLARE @restoreSql nvarchar(max) =
  N'RESTORE DATABASE [' + @db + N'] FROM DISK = ''' + @bak + N''' WITH MOVE ''' + @dataLogical + N''' TO ''' + @dataPath + N''', MOVE ''' + @logLogical + N''' TO ''' + @logPath + N''', REPLACE, RECOVERY;';

EXEC sp_executesql @restoreSql;

PRINT 'Restore complete: ' + @db;
