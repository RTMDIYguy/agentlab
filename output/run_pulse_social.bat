@echo off
title Pulse Social App Launcher
echo ====================================================
echo Starting Pulse Social Media Scheduler (Local Demo)...
echo ====================================================

echo [1/2] Starting FastAPI Backend on Port 8000...
cd /d "E:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Pulse Social\backend"
start "Pulse Social Backend" cmd /k "python -m uvicorn server:app --host 127.0.0.1 --port 8000"

echo [2/2] Starting React Frontend on Port 3000...
cd /d "E:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Pulse Social\frontend"
start "Pulse Social Frontend" cmd /k "npm start"

echo ====================================================
echo Both servers have been launched!
echo Keep this window open or press any key to exit launcher.
echo ====================================================
pause