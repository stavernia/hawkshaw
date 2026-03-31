# Hawkshaw Build Plan v1

This document defines the implementation order for Hawkshaw and the intended workflow for future
Codex passes.

## Build Philosophy

Hawkshaw should be built in staged passes. Avoid trying to build the full app in one implementation
burst.

Separate:

- project scaffolding
- domain modeling
- feature implementation
- prototype content authoring

## Required Docs

- `README.md`
- `bible.md`
- `00-build-plan.md`
- `01-structure-framework.md`
- `02-game-systems-overview.md`
- `03-prototype-requirements.md`
- `decisions.md`
- `todo.md`

## Stages

### Stage 0: Docs framing

- establish and normalize docs
- preserve source-of-truth planning material
- start the decision log and TODO list

### Stage 1: Scaffold and conventions

- app shell
- folder structure
- TypeScript and lint baseline
- Supabase plumbing
- Prisma infrastructure
- auth shell
- route structure
- shared UI primitives
- docs-aware workflow

### Stage 2: Domain model and backend shape

- define core entities
- add first real Prisma models
- set seed and dev-data strategy
- introduce service and API contracts

### Stage 3: Host MVP

- create game
- assign players
- define rooms
- generate QR codes
- run phases and reveal

### Stage 4: Player MVP

- join game
- access role info
- view goals, clues, and inventory
- access player list and accusations

### Stage 5: Interaction systems

- room actions
- player actions
- deterministic resolution
- action budgets
- clue and item delivery

### Stage 6: Finale and reveal

- accusation submission
- scoring
- reveal screens

### Stage 7: Prototype scenario content

- author the first playable scenario after systems exist

