# Architecture Overview

## Monorepo

- `apps/api`: NestJS backend (tenant resolution, auth, booking, inbox, shopping jobs, realtime)
- `apps/web`: Next.js App Router frontend (tenant-themed white-label UI)
- `packages/db`: Prisma schema/migrations/seed and shared Prisma client
- `packages/shared`: shared TS/Zod contracts
- `docs`: architecture, local development, assumptions

## Multi-Tenant Strategy

- Single codebase; no per-customer forks.
- Every tenant-owned model includes `studioId`.
- API middleware resolves tenant from `Host` or `x-studio-slug`.
- Auth token includes `studioId`.
- `TenantAccessGuard` enforces token tenant matches resolved tenant.
- Query patterns in services always scope by `studioId`.

## Backend Modules

- `auth`: JWT login/session + RBAC (`OWNER`, `MANAGER`, `STAFF`)
- `booking`: appointment CRUD, availability checks, buffer-aware conflict detection, Redis lock
- `shopping`: template items + BullMQ weekly suggestion jobs
- `inbox`: unified conversation/message APIs
- `connectors`: adapter interface, stub connector, inbound webhook simulator
- `catalog`: tenant-scoped staff/services/clients
- `dashboard`: owner/staff daily summary
- `realtime`: WebSocket gateway for inbox and appointment updates

## Booking Engine

- Staff availability rules: recurring day-of-week windows
- Staff exceptions: date-based blocked windows/full-day blocks
- Conflict detection:
  - Requested slot expanded by service buffers
  - Existing slots expanded by their service buffers
  - Overlap check inside transaction
- Double-booking protection:
  - Redis lock per staff + slot before transactional create/reschedule

## Smart Shopping List (No Inventory Counts)

- Template items store optional `avgUsagePerService`.
- Weekly job scans upcoming 7-day appointments.
- Suggested quantities are generated and written to `ShoppingListItem`.
- Suggestions can also be queued manually via API.

## White-Labeling

- Studio branding fields: logo, colors, theme JSON, custom domain, email sender domain, stripe connect id.
- Next.js runtime loads tenant theme via API (`/studio/theme`) and applies CSS variables.
- Tenant slug propagated in middleware via `x-studio-slug`.

## Realtime

- WebSocket namespace: `/ws`.
- Clients join `studio:{studioId}` room.
- Events:
  - `appointment.updated`
  - `inbox.updated`

