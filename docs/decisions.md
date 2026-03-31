# Hawkshaw Decisions

This file tracks architecture and product implementation decisions.

Format:

- Date
- Status (`accepted`, `proposed`, `deprecated`)
- Decision
- Context
- Consequences

---

## 2026-03-30 - accepted

Decision:
Scaffold Hawkshaw as a Next.js App Router application with TypeScript, Tailwind, shadcn-style UI
primitives, Prisma, Supabase, Zod-based env validation, and a docs-first implementation workflow.

Context:
Hawkshaw is starting as a new app but should inherit the modern process and structure that worked in
Mad Brackets, without copying over older auth or product-specific assumptions that no longer fit.

Consequences:

- The repo uses the `app/` plus `src/` split and route groups for major surfaces.
- Shared UI primitives live in reusable component modules rather than route files.
- Docs are a first-class implementation artifact in the same branch as code changes.

## 2026-03-30 - accepted

Decision:
Use Supabase for Postgres, Auth, and Storage, with Supabase Auth directly rather than NextAuth.

Context:
Hawkshaw already wants Supabase as its platform base. Adding a second auth abstraction layer would
increase complexity without clear MVP value.

Consequences:

- Auth scaffolding uses Supabase session helpers, callback handling, and protected route middleware.
- Google OAuth and email magic link are enabled in the initial auth plan.
- Password-based login is intentionally deferred.

## 2026-03-30 - accepted

Decision:
Keep the scaffold compatible with future Realtime and RLS usage, but do not build around either one
in the first pass.

Context:
Realtime and RLS are likely useful for live state sync and sensitive per-player data, but the
specific gameplay model and access patterns are not stable enough yet to design those layers well.

Consequences:

- Service and auth boundaries should stay clean enough to add RLS later.
- Realtime is not a prerequisite for the initial scaffold or MVP domain pass.

## 2026-03-30 - accepted

Decision:
Configure Prisma now, but keep the schema infrastructure-only instead of introducing gameplay models
in the scaffold.

Context:
The project needs production-minded database plumbing from day one, but the actual Hawkshaw domain
model should be decided in the next pass once the MVP entity shapes are specified.

Consequences:

- Prisma client and env wiring are available immediately.
- The first real gameplay schema remains deferred.
- Future model work can start from a clean base instead of unwinding placeholder domain tables.

## 2026-03-30 - accepted

Decision:
Adopt the Mad Brackets process starter baseline for Hawkshaw, including a full root ignore file,
Changesets, CI, PR template, script scaffolding, and unit-test scaffolding, while excluding
Mad Brackets-specific operational scripts and product automation.

Context:
The app scaffold should inherit not just the stack but also the working process baseline that keeps
repo hygiene, review quality, and release discipline consistent across projects.

Consequences:

- Hawkshaw now has a stronger `.gitignore`, CI workflow, Changesets config, PR template, and starter
  script/test folders.
- Repo process conventions transfer over without importing unrelated tournament-specific tooling.
- Build remains on `next build --webpack` for now as the safer default after Turbopack build issues
  in this environment.

## 2026-03-30 - accepted

Decision:
Use a hybrid process baseline for Hawkshaw: StoryCore’s documented review and delivery rules plus
Mad Brackets’ concrete repo automation assets.

Context:
StoryCore has the clearer written process for review gates, docs discipline, and delivery
philosophy, while Mad Brackets provides the stronger concrete repo starter pieces such as CI and PR
template files.

Consequences:

- Hawkshaw now treats `docs/process.md` as the primary process reference.
- CI, Changesets, PR template, and root repo hygiene stay close to the Mad Brackets baseline.
- Future pre-implementation feature planning has a dedicated `docs/specs/` home.

## 2026-03-31 - accepted

Decision:
Use Webpack-backed Next development and production builds in the scaffold instead of Turbopack.

Context:
Turbopack produced unstable behavior in this scaffold environment, including production build issues
and a persistent dev `Compiling...` state. The goal of the starter is predictable local iteration,
not maximum build novelty.

Consequences:

- `pnpm dev` now runs `next dev --webpack`.
- `pnpm build` stays on `next build --webpack`.
- Turbopack can be revisited later once the stack is more mature and stable for this project.
