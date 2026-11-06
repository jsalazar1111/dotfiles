# Parses `claude auth status`. Prints one line: SIGNIN|ok|<email> or SIGNIN|fail|<code>.
# Codes: not-logged-in, not-subscription, wrong-org, bad-email, unexpected-fields, unreadable.
# Fields are checked in this order: loggedIn, authMethod, orgName, email. A missing field never passes.
$ErrorActionPreference = 'Continue'

function Stop-Check([string]$Code) {
    Write-Output "SIGNIN|fail|$Code"
    exit 1
}

$raw = ''
try { $raw = (& claude auth status 2>$null | Out-String) } catch { $raw = '' }

$j = $null
try { $j = $raw | ConvertFrom-Json } catch { $j = $null }
if ($null -eq $j) { Stop-Check 'unreadable' }

$names = @($j.PSObject.Properties | ForEach-Object { $_.Name })
if ($names -contains 'loggedIn' -and $j.loggedIn -eq $false) { Stop-Check 'not-logged-in' }
foreach ($f in 'loggedIn', 'authMethod', 'orgName', 'email') {
    if ($names -notcontains $f) { Stop-Check 'unexpected-fields' }
}
if ($j.loggedIn -ne $true) { Stop-Check 'unexpected-fields' }
if ($j.authMethod -ne 'claude.ai') { Stop-Check 'not-subscription' }
if ($j.orgName -cne 'Plative') { Stop-Check 'wrong-org' }
if ($j.email -notmatch '(?i)@plative\.com$') { Stop-Check 'bad-email' }

Write-Output "SIGNIN|ok|$($j.email)"
exit 0
