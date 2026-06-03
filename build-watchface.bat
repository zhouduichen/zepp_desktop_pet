@echo off
cd /d D:\huami\desktop_pet\watchface-spike
set PATH=C:\Users\33135\AppData\Roaming\npm;%PATH%
set NODE_OPTIONS=--require D:\huami\desktop_pet\patch-zpm.cjs
echo ============================================
echo   Zepp Pet Universe - Build Watch Face
echo ============================================
call node D:\huami\desktop_pet\scripts\stage-watchface-assets.mjs D:\huami\desktop_pet\pet-packs\pixel-cat D:\huami\desktop_pet\watchface-spike\assets
zeus build
echo.
echo Build done. Check watchface-spike/dist/
pause
