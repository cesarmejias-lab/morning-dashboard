@echo off
cd /d "%~dp0"
echo Starting CLZ sync... > clz-refresh.log
node refresh-clz.js >> clz-refresh.log 2>&1
echo Done. >> clz-refresh.log
