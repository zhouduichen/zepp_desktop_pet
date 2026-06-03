@echo off
cd /d D:\huami\desktop_pet\watchface-spike
set PATH=C:\Users\33135\AppData\Roaming\npm;%PATH%
set NODE_OPTIONS=--require D:\huami\desktop_pet\patch-zpm.cjs
echo ============================================
echo   Zepp Pet Universe - Watch Face Preview
echo ============================================
zeus preview
echo.
echo If Simulator opened, select Amazfit GTR 4
pause
