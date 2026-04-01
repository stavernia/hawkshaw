# Process

Hawkshaw uses a hybrid process baseline:

- StoryCore-style documented review, delivery, and docs rules
- Mad Brackets-style repo automation assets such as CI, PR template, and Changesets

## PR Review Gate

All PRs should be gated on review before merge. Lint, unit tests, typecheck, and build should all
pass for changes that touch shipped code.

### Required Review Inputs

PR author should provide:

- feature intent
- how to test
- known tradeoffs or shortcuts
- docs touched or explicitly confirmed unchanged

### Two-Pass Review Method

Every review should cover:

- correctness and product intent: behavior match, loading and error states, data consistency,
  auth/access boundaries, and regressions to host/player flows
- engineering quality: naming clarity, duplication, docs alignment, test adequacy, and unnecessary
  dependency or architecture churn

### Merge Rules

- no merge with open correctness issues
- no merge with failing quality checks for the impacted surface
- if a change materially affects behavior, routes, schema, API contracts, naming, or stack
  direction, update docs before merge
- if a tradeoff is intentionally accepted, record it in `docs/decisions.md`

## Local Commands

- Dev: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Unit tests: `pnpm test:unit`
- E2E tests: `pnpm test:e2e`
- Prisma push: `pnpm db:push`
- Prisma studio: `pnpm db:studio`
- Create changeset: `pnpm changeset`
- Apply version bump: `pnpm version-packages`
- Release helper: `pnpm release`

## Local Quality Check Flow

Use this sequence before opening or updating a PR:

1. Run lint: `pnpm lint`
2. Run unit tests: `pnpm test:unit`
3. Run typecheck: `pnpm typecheck`
4. Run build: `pnpm build`

Expected result:

- lint exits without errors
- unit tests exit cleanly for the impacted surface
- TypeScript exits without type errors
- build completes successfully in a normal local environment

## Documentation Rule

When product behavior, schema, routes, API contracts, naming, stack choices, or workflow
expectations change, update docs in this folder in the same branch.

## Decision Log vs Specs

`docs/decisions.md` is the post-implementation record of accepted tradeoffs and architecture
choices.

For pre-implementation design work on non-trivial features, create a spec in `docs/specs/`. Specs
can evolve during planning. Distill the final accepted decisions into `docs/decisions.md` once the
implementation lands.

## Delivery Philosophy

- keep libraries minimal and proven
- prefer explicit typed boundaries
- ship practical vertical slices
- add complexity only when product requirements require it
