@echo off
cd /d %~dp0

:: Ask for commit message
set /p msg=Enter commit message: 

:: Add, commit, and push
echo.
echo Adding changes...
git add .

echo.
echo Committing with message: "%msg%"
git commit -m "%msg%"

echo.
echo Pushing to remote...
git push

echo.
echo ✅ All done!
pause
