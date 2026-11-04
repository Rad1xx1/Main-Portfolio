@echo off
setlocal
set "SILVER_PREVIEW_ROOT=%~dp0"
powershell.exe -NoProfile -Command "& { $ErrorActionPreference='Stop'; $url='http://127.0.0.1:4187/'; $ready=$false; try { $ready=(Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2).StatusCode -eq 200 } catch {}; if (-not $ready) { $node=(Get-Command node.exe).Source; $entry=Join-Path $env:SILVER_PREVIEW_ROOT 'serve.cjs'; Start-Process -FilePath $node -ArgumentList ([char]34+$entry+[char]34) -WorkingDirectory $env:SILVER_PREVIEW_ROOT -WindowStyle Hidden; for ($attempt=0; $attempt -lt 30; $attempt++) { Start-Sleep -Milliseconds 300; try { $ready=(Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1).StatusCode -eq 200 } catch {}; if ($ready) { break } } }; if (-not $ready) { throw 'Local preview could not start on port 4187.' }; Start-Process $url }"
if errorlevel 1 pause
endlocal
