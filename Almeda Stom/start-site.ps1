param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$siteRoot = $PSScriptRoot
$pythonExe = Join-Path (Split-Path $siteRoot -Parent) '.venv\Scripts\python.exe'
$siteUrl = $null
foreach ($sitePort in 8876..8890) {
    $candidate = "http://127.0.0.1:$sitePort/"
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $candidate -TimeoutSec 1
        if ($response.Content -match '<title>Almeda Stom') { $siteUrl = $candidate; break }
        continue
    } catch {
        if (Get-NetTCPConnection -State Listen -LocalPort $sitePort -ErrorAction SilentlyContinue) { continue }
    }
    $arguments = '-m http.server ' + $sitePort + ' --bind 127.0.0.1 --directory "' + $siteRoot + '"'
    Start-Process -FilePath $pythonExe -ArgumentList $arguments -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Milliseconds 200
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $candidate -TimeoutSec 1
            if ($response.Content -match '<title>Almeda Stom') { $siteUrl = $candidate; break }
        } catch {}
    }
    if ($siteUrl) { break }
}
if (-not $siteUrl) { throw 'Could not start the local website.' }
Write-Output $siteUrl
if (-not $NoBrowser) { Start-Process $siteUrl }
