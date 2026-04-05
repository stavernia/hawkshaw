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

## 2026-04-02 - accepted

Decision:
Use stage-only header context, goal-first player navigation, and query-driven host subpages.

Context:
The player header was duplicating lifecycle state with both stage and a second status label, while
the player tabs were burying goals inside role content and spending space on explanatory copy. The
host surface also still behaved like a long dashboard when the operational need is to jump directly
between focused areas.

Consequences:

- Shared app headers now show the scenario title and current stage only.
- Player navigation now prioritizes `Overview`, `Goals`, `Characters`, and `Inventory`, with
  overview combining event, location, and character context into a single onboarding-style page.
- Trade requests now live under `Actions`, and low-signal card descriptions are reduced.
- Host menu items switch focused subpages through the route query, reducing scroll travel during
  live play.

## 2026-04-04 - accepted

Decision:
Ensure every player starts with at least a minimal private read on every other character, using
fallback relationship notes whenever authored knowledge entries are missing.

Context:
The player dashboard was surfacing empty-state copy like "you have no private read on this
character yet" for some character pairs. That made the scenario feel incomplete at first open and
worked against Hawkshaw's core job of orienting players with usable social context from the start.

Consequences:

- The player dashboard service now synthesizes one lightweight "first read" per missing
  viewer-to-subject relationship.
- Explicit authored private knowledge still takes precedence over the fallback text.
- This remains a player-facing presentation rule only; it does not add new persisted knowledge or
  change clue/goal mechanics.

## 2026-04-04 - accepted

Decision:
Keep Act 1 character goals live at scenario start by avoiding pre-solved starting clues, and widen
 early sabotage suspicion so Jack's blackout is not readable only through one narrow path.

Context:
The first full scenario review showed that some players began Act 1 with one of their own central
 goals already satisfied, which undercut the opening play loop. It also showed that the blackout
 thread was too dependent on Eleanor or Jack reaching the Basement before other players could form
 any meaningful suspicion.

Consequences:

- Eleanor and Sofia now start with softer orientation clues rather than direct answers to their
  own Act 1 investigation goals.
- Daniel's dagger goal text now matches the actual scoring condition instead of implying an
  unsupported alternate success path.
- A broader Act 1 clue route now points toward Jack's suspicious interest in the blackout timing.

## 2026-04-04 - accepted

Decision:
Use the configured app URL for auth callback redirects instead of the current browser origin.

Context:
Magic-link and OAuth sign-in were building callback URLs from `window.location.origin`, which caused
emails opened from a local dev session to point back to localhost instead of the intended app
domain.

Consequences:

- Auth redirects now use `NEXT_PUBLIC_APP_URL` as the canonical callback base.
- Local and hosted environments need that env var aligned with the intended app URL.
- Supabase redirect allowlists must include the configured callback domain.

## 2026-04-04 - accepted

Decision:
Add a player-facing "How To Act" section to role overview content so first-time players get a clear
 performance target, not just lore and goals.

Context:
For live prototype play, players often need a quick handle on tone and behavior before they can
 make good use of their goals and knowledge. The overview already orients them narratively, but it
 did not yet give them a concise acting guide for the role.

Consequences:

- Each prototype role now includes short performance guidance, an inspiration line, a quirk, and
  a few play tips in the scenario definition.
- The player Overview tab now shows a dedicated "How To Act" card.
- This is guidance only; it does not affect game logic or scoring.

## 2026-04-04 - accepted

Decision:
Synchronize the persisted seeded prototype scenario with the authored scenario definition on read,
instead of assuming the database copy is always current.

Context:
Scenario content is changing rapidly during prototype iteration. New clues, renamed characters, and
updated goals can leave an older seeded scenario in the database missing authored records that the
runtime now expects, which caused Act 1 startup to fail when a new starting clue code had no
persisted match.

Consequences:

- `ensurePrototypeScenario()` now repairs and updates the existing seeded scenario in place.
- Content-only scenario changes no longer require manually wiping the seed before testing.
- Existing games keep stable foreign keys where possible because records are updated by code rather
  than replaced wholesale.

## 2026-03-31 - accepted

Decision:
Model Hawkshaw MVP content as a seeded scenario definition plus mutable game instance state, with
player knowledge stored separately from clues.

