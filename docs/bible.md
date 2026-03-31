# Hawkshaw Bible

This document captures the stable product and implementation rules that future Hawkshaw work should
treat as locked unless explicitly changed.

## Product Framing

- Hawkshaw is a live, app-powered, in-person social mystery game platform.
- The platform should be architected as a reusable social intrigue engine first, not a single
  hardcoded murder mystery app.
- The app exists to manage timing, private information, actions, room state, and reveal flow while
  pushing players back into real-world interaction.

## MVP Frame

- Prototype target: 6 players, about 2 hours, one host, one active game at a time.
- Core gameplay loop is hybrid:
  - room actions come from QR-linked room routes
  - player actions come from in-app player targeting
- The first scaffold pass must avoid implementing full game logic or scenario content.

## Engineering Rules

- Preferred stack: Next.js App Router, TypeScript, Tailwind, Prisma/Postgres, Supabase Auth/Storage,
  Zod, Zustand.
- Keep dependencies tight and well-adopted.
- Preserve custom code for the specialized bracket-like game logic that will come later.
- Update docs when architecture, routes, naming, or product behavior changes.

## Scaffold Rules

- Use Supabase for Postgres, Auth, and Storage.
- Use Supabase Auth directly instead of NextAuth.
- Enable Google OAuth plus email magic link in the scaffold.
- Keep Prisma scope infrastructure-only for now.
- Stay compatible with future RLS, but defer policy design.
- Do not build around Realtime yet.

