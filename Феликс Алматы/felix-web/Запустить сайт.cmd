@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Для локального просмотра нужен Node.js. Можно также открыть dist\index.html.
  pause
  exit /b 1
)
echo Откройте http://127.0.0.1:8770 в браузере.
echo Для остановки нажмите Ctrl+C в этом окне.
node serve.cjs
pause
