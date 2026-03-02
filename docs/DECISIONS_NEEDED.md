# Decisions Needed

- Confirm database choice: keep PostgreSQL (recommended for exclusion constraints + RLS) or switch to MongoDB with non-ideal serializable locks (alternative would require manual transaction locks and careful overlap checks).
- Provide station list for Soul Tattoo Atelier (replace placeholder station).
- Choose GA4 auth method if enabling analytics: Service Account or OAuth (both stubs provided).
- Provide Notion target: database/page ID for reporting exports (weekly/monthly).
- Provide Meta app credentials + verify webhook subscription details to enable Instagram DM ingestion.
- Provide Stripe keys + webhook secret to enable deposit checkout.
- Confirm whether single-domain deployment is desired instead of separate app/api subdomains.
- Confirm whether FullCalendar resource grid (artists-as-columns) is acceptable with licensing, or provide alternative grid implementation.
