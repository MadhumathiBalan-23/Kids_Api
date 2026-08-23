@echo off
echo.
echo ============================================
echo   TinyTots Kids API - First Time Setup
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 goto :error

echo.
echo [2/4] Generating Prisma Client...
call npx prisma generate
if errorlevel 1 goto :prisma_err

echo.
echo [3/4] Pushing schema to SQLite database...
call npx prisma db push
if errorlevel 1 goto :error

echo.
echo [4/4] Seeding initial data...
call node prisma/seed.js
if errorlevel 1 echo Warning: Seed skipped or already seeded.

echo.
echo ============================================
echo   SUCCESS! Starting the API server...
echo   Open: http://localhost:5001/api/health
echo ============================================
echo.
call node src/server.js
goto :end

:prisma_err
echo.
echo Prisma generate failed. Trying alternative...
call node_modules\.bin\prisma generate
call node_modules\.bin\prisma db push
call node prisma/seed.js
call node src/server.js
goto :end

:error
echo.
echo [ERROR] Setup failed. Please check the error above.
pause

:end
