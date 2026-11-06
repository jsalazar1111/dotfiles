# Runs every tool's version command from tools.json (Windows entries). Prints TOOL|<id>|ok|<version> or
# TOOL|<id>|missing| per tool, then TOOLCHAIN|ok or TOOLCHAIN|missing|<count>. Exits 0 only when nothing is missing.
$ErrorActionPreference = 'Continue'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

# A tool installed a minute ago is not on this session's PATH yet: reload it from the registry.
$machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$user = [Environment]::GetEnvironmentVariable('Path', 'User')
$extra = "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin;C:\Program Files\Microsoft VS Code\bin"
$env:Path = "$machine;$user;$extra;$env:Path"

$tools = Get-Content -Raw -Path (Join-Path $here '..\tools.json') | ConvertFrom-Json
$missing = 0
foreach ($t in $tools) {
    if (-not $t.windows) { continue }
    $parts = @($t.windows)
    $cmd = $parts[0]
    $rest = @($parts | Select-Object -Skip 1)
    $argText = $rest -join ' '
    $found = Get-Command $cmd -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    # The Microsoft Store placeholder for python opens the Store instead of running.
    if ($found -and $found.Source -like '*\WindowsApps\*') { $found = $null }
    $ver = ''
    if ($found) {
        $job = Start-Job -ScriptBlock {
            param($p, $a)
            $line = '"' + $p + '" ' + $a + ' 2>&1'
            $o = cmd.exe /c $line
            [pscustomobject]@{ Out = ($o -join "`n"); Code = $LASTEXITCODE }
        } -ArgumentList $found.Source, $argText
        if (Wait-Job $job -Timeout 10) {
            $r = Receive-Job $job
            if ($r -and $r.Code -eq 0) {
                $first = ($r.Out -split "`n" | Where-Object { $_.Trim() } | Select-Object -First 1)
                if ($first) { $ver = ($first.Trim() -replace '\|', ' ') }
            }
        } else {
            # Found but slow: a freshly installed tool (the Salesforce CLI) can take over 10 seconds on its first run. It is installed, not missing.
            Stop-Job $job
            $ver = 'installed (first run is slow)'
        }
        Remove-Job $job -Force
    }
    if ($ver) {
        Write-Output "TOOL|$($t.id)|ok|$ver"
    } else {
        Write-Output "TOOL|$($t.id)|missing|"
        $missing++
    }
}

if ($missing -eq 0) { Write-Output 'TOOLCHAIN|ok'; exit 0 }
Write-Output "TOOLCHAIN|missing|$missing"
exit 1