Context:
The first playable pass needs reusable structure for future scenarios without spending time on a
full authoring system. The MVP also needs personalized player detail views that show what a viewer
knows about another player without making all knowledge into globally shared clues.

Consequences:

- Prisma now separates authored scenario records from runtime game records.
- A single seeded prototype scenario can drive local playtesting while preserving future multi-scenario expansion.
- Player-facing clue lists and personalized knowledge views can evolve independently.

## 2026-03-31 - accepted

Decision:
Implement MVP action resolution through explicit deterministic service handlers instead of a generic
rules engine.

Context:
The prototype needs working Search Room, Eavesdrop, Pickpocket, Trade, Plant Item, phase
transition, accusation, and reveal flows quickly. A generic engine would add abstraction cost
before the rule set is stable.

Consequences:

- Core game mutations live in focused server-side handlers.
- Room results are authored as ordered deterministic payloads.
- More generic trigger/rules infrastructure remains deferred until after playtesting.

## 2026-03-31 - accepted

Decision:
Use stage terminology aligned to live-mystery play structure: `setup`, `act`, `event`, `finale`,
and `resolution`, instead of exposing `pregame`/`phase` terminology in the MVP domain.

Context:
The player and host experience is character- and performance-oriented. Product language should
match how the game is run in person, and this pass is already reshaping both the backend schema and
the mobile-first player flows.

Consequences:

- Prisma and service-layer lifecycle naming now align with the product vocabulary.
- Host controls and player UI can present act/event terminology without translation gaps.
- Future scenario content can add additional acts/events while preserving the same stage-oriented
  model.

## 2026-03-31 - accepted

Decision:
Treat host controls as game-owner scoped operations, using `Game.createdByUserId` as the source of
truth for host authorization.

Context:
The prototype supports authenticated players and a separate host surface. Once outside solo local
testing, signed-in test players should not be able to see or operate another person's host controls
just because they know the route.

Consequences:

- The host page resolves only the signed-in user's active prototype game.
- Host mutations validate ownership server-side before changing roster, stage, or reveal state.
- Dev-only view-as links remain available only through the authorized host surface.

## 2026-03-31 - accepted

Decision:
Avoid request-wide proxy-based auth for MVP page rendering. Keep auth checks in the routes and
server actions that actually need them, and reduce navigation latency by keeping player tab changes
client-side.

Context:
The proxy-auth header experiment still imposed an auth round trip on every protected navigation,
while the player dashboard was also doing full server navigations for simple tab changes. That
produced a poor baseline for a mostly mobile, interaction-heavy app.

Consequences:

- `/host`, `/player`, and `/room` now authenticate directly in the route rather than through a
  request-wide proxy layer.
- Mutating actions still use the existing server-side auth helpers for authoritative checks.
- Player tab changes no longer trigger new server requests, which reduces perceived latency during
  play.

## 2026-03-31 - accepted

Decision:
Keep host-controlled character switching on the player surface local once the initial dashboard is
loaded, and preload the host’s other seat dashboards into the same response.

Context:
Even after moving player tabs client-side, switching between host-controlled characters still paid
the full dynamic route cost on every click. That kept host testing and live operational control too
slow for a mobile-first game flow.

Consequences:

- The initial host-controlled player load now bundles the other seat dashboards for that game.
- Switching between host-controlled characters on the player surface no longer requires a fresh
  server navigation.
- Regular player sessions still use a single dashboard payload and unchanged route-level auth.

## 2026-03-31 - accepted

Decision:
Use session-based Supabase reads for page-level auth checks, while keeping `getUser()` for
authoritative server actions.

## 2026-04-02 - accepted

Decision:
Represent prototype secrets as authored scenario metadata and keep Victor playable after death by
excluding him from accusation targets rather than introducing a full life-state system.

Context:
The mountain-cabin prototype needs a sharp distinction between hidden scenario truths and
player-facing clues, but it still needs to stay lightweight enough to ship as seeded content this
weekend. The same prototype also needs Victor to continue supplying perspective in Act 2 without
making him a valid suspect after the murder.

Consequences:

- Scenario definitions now carry author-only secret metadata that documents the intended truth and
  clue mapping without adding new Prisma tables.
- Player-facing clue and action systems stay unchanged while gaining richer authored content.
- Finale accusation targets now filter out Victor after Event 1 instead of relying on a new
  alive/dead role-state model.

