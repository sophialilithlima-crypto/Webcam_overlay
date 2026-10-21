@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==========================================
echo       Webcam_overlay - Estudio web
echo ==========================================
if not exist "node_modules" (
  echo Instalando dependencias pela primeira vez...
  call npm install
  if errorlevel 1 (
    echo.
    echo A instalacao falhou. Verifique a conexao e a versao do Node.js.
    pause
    exit /b 1
  )
)
echo.
echo Iniciando o servidor local...
call npm run dev
pause
