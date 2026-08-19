@echo off
title Pulse Social App Launcher
echo ====================================================
echo Starting Pulse Social Media Scheduler (Local Demo)...
echo ====================================================

echo [1/2] Starting FastAPI Backend on Port 8000...
start "Pulse Social Backend" cmd /k "cd /d "E:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Pulse Social\backend" && python -m uvicorn server:app --host 127.0.0.1 --port 8000"

echo [2/2] Starting React Frontend on Port 3000...
start "Pulse Social Frontend" cmd /k "cd /d "E:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Pulse Social\frontend" && npm start"

echo ====================================================
echo Both servers are launching in separate windows!
echo Keep this window open or press any key to exit launcher.
echo ====================================================
pause