## 2026-04-03 - accepted

Decision:
Gate player-facing narrative and mechanics by stage instead of showing future event or finale
information during setup and Act 1.

Context:
The overview surface was showing the murder-event copy before the murder had happened, Act 2 role
briefings could appear during setup, and finale-only mechanics like accusations were visible too
early. That breaks the core live-mystery requirement that information unlock over time.

Consequences:

- Player overview copy is now stage-aware, with separate setup, Act 1, Event 1, Act 2, finale, and
  resolution text.
- Act 2 role briefings only appear once the event has happened.
- The Daniel decision is limited to Act 1, and accusations are limited to the finale both in the UI
  and server-side validation.

## 2026-04-04 - accepted

Decision:
Write player overview and orientation content from the current character's perspective, with
explicit stage-by-stage role briefings instead of neutral scenario copy.

Context:
The player surface was still relying too heavily on generic scenario text and private role
descriptions. That made setup and Act 1 feel under-oriented, and it led to phrasing that implied
future plot knowledge instead of telling a player what they understand right now and what they
should do next.

Consequences:

- Each role now carries stage-specific briefings that explain the player's current situation and
  next steps in setup, Act 1, Event 1, Act 2, and finale.
- The Overview tab now foregrounds who the player is, what they already know, what they know about
  others, and what they should do now.
- Player-facing copy should avoid implying future certainty unless that information has already been
  revealed in the game state.

Context:
Dynamic page navigations were still paying a live Supabase Auth network request on each render.
That created visible navigation latency and occasional auth fetch timeouts on simple hops like room
to player dashboard.

Consequences:

- Read-only page routes now use cookie-backed session reads instead of live auth validation.
- Server actions still perform authoritative auth checks before mutating game state.
- Navigation between protected pages is less dependent on Supabase Auth round-trip latency.

## 2026-03-31 - accepted

Decision:
Keep `Event 1` as a real intermediate game stage, and preserve seat-level goal state when a player
is removed or reassigned during setup.

Context:
The host flow explicitly models `Act 1 -> Event 1 -> Act 2`, so event triggering should not skip
past the event stage. Separately, seats are the runtime containers for character state; removing a
player from a seat during setup should clear the human assignment, not destroy the character seat's
goal structure.

Consequences:

- Triggering the event now moves the game into `EVENT_1`, and `Start Act 2` remains a meaningful
  host control.
- Setup-time player removal keeps the seat's role-based goal state intact for the next assignee.
- Joined-player reassignment is treated as moving humans between existing character seats rather
  than recreating the seats themselves.

## 2026-03-31 - accepted

Decision:
Use `/host` as the host game index and scope runtime views under `/g/[gameId]/...`, with
`/g/[gameId]/host`, `/g/[gameId]/player`, and `/g/[gameId]/room/[code]` as the primary in-app
routes.

Context:
Inferring a single “current host game” made the prototype confusing once resets, recreated games,
and multiple test runs existed. The game itself is the primary object, so host/player/room views
should be explicit projections of one selected game rather than global surfaces guessing context.

Consequences:

- `/host` now lists the signed-in host's games and launches a specific game control room.
- Internal app navigation uses stable `gameId`-scoped routes, while `/join/[code]` remains the
  public player entry point.
- Legacy `/player` and `/room/[code]` routes can act as convenience redirects, but the scoped `/g`
  routes are the source of truth moving forward.

## 2026-03-31 - accepted

Decision:
Use host-only character inspection for solo/dev testing instead of fake demo users or demo-seat
autofill.

Context:
Once the host could open player views directly, the demo-user layer no longer added meaningful MVP
value. It made the seat/character model harder to understand and leaked `Open Seat` / `Demo`
states into the character switcher.

Consequences:

- Demo user generation and autofill controls are removed.
- Host character switching now relies on the existing game seats rather than fake users.
- The character switcher only shows real character entries in slot order, which keeps the testing
  surface closer to the actual game model.

## 2026-03-31 - accepted

Decision:
Treat host-controlled character play as a normal game capability, not a development-only override.
Allow the host to open and operate unclaimed or claimed character seats directly when covering
NPCs, no-shows, or operational assistance.

Context:
The prototype originally framed host seat switching as a solo-testing tool. In practice, live games
may also need the host to pre-stage unclaimed roles, temporarily cover missing players, or step
into a character to perform operational fixes without requiring a separate email/account.

