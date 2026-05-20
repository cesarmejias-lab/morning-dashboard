@echo off
:: Cambia al directorio del script
cd /d "%~dp0"
echo ==================================================
echo Iniciando sincronizacion automatica de musica...
echo ==================================================
node sync-collection.js
echo.
echo Sincronizacion finalizada.
pause
