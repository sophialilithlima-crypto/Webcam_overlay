@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==========================================
echo       Webcam_overlay - Estudio web
echo ==========================================
if not exist "node_modules\react\package.json" goto install_dependencies
if not exist "node_modules\ws\package.json" goto install_dependencies
goto start_app

:install_dependencies
echo.
echo Instalando/verificando dependencias (incluindo o relay de captura)...
call npm install
if errorlevel 1 (
  echo.
  echo A instalacao falhou. Verifique a conexao e a versao do Node.js.
  pause
  exit /b 1
)

:start_app
echo.
echo Iniciando o estúdio e o relay local de captura...
call npm run dev
pause
