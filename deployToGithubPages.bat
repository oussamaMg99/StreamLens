@echo off
:: Builds the app and publishes dist/ to docs/ on dev (GitHub Pages serves dev + /docs).
:: Batch version of deployCommands.txt; stops at the first failing step.

:: npm is itself a batch file (npm.cmd), so it needs CALL or this script would end after it.
call npm run build || goto :fail

if exist docs rmdir /S /Q docs || goto :fail
xcopy dist docs /E /I /Q /Y >nul || goto :fail

git add docs || goto :fail
git commit -m "Publish build to docs for GitHub Pages" || goto :fail
git push origin dev || goto :fail

echo Deploy complete.
exit /b 0

:fail
echo Deploy failed - see the error above.
exit /b 1
