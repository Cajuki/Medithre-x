@echo off
echo ============================================
echo   MEDITHREX — PostgreSQL Setup & Start
echo ============================================
echo.

echo [1/3] Installing backend dependencies...
cd backend
call npm install
echo.

echo [2/3] Installing frontend dependencies...
cd ..\frontend
call npm install
cd ..
echo.

echo [3/3] Initialising database schema + seed...
cd backend
call npm run db:init
call npm run db:seed
cd ..
echo.

echo Starting backend (port 5000)...
start "Medithrex Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo Starting frontend (port 5173)...
start "Medithrex Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo  Backend  → http://localhost:5000/api/health
echo  Frontend → http://localhost:5173
echo.
echo  IMPORTANT: Edit backend\.env with your
echo  PostgreSQL credentials before running!
echo.
echo  Admin: admin@medithrex.co.ke / Admin@2024
echo  User:  jane@hospital.co.ke   / User@2024
echo ============================================
pause
