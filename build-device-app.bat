@echo off
cd /d D:\huami\desktop_pet\device-app
set PATH=C:\Users\33135\AppData\Roaming\npm;%PATH%
set NODE_OPTIONS=--require D:\huami\desktop_pet\patch-zpm.cjs
echo ============================================
echo   Zepp Pet Universe - Build Device App
echo ============================================
zeus build
echo.
echo Build done. Check device-app/dist/
pause
