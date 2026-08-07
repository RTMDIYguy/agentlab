@echo off
cd /d "E:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Pulse Social\backend"
echo Launching Cloud Run Deploy with log redirect...
gcloud run deploy pulse-social-backend --source . --platform managed --allow-unauthenticated --region us-central1 > "E:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\AgentLab\deploy.log" 2>&1
