# Hawkshaw

Hawkshaw is a SaaS-style web app for running live, in-person social mystery games.

This first pass is a scaffold only. It sets up the app shell, auth plumbing, docs workflow, and
route boundaries for the later MVP systems pass.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Supabase for Postgres, Auth, and Storage
- Prisma for database access
- Zod for environment validation

## Project Shape

```text
app/
  (marketing)/      Public landing shell
  (auth)/           Login + auth support pages
  (player)/         Player-facing protected shell
  (host)/           Host-facing protected shell
  auth/callback/    Supabase auth code exchange
  join/[code]/      Join flow placeholder
  room/[code]/      QR room placeholder
  api/health/       Simple health check

src/
  components/
  config/
  domain/
  features/
  lib/
  server/
  stores/

docs/
  README.md
  bible.md
  00-build-plan.md
  01-structure-framework.md
  02-game-systems-overview.md
  03-prototype-requirements.md
  decisions.md
  todo.md
```

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your Supabase project values.
3. Install dependencies:

```bash
pnpm install
```

4. Generate Prisma client and start the app:

```bash
pnpm dev
```

## Auth Setup

The scaffold assumes `Supabase Auth` with:

- Google OAuth
- email magic link / OTP sign-in
- no password login in the initial scaffold

Required Supabase dashboard setup:

- enable `Google` in Auth providers
- enable `Email` with magic links
- add local and production callback URLs for `/auth/callback`
- use your Supabase Postgres connection string for `DATABASE_URL` and `DIRECT_URL`

## Database Notes

- Prisma is configured now, but the gameplay schema is intentionally deferred.
- `prisma/schema.prisma` contains a tiny infrastructure-only placeholder model to validate the stack
  without freezing the Hawkshaw domain model too early.
- No migration is required to boot the current scaffold UI.
- If you want the placeholder Prisma table created in your Supabase database, run `pnpm db:push`
  after your env vars are set.

## Workflow Notes

- Treat [`docs/README.md`](./docs/README.md) as the doc index.
- Read `docs/README.md`, `docs/decisions.md`, and `docs/bible.md` before non-trivial changes.
- Follow [`docs/process.md`](./docs/process.md) for review gates, quality checks, and delivery rules.
- Update docs in the same branch whenever behavior, routes, naming, architecture, or stack choices
  change.

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:unit`
- `pnpm test:e2e`
- `pnpm db:generate`
- `pnpm db:push`
- `pnpm db:studio`
- `pnpm changeset`
- `pnpm version-packages`
