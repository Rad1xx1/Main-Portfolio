@echo off
where node >nul 2>nul
if errorlevel 1 (
  start "" "%~dp0index.html"
) else (
  start "" /b node "%~dp0launch.cjs"
)
