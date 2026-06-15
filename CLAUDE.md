# n8n Workflow Automation

## Architecture
- **Type:** Docker Compose (2 services: n8n + PostgreSQL)
- **Images:** n8nio/n8n:latest, postgres:16-alpine
- **Containers:** n8n (port 5678), n8n-postgres (port 5432 internal only)

## Stack
- n8n v2.25.7 (Node.js 24.15.0)
- PostgreSQL 16 (Alpine)
- nginx reverse proxy on :80

## File Locations
- **Data:** /home/appuser/app/data/ → /home/node/.n8n (n8n config + files)
- **PostgreSQL data:** /home/appuser/app/postgres-data/ → /var/lib/postgresql/data
- **Env config:** /home/appuser/app/.env
- **Compose:** /home/appuser/app/docker-compose.yml
- **Nginx:** /etc/nginx/sites-available/app.conf

## How to edit
- All workflow configuration via n8n web UI
- Environment variables: edit /home/appuser/app/.env → `docker compose up -d`
- Nginx config: edit /etc/nginx/sites-available/app.conf → `sudo nginx -t && sudo systemctl reload nginx`

## Ports
| Service    | Internal | External |
|------------|----------|----------|
| n8n        | 5678     | 5678     |
| PostgreSQL | 5432     | none     |
| nginx      | 80       | 80       |

## Environment Variables (non-secret)
- N8N_HOST=vh-prod-n8n-master-fb5ad6-5ecba78e.livemy.site
- N8N_PROTOCOL=https
- N8N_PORT=5678
- DB_TYPE=postgresdb
- DB_POSTGRESDB_HOST=postgres
- DB_POSTGRESDB_DATABASE=n8n
- GENERIC_TIMEZONE=UTC
- NODE_ENV=production
- WEBHOOK_URL=https://vh-prod-n8n-master-fb5ad6-5ecba78e.livemy.site/

## Useful Commands
- Logs: `cd /home/appuser/app && docker compose logs -f n8n`
- Restart: `cd /home/appuser/app && docker compose restart n8n`
- Shell: `docker exec -it n8n /bin/sh`
- Full restart: `cd /home/appuser/app && docker compose down && docker compose up -d`
- DB shell: `docker exec -it n8n-postgres psql -U n8n -d n8n`
