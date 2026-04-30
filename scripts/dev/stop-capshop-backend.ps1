[CmdletBinding()]
param(
  [int[]]$Ports = @(5000, 5001, 5002, 5003, 5004, 5005)
)

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "Stopping CapShop backend processes on ports: $($Ports -join ', ')" 

$connections = Get-NetTCPConnection -State Listen | Where-Object { $Ports -contains $_.LocalPort }

if (-not $connections) {
  Write-Host "No listening processes found on the specified ports."
  exit 0
}

$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $processIds) {
  $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if (-not $proc) { continue }

  Write-Host ("Stopping PID {0} ({1})" -f $processId, $proc.ProcessName)
  Stop-Process -Id $processId -Force
}

Write-Host "Done."
