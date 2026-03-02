# Security

## Tenant Isolation
- Application layer: controllers enforce role access with RBAC guards and use tenant-scoped queries.
- Database layer: PostgreSQL RLS policies require `app.current_tenant_id` and `app.current_studio_id` to match each row.
- Prisma helper: `PrismaService.withTenant()` wraps every business query in a transaction and sets the RLS context.

## Authentication
- Email/password with bcrypt hashing.
- JWT stored in httpOnly cookie `studioos_token`.
- Login requires `tenantId` and `studioId` to satisfy RLS on the `User` table.

## Roles
- OWNER, MANAGER, ARTIST, FRONT_DESK.
- Artists can only create/reschedule/cancel their own bookings.
- Payments actions are restricted to OWNER/MANAGER/FRONT_DESK.

## Audit Log
- Booking actions, payments, station assignments, and status changes write to `AuditLog`.

## Operational Notes
- Ensure `JWT_SECRET` is unique per deployment.
- Keep Stripe/Meta/Notion/GA modules disabled until credentials are configured.
