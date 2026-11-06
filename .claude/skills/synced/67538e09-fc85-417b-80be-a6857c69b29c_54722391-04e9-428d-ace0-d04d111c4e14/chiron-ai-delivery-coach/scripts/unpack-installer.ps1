# unpack-installer.ps1 <zip> <destDir>: unzips, then prints RUNNER|<path to run-all.ps1>|<one-line command>.
# Never runs the runner: the person pastes the line into an administrator PowerShell.
param([string]$Zip, [string]$Dest)
function Stop-Unpack([string]$Why) { Write-Output "UNPACK|fail|$Why"; exit 1 }
if (-not (Test-Path -LiteralPath $Zip -PathType Leaf)) { Stop-Unpack 'no such zip' }
try {
    New-Item -ItemType Directory -Force -Path $Dest | Out-Null
    Expand-Archive -LiteralPath $Zip -DestinationPath $Dest -Force -ErrorAction Stop
} catch { Stop-Unpack 'unzip failed' }
$full = (Resolve-Path -LiteralPath $Dest).Path
$runner = Get-ChildItem -LiteralPath $full -Recurse -Filter 'run-all.ps1' -File | Select-Object -First 1
if (-not $runner) { Stop-Unpack 'run-all.ps1 not found' }
$p = $runner.FullName
Write-Output ('RUNNER|' + $p + '|powershell -ExecutionPolicy Bypass -File "' + $p + '"')
exit 0
