# Integrations

## Stripe (Deposits)
- Feature flag: `stripe` (disabled by default)
- Required env vars:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Webhook URL: `https://api.studio-name.com/api/payments/webhook/stripe`
- Behavior: idempotent via `PaymentEvent` unique provider event IDs

## Meta (Instagram DM)
- Feature flag: `meta` (disabled by default)
- Required env vars:
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_VERIFY_TOKEN`
  - `META_ACCESS_TOKEN`
- Webhook URL: `https://api.studio-name.com/api/inbox/webhook/meta`
- Note: Webhook expects tenant context in payload until permissions/config are finalized.

## Notion Reporting
- Feature flag: `notion` (disabled by default)
- Required env vars:
  - `NOTION_TOKEN`
  - `NOTION_DATABASE_ID`
- Scheduled exports: weekly + monthly
- If env vars missing, UI shows ?Notion export disabled?.

## Google Analytics (Beta)
- Feature flag: `ga` (disabled by default)
- Auth methods undecided: Service Account vs OAuth
- Required env vars (when chosen):
  - `GA_PROPERTY_ID`
  - `GA_CREDENTIALS_JSON` (service account) OR `GA_OAUTH_CLIENT_ID` + `GA_OAUTH_CLIENT_SECRET`

## SEO Health Score (Beta)
- Feature flag: `seo` (disabled by default)
- Crawler-based checks: title/meta description, headings, canonical, robots.txt, sitemap, indexability hints, broken links placeholder.
- Optional integration stub: Search Console for ranking positions.

## Meta Insights (Growth Analytics)
- Feature flag: `growthAnalytics` (disabled by default)
- Schema supports account and media snapshots; ads metrics are optional stub.
