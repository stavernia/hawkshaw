# Hawkshaw Player App Screens Spec

Pre-implementation spec for the player-facing mobile UI.

## Design Principles

- Mobile first. Players are at a party, drink in hand.
- One job per screen. Readable in 5 seconds, actionable in 10.
- The app is a game master, not a game board — it knows what the player needs and
  delivers it at the right moment.
- Never hide unavailable actions. Show them grayed with a reason.

## Global Structure

### Header (persistent)

- Phase indicator: color-coded pill showing current phase
  (Setup, Act 1, Event, Act 2, Finale, Resolution)
- Character name or avatar
- Subtle color shift per phase — ambient awareness without interrupting play

### Tab Bar (bottom, 5 tabs)

ME · GRID · WORLD · ACTIONS · MESSAGES

---

## Tab: ME

**Purpose:** Your character sheet. Everything about you in one place.

**Content:**

- Character name, title, short personality blurb
- Secrets — what you know, what you're hiding
- Items — what you're carrying
- Abilities — what you can do, how many uses remain
- Goals — what you're working toward, with progress indicators
- Where to start — a contextual hint pointing to your first goal and first action

**Phase behavior:**

- Setup: hero screen, full backstory visible, goals prominent
- Act 1: goals + secrets primary, where-to-start hint visible
- Act 2: goals updated with new objectives, hint updated

**Design note:** This is the first screen players see. Must be readable cold in under
60 seconds with zero verbal explanation from the host.

---

## Tab: GRID

**Purpose:** Personal deduction matrix. The game-within-the-game.

**Hidden until the Event fires.** Before the Event, this tab either does not exist or
shows a locked state: "Unlocks when the murder occurs."

**Content:**

- Rows: all suspects (all players)
- Column groups: weapon types, location categories, motive types, traits
- Cells:
  - Empty — no information
  - Dot (solid) — active CON connection
  - Dot (faded) — `before`-scoped CON connection (pre-murder only)
  - Crossed — ELIM confirmed (node removed from game)
  - Struck through — `invalidated` (motive dissolved by Decision)

**Behavior:**

- Grid is personal — each player's grid looks different
- CON clues auto-populate dots when received
- ELIM clues auto-cross nodes when received
- Revelation available when a full category column is eliminated —
  shows a "Reveal" prompt on that column header

**Design note:** This is the Act 2 primary screen. Must work with one thumb in a
dim room. Avoid landscape-only layouts. Consider card-per-suspect with expandable
category rows rather than a wide table.

---

## Tab: WORLD

**Purpose:** Where am I, who else is here, what is happening.

**Content — Setup phase (hero):**

- Backstory: why everyone is here, the premise
- Venue description
- Character roster: everyone's public name and role

**Content — Act 1+ (secondary):**

- Backstory collapses to a single expandable section
- Rooms list — each room has a Scan QR button to enter
- Character roster — tap any character to see public info
- Phase notes — what the current phase means, any public announcements

**Phase behavior:**

- Setup: backstory is the dominant element
- Act 1 onward: rooms list moves to top, backstory secondary

---

## Tab: ACTIONS

**Purpose:** What you can do right now.

**Content:**

- List of available actions with clear labels and descriptions
- Each action shows: what it does, what it costs (action budget), what it requires
- Unavailable actions visible but grayed, with a reason:
  - "Requires being in a room — scan a room QR code first"
  - "Not available until Act 2"
  - "You have no actions remaining this phase"
- Action budget indicator: X of Y actions used this phase

**Available actions (prototype):**

- Search Room — requires room entry via QR, consumes 1 action
- Eavesdrop — requires room entry, consumes 1 action
- Trade Info — target another player, bilateral, consumes 1 action each
- Interrogate — target another player, costs 1 action for both
- Use Ability — character-specific, limited uses
- Make Revelation — free action, only available when category is fully eliminated

**Design note:** This is the most-tapped screen during active play. Keep it scannable.
Action labels must be self-explanatory — no tooltips or help text required.

---

## Tab: MESSAGES

**Purpose:** What you've been told. Your information log.

**Content:**

- Host broadcasts — phase change announcements, Event broadcast, public Revelations
- Clue deliveries — every clue gained by action appears here automatically
- Intel trades — formal info shared by other players lands here
- Trade history — what you've given, what you've received

**Behavior:**

- New messages badge on tab
- Chronological, newest first
- Clue deliveries auto-link to the relevant cell in GRID

---

## Key Moments — Full Screen Interrupts

These override the tab bar entirely:

### Event (Murder)

- Full screen takeover, all phones simultaneously
- Dramatic: "Victor Hale has been found dead in the study"
- Phase color shifts
- ELIM clues broadcast listed
- GRID tab unlocks
- 10-second moment, then returns to tab bar

### Decision (End of Act 1)

- Full screen for the decision-maker only
- Shows: the decision, both options, what you've learned that's relevant
- Cannot be dismissed without choosing
- Influencers see: "Waiting for [Decision Maker] to decide..."

### Revelation

- Confirmation screen before broadcasting
- "You've confirmed [category] is eliminated. Reveal for 2 points? This will broadcast to all players."
- Confirm / Hold for now

### Finale — Accusation

- Structured form: select suspect, weapon, location, motive
- Cannot submit without all four
- Confirmation before submitting

---

## Phase-Aware Rendering Summary

| Tab      | Setup                 | Act 1           | Act 2         | Finale          |
| -------- | --------------------- | --------------- | ------------- | --------------- |
| ME       | Hero — full backstory | Goals + secrets | Updated goals | Locked          |
| GRID     | Hidden                | Hidden          | Unlocked      | Read-only       |
| WORLD    | Backstory hero        | Rooms primary   | Rooms primary | Rooms primary   |
| ACTIONS  | Disabled              | Full            | Full          | Revelation only |
| MESSAGES | Host setup notes      | Active          | Active        | Broadcast only  |