Consequences:

- Host character control is now gated only by game ownership, not by environment.
- Act 1 can begin even if some seats are still unclaimed by authenticated players.

## 2026-03-31 - accepted

Decision:
Instantiate seats with characters at game creation, and treat player assignment as attaching a
user or reserved email to an existing character seat rather than assigning roles into blank seats.

Context:
The product model is now explicit: `User` is the human account, `Character` is the authored
scenario identity, and `Seat` is the game-instance runtime container. The old flow still implied
that seats began blank and were later given roles, which no longer matches the intended host
experience or future multi-act seat evolution.

Consequences:

- Every created game now starts with one seat per scenario character, already linked to that
  character.
- Open means "no user attached yet," not "no character assigned yet."
- Host setup is centered on assigning player emails or joined players to character seats.
- The current MVP still uses a direct `seat -> user` and `seat -> character` model; staged
  seat-to-character reassignment across acts remains deferred.

## 2026-03-31 - accepted

Decision:
Render the host character roster as a mobile-first stack of compact character cards rather than a
table-style operator grid.

Context:
The host roster is part of a mostly mobile game flow. Table-like rows and wide multi-column layouts
made the roster hard to scan on smaller screens and created bloated, awkward horizontal control
regions.

Consequences:

- The host roster now prioritizes narrow, vertically efficient character cards with constrained
  content width.
- Secondary controls such as email reservation only appear when relevant for an open seat.
- Desktop can still read cleanly, but mobile card composition is now the source of truth.

## 2026-04-01 - accepted

Decision:
Treat `Event 1` as a true pause state for app-driven interaction. New actions and Act 2 goals only
become available when the host explicitly starts `Act 2`.

Context:
The product flow now distinguishes `Act 1`, `Event 1`, and `Act 2` as separate beats. If the app
refreshes actions or activates Act 2 goals during `Event 1`, the host control flow becomes
cosmetic and players can continue acting through what should be a narrative pause.

Consequences:

- Room and player-target actions are blocked during `Event 1`.
- Triggering the event only applies event-state updates and clue awards.
- Starting `Act 2` is the activation point for new action budgets and Act 2 goal state.
- Decision timing remains intentionally underbuilt for now and is not stage-gated in this pass.

## 2026-04-02 - accepted

Decision:
Use a mood-first teaser landing page for Hawkshaw, centered on the logo, minimal copy, and a dark
flashlight-reveal interaction rather than a scaffold/product explainer homepage.

Context:
The previous homepage described the scaffold and route shells clearly, but it did not establish the
tone of Hawkshaw as a live social mystery experience. The public landing page should create
intrigue first and leave detailed product explanation to later marketing material and the signed-in
app surfaces.

Consequences:

- The homepage now prioritizes atmosphere, brand, and a handful of teaser fragments over feature
  sections and route links.
- Desktop uses a pointer-driven flashlight reveal, while mobile falls back to an ambient central
  spotlight.
- The public landing page intentionally minimizes product detail in favor of mystery and tone.

## 2026-04-02 - accepted

Decision:
Standardize Hawkshaw on Node 24 across local development, CI, and Vercel-facing repo config, while
keeping dependency updates pragmatic instead of forcing simultaneous major-version migrations.

Context:
The repo had drifted into an inconsistent runtime state: package engines allowed Node 20-22, CI
installed Node 20, and Vercel project settings were already targeting Node 24. That mismatch makes
deploy behavior harder to reason about and produces avoidable Vercel warnings. At the same time,
the package graph now has newer major releases available, but moving Prisma, Tailwind, TypeScript,
and ESLint to new major lines is a separate migration effort rather than a safe runtime fix.

Consequences:

- `package.json` now targets Node 24 for local and hosted builds.
- CI now installs Node 24.
- `.nvmrc` points local development at Node 24.
- Same-line dependency updates can move with runtime alignment, but broad major-version upgrades
  should be handled in a dedicated pass with migration work and validation.

## 2026-04-02 - accepted

Decision:
Keep authenticated users in a session-aware navigation state across marketing and app surfaces, and
standardize player/host chrome around a compact shared header.

Context:
The previous shell treated the landing page as permanently anonymous and duplicated separate
player/host headers across layouts. In practice that made signed-in users feel logged out when they
 bounced to `/`, and it kept top-level navigation inconsistent between player and host routes.

