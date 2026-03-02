# Dokploy Deployment (Applications)

## Apps
- Web: `app.studio-name.com`
- API: `api.studio-name.com`

## Dockerfiles
- Web: `Dockerfile.web`
- API: `Dockerfile.api`

## Health Checks
- API: `GET /api/health`
- Web: `GET /`

## Migration Strategy
- Run Prisma migrations on deploy for API:
  - `npx prisma migrate deploy`
  - Ensure `DATABASE_URL` is set.
- For Dokploy, add a pre-start command or a separate migration job.

## Database Options
- Dokploy Postgres container: provision a Postgres service and set `DATABASE_URL`.
- External managed Postgres: set `DATABASE_URL` to the managed instance.

## Environment Variables
### API
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (default 4000)
- Optional integrations (disabled by default):
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_VERIFY_TOKEN`
  - `META_ACCESS_TOKEN`
  - `NOTION_TOKEN`
  - `NOTION_DATABASE_ID`
  - `GA_PROPERTY_ID`
  - `GA_CREDENTIALS_JSON` or `GA_OAUTH_CLIENT_ID` + `GA_OAUTH_CLIENT_SECRET`

### Web
- `NEXT_PUBLIC_API_BASE_URL` (e.g., `https://api.studio-name.com`)

## Webhook URLs
- Stripe: `https://api.studio-name.com/api/payments/webhook/stripe`
- Meta: `https://api.studio-name.com/api/inbox/webhook/meta`

## Notes
- Domain plan uses separate app + api subdomains; confirm if a single domain is preferred.
- Feature flags default to disabled; enable per studio via `/api/feature-flags`.
