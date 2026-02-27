# Local Development

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

## 1) Start infrastructure

```bash
docker-compose up -d
```

Services:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## 2) Install dependencies

```bash
pnpm install
```

## 3) Configure environment

Copy `.env.example` to `.env` and adjust if needed.

Required defaults:

- `DATABASE_URL=postgresql://booking:booking@localhost:5432/booking?schema=public`
- `REDIS_URL=redis://localhost:6379`
- `JWT_SECRET=dev-secret`

Optional for web:

- `NEXT_PUBLIC_API_URL=http://localhost:4000`

## 4) Prepare database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Seed users:

- Owner: `owner@inkhouse.test` / `owner123`
- Manager: `manager@inkhouse.test` / `owner123`
- Staff: `maya@inkhouse.test` / `staff123`
- Staff: `leo@inkhouse.test` / `staff123`

## 5) Run app

```bash
pnpm dev
```

Default URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Local tenant host simulation

Use `inkhouse.localhost:3000` in your browser if your environment supports localhost subdomains.  
If not, app middleware defaults tenant slug to `inkhouse`.

## Useful flows to verify MVP

1. Login as owner.
2. Open Owner Dashboard and check multi-staff calendar + create appointment.
3. Open My Calendar and verify staff-scoped visibility.
4. Open Shopping page and trigger suggestion generation.
5. Open Inbox page and click `Simulate Inbound` to generate thread activity.

