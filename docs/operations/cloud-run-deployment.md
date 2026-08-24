# Cloud Run Deployment Guide

This guide details the exact steps and `gcloud` CLI commands required to build and deploy AgentLab to Google Cloud Run.

## Prerequisites

1. **Google Cloud SDK**: Ensure you have the `gcloud` CLI installed and authenticated.
   ```bash
   gcloud auth login
   gcloud config set project [YOUR_PROJECT_ID]
   ```
2. **Enable Required APIs**:
   Ensure the Cloud Build, Cloud Run, and Container Registry (or Artifact Registry) APIs are enabled for your project:
   ```bash
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
   ```

## Step 1: Build the Docker Image

Use Google Cloud Build to build the container image and store it in Google Container Registry (GCR) or Artifact Registry.

Run the following command from the root of the repository (where the `Dockerfile` is located):

```bash
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/agentlab
```

*Note: Replace `[YOUR_PROJECT_ID]` with your actual Google Cloud Project ID.*

## Step 2: Deploy to Cloud Run

Deploy the built image to Google Cloud Run. The container is configured to listen on port `8080`, which Cloud Run uses by default.

```bash
gcloud run deploy agentlab \
  --image gcr.io/[YOUR_PROJECT_ID]/agentlab \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

You can change the `--region` flag to your preferred Google Cloud region.

## Step 3: Configure Environment Variables

The deployment requires several sensitive environment variables to function correctly. You must set these in the Cloud Run console or via the CLI.

**Required Variables**:
- `DATABASE_URL`: Connection string for the production PostgreSQL database.
- `GOOGLE_GENERATIVE_AI_API_KEY`: API key for Gemini model inference.
- `STRIPE_SECRET_KEY`: Stripe secret key for processing subscriptions.
- `SESSION_SECRET`: A secure random string for session signing.

**Setting Environment Variables via CLI**:

```bash
gcloud run services update agentlab \
  --region us-central1 \
  --update-env-vars="DATABASE_URL=postgres://user:pass@host:5432/db,GOOGLE_GENERATIVE_AI_API_KEY=your_key,STRIPE_SECRET_KEY=your_key,SESSION_SECRET=your_secret"
```

*Alternatively, it is highly recommended to use **Google Cloud Secret Manager** for sensitive keys.*

```bash
gcloud run services update agentlab \
  --region us-central1 \
  --update-secrets="DATABASE_URL=DATABASE_URL:latest,GOOGLE_GENERATIVE_AI_API_KEY=GOOGLE_GENERATIVE_AI_API_KEY:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest"
```

## Step 4: Verify the Deployment

After deployment, the CLI will output a Service URL (e.g., `https://agentlab-xyz-uc.a.run.app`). 
Visit this URL in your browser to verify the Vite React frontend is loading correctly and the Express API is responding.
