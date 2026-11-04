@echo off
chcp 65001 >nul
cd /d "%~dp0felix-web"
where node >nul 2>nul
if errorlevel 1 (
  echo Для локального сервера нужен Node.js.
  echo Страницы также доступны в папке felix-web\dist.
  pause
  exit /b 1
)
echo Откройте http://127.0.0.1:8770/ в Edge или Chrome.
echo Чтобы остановить сервер, нажмите Ctrl+C в этом окне.
node serve.cjs
pause