Consequences:

- `/login` now redirects authenticated users back into the app instead of re-presenting sign-in.
- The landing page now renders an authenticated entry CTA when a session is present.
- Player and host surfaces now share a compact header with logo branding, scenario/state context,
  a profile menu for `Lobby` and `Sign out`, and a separate surface-switch button when relevant.

## 2026-04-02 - accepted

Decision:
Treat player section navigation as a mobile-first bottom rail on phones, while keeping inline tabs
for larger screens.

Context:
The player surface is used primarily on mobile during live play. Keeping section navigation high in
the page costs vertical space and makes repeated tab changes harder to reach one-handed.

Consequences:

- On mobile, player section navigation now stays fixed near the bottom edge for thumb access.
- The top character card is shorter because it no longer needs to permanently carry the section
  rail on phones.
- Desktop and tablet retain the inline tab row near the character header.

## 2026-04-04 - accepted

Decision:
Version-gate prototype scenario synchronization and keep session and authenticated-user auth reads
separate.

Context:
The cabin prototype content now changes frequently, so existing games need a way to repair their
persisted seeded scenario records after content updates. Re-running the full sync on every host read
fixed drift but made host navigation unacceptably slow. At the same time, changing the session helper
to always call `getUser()` removed a Supabase warning but made every optional session check take the
full authenticated-user path.

Consequences:

- `ensurePrototypeScenario()` now short-circuits once the persisted seeded scenario has been synced
  to the current authored version, and only reruns the heavier repair pass when that version key
  changes.
- Host and player pages that gate access now use `requireCurrentUser()` so protected app surfaces
  still verify the authenticated user with Supabase.
- `getCurrentSessionUser()` once again performs a session read, keeping optional session-aware
  surfaces lighter and semantically correct.

## 2026-04-04 - accepted

Decision:
Treat room eavesdrop results as overheard information about other people, not a way to surface the
acting player's own thread back to them.

Context:
The room action system was cycling through a shared list of authored eavesdrop results without any
awareness of who was taking the action. That meant players could spend an action to eavesdrop and
receive clues that were effectively about their own private plotline, which undermined the fantasy
of overhearing someone else.

Consequences:

- Prototype room results can now exclude specific role codes from receiving a given overheard
  result.
- The room action selector skips those excluded results for the acting participant while keeping the
  same basic deterministic room-action model.
- Authored Act 1 eavesdrop beats that clearly belong to Jack, Daniel, Marcus, Eleanor, or Sofia now
  avoid returning to those same roles.

## 2026-04-04 - accepted

Decision:
Add a dedicated Overview onboarding block with concrete starter hints for each role in Setup and
Act 1.

Context:
Even with clearer goals and character framing, first-time players were still asking where to begin
 once they opened the app. Goals explain what matters, but they do not always give the first
 practical move that gets a player into the social and room-action loop.

Consequences:

- Role stage briefings can now include `starterHints` alongside the broader summary and next steps.
- The Overview tab now shows a `Where To Start` section when hints are available.
- Setup and Act 1 role content now gives each character a few concrete opening moves tied to rooms,
  people, items, or pressure points.

## 2026-04-04 - accepted

Decision:
Only present currently valid player and room actions in the prototype UI, instead of letting users
submit actions that are known to fail.

Context:
Live play surfaced two rough spots: pickpocket could target characters with nothing stealable, and
room pages could still offer search/eavesdrop buttons after a room had no result left for that act.
Both cases pushed players into server-action errors instead of guiding them toward the remaining
play space.

Consequences:

- Pickpocket targets are now limited to players currently holding at least one stealable item.
- Room pages now compute whether search or eavesdrop has a valid remaining result for the acting
  role and current act, and disable the buttons when not.
- The room UI now explains action availability so players understand why a button is disabled.

## 2026-04-04 - accepted

Decision:
Raise the cabin prototype action budget to 8 actions per act.

Context:
Live play showed that the previous action budget was too tight for players who were still learning
the app and the scenario at the same time. The prototype benefits more from giving players enough
room to explore rooms, items, and social moves than from strict scarcity.

Consequences:

- Act 1 and Act 2 now each grant 8 actions per player.
- The seeded scenario sync version was bumped so existing games update to the new budget instead of
  staying on the earlier cached definition.
