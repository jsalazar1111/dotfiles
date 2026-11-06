# decode-b64.ps1 <input-file> <output-file>: turns the Drive tool's base64 reply into the real file.
# The input may be the bare base64 text or the tool's JSON reply with a "content" field. Prints DECODE|ok|<bytes> or DECODE|failed.
param([string]$InFile, [string]$OutFile)
try {
    $text = [IO.File]::ReadAllText($InFile).Trim()
    if ($text.StartsWith('{')) { $text = [string]((ConvertFrom-Json $text).content) }
    $text = ($text -replace '[\s"]', '')
    [IO.File]::WriteAllBytes($OutFile, [Convert]::FromBase64String($text))
    Write-Output "DECODE|ok|$((Get-Item $OutFile).Length)"
} catch {
    Write-Output "DECODE|failed|$($_.Exception.Message -replace '\|', ' ')"
    exit 1
}
