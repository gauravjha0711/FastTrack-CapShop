param(
  [Parameter(Mandatory=$true)][string]$SaPassword,
  [Parameter(Mandatory=$false)][string[]]$Databases = @('CapShopAuthDb','CapShopCatalogDb','CapShopOrderDb')
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$backups = Join-Path $PSScriptRoot 'backups'
$restoreSql = Join-Path $PSScriptRoot 'restore-from-bak.sql'

Write-Host "Using backups folder: $backups"

# Ensure SQL Server container is running
$null = docker ps | Out-String

$netJson = docker inspect capshop-sqlserver --format '{{json .NetworkSettings.Networks}}'
if (-not $netJson) {
  throw "Could not determine Docker network for capshop-sqlserver. Is the container running?"
}

$netObj = $netJson | ConvertFrom-Json
$networkName = @($netObj.PSObject.Properties.Name)[0]
if (-not $networkName) {
  throw "Could not determine Docker network for capshop-sqlserver. Is the container running?"
}

$sqlcmdImage = 'mcr.microsoft.com/mssql-tools:latest'
$sqlcmdPath = '/opt/mssql-tools/bin/sqlcmd'

foreach ($db in $Databases) {
  $bakFiles = Get-ChildItem -Path $backups -Filter "$db*.bak" -File -ErrorAction SilentlyContinue | Sort-Object Name
  if (-not $bakFiles -or $bakFiles.Count -eq 0) {
    Write-Warning "Missing backup file(s) for $db. Expected at least one file matching: $($db + '*.bak') (skipping)"
    continue
  }

  $bakNames = ($bakFiles | ForEach-Object { $_.Name }) -join ', '
  Write-Host "Restoring $db from: $bakNames ..."

  docker exec capshop-sqlserver /bin/bash -lc "mkdir -p /var/opt/mssql/backup" | Out-Null

  # Copy backup file(s) into SQL Server container
  foreach ($bak in $bakFiles) {
    docker cp "$($bak.FullName)" "capshop-sqlserver:/var/opt/mssql/backup/$($bak.Name)" | Out-Null
  }

  $bakInContainerPaths = $bakFiles | ForEach-Object { "/var/opt/mssql/backup/$($_.Name)" }
  $diskListTsql = ($bakInContainerPaths | ForEach-Object { "DISK = N'$_'" }) -join ', '

  # Verify backup integrity before dropping anything (important for striped backups)
  $verifyArgs = @(
    'run','--rm',
    '--network', $networkName,
    $sqlcmdImage,
    $sqlcmdPath,
    '-S','sqlserver,1433',
    '-U','sa',
    '-P', $SaPassword,
    '-b',
    '-Q', "RESTORE VERIFYONLY FROM $diskListTsql;"
  )

  & docker @verifyArgs | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "RESTORE VERIFYONLY failed for $db. If this is a multi-file (striped) backup, ensure ALL parts are present in db/migration/backups (e.g., $db*_1.bak, $db*_2.bak)."
  }

  # Get logical file names from RESTORE FILELISTONLY (SQL Server 2022 returns many columns)
  $fileListArgs = @(
    'run','--rm',
    '--network', $networkName,
    $sqlcmdImage,
    $sqlcmdPath,
    '-S','sqlserver,1433',
    '-U','sa',
    '-P', $SaPassword,
    '-W',
    '-s','|',
    '-h','-1',
    '-Q', "SET NOCOUNT ON; RESTORE FILELISTONLY FROM $diskListTsql;"
  )

  $fileListOutput = & docker @fileListArgs 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "RESTORE FILELISTONLY failed for $db. Output: $fileListOutput"
  }

  $dataLogical = $null
  $logLogical = $null
  foreach ($line in ($fileListOutput -split "`r?`n")) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line -notmatch '\|') { continue }
    $parts = $line.Split('|')
    if ($parts.Length -lt 3) { continue }
    $logical = $parts[0].Trim()
    $type = $parts[2].Trim()
    if (-not $dataLogical -and $type -eq 'D') { $dataLogical = $logical; continue }
    if (-not $logLogical -and $type -eq 'L') { $logLogical = $logical; continue }
  }

  if (-not $dataLogical -or -not $logLogical) {
    throw "Could not parse logical file names for $db from RESTORE FILELISTONLY output."
  }

  $dropAndRestore = @"
IF DB_ID(N'$db') IS NOT NULL
BEGIN
  ALTER DATABASE [$db] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
  DROP DATABASE [$db];
END

RESTORE DATABASE [$db]
  FROM $diskListTsql
  WITH MOVE N'$dataLogical' TO N'/var/opt/mssql/data/$db.mdf',
       MOVE N'$logLogical'  TO N'/var/opt/mssql/data/${db}_log.ldf',
       REPLACE, RECOVERY;
"@

  $restoreArgs = @(
    'run','--rm',
    '--network', $networkName,
    $sqlcmdImage,
    $sqlcmdPath,
    '-S','sqlserver,1433',
    '-U','sa',
    '-P', $SaPassword,
    '-b',
    '-Q', $dropAndRestore
  )

  & docker @restoreArgs | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "RESTORE DATABASE failed for $db."
  }
}

Write-Host "Done. Verify with SSMS at localhost,14333 (sa)."
