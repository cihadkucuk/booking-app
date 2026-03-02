# Assumptions

- Default database for this build is PostgreSQL with Prisma to satisfy concurrency-safe overlap constraints and to enable RLS; this should be confirmed or changed in DECISIONS_NEEDED.
- Monorepo uses npm workspaces for package management and scripts.
- Station list was not provided, so seed data includes a single placeholder station named "Setup Required" for initial boot; replace with real stations in Studio Settings.
- Feature flags default to disabled for external integrations (Stripe, Meta, Notion, GA/SEO) until env vars are provided.
- Users are scoped to a primary studio via a required studioId field to satisfy studio-level RLS; multi-studio membership should be revisited if this is too limiting.
- Login requires tenantId and studioId inputs so RLS can scope the User lookup.
- Default studio timezone is Europe/Prague and seed currency defaults to CZK.
