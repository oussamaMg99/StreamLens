:: 🚀 How the script works (quick summary)

:: * npm run build → generates dist/

:: * Deletes docs/ (Windows-safe)

:: * Copies dist → docs

:: * Commits if docs changed
:: * Pushes to dev branch

:: * GitHub Pages already configured to serve from dev + /docs, so the site updates automatically


@echo off
setlocal enabledelayedexpansion

echo ===========================================
echo   StreamLens - GitHub Pages Deploy Script
echo ===========================================
echo.

:: --- Step 1: Build the project ---
echo Running Vite build...
npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo Build failed. Aborting.
    exit /b 1
)
echo Build complete.
echo.

:: --- Step 2: Remove old docs/ folder ---
if exist docs (
    echo Removing old docs/ folder...
    rmdir /S /Q docs
)
echo.

:: --- Step 3: Copy dist -> docs ---
echo Copying dist/ to docs/ ...
xcopy dist docs /E /I /Y >nul
IF %ERRORLEVEL% NEQ 0 (
    echo Copy failed. Aborting.
    exit /b 1
)
echo Copy complete.
echo.

:: --- Step 4: Git add/commit ---
echo Staging docs/ folder...
git add docs

:: Check if there are any staged changes
for /f "tokens=1" %%a in ('git diff --cached --name-only') do (
    set hasChanges=1
)

if not defined hasChanges (
    echo No changes to commit. Nothing to publish.
    echo.
    goto pushOnly
)

echo Committing changes...
git commit -m "chore: publish build to docs"
IF %ERRORLEVEL% NEQ 0 (
    echo Commit failed. Aborting.
    exit /b 1
)
echo Commit created.
echo.

:: --- Step 5: Push to dev branch ---
:pushOnly
echo Pushing to dev branch...
git push origin dev
IF %ERRORLEVEL% NEQ 0 (
    echo Push failed. Aborting.
    exit /b 1
)

echo.
echo ===========================================
echo   Deployment completed successfully!
echo   GitHub Pages should update shortly.
echo ===========================================
echo.

endlocal
exit /b 0
