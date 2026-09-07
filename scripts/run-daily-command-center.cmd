@echo off
REM AgentLab Daily Command Center Automated Sync
cd /d "e:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\AgentLab"
node scripts/daily-command-center.mjs >> docs\operations\daily-command-center\sync.log 2>&1
