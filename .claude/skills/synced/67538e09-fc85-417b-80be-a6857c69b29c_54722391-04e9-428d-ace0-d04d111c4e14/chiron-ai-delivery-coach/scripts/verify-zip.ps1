# verify-zip.ps1 <zip> <expected-md5>: prints ZIP|ok or ZIP|mismatch|<actual-md5>. Exit 0 only on ok.
param([string]$Zip, [string]$Expected)
$actual = 'none'
try { $actual = (Get-FileHash -Algorithm MD5 -LiteralPath $Zip -ErrorAction Stop).Hash.ToLower() } catch { $actual = 'none' }
if ($actual -eq $Expected.ToLower()) { Write-Output 'ZIP|ok'; exit 0 }
Write-Output "ZIP|mismatch|$actual"
exit 1
