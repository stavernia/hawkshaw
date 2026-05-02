# Hawkshaw Clue System Spec

Pre-implementation spec for the clue system. Once implementation ships, distill final decisions
into `docs/decisions.md`.

## Clue Data Model

Every clue has the following fields:

```typescript
type ClueType = "CON" | "ELIM";
type TemporalScope = "before" | "after" | "throughout";
type ClueSource =
  | "starting_hand"
  | "search_room"
  | "eavesdrop"
  | "interrogate"
  | "trade"
  | "event_broadcast"
  | "act2_unlock";

interface Clue {
  id: string;
  type: ClueType;
  act: "act1" | "event" | "act2";
  source: ClueSource;
  surfaceText: string; // what the player reads — social, in-fiction
  // For CON clues:
  suspectId?: string; // which suspect is being connected
  nodeId?: string; // which node they're being connected to
  // For ELIM clues:
  eliminatedNodeId?: string; // which node is removed from the space
  temporalScope?: TemporalScope;
  isAnswerNode?: boolean; // true if this is part of the solution
}
```

## CON Clue Rules

- All CON clues are TRUE. Never write a false CON clue.
- Surface text reads as social observation, not forensic evidence.
- Multiple suspects may connect to the same node — that is intentional.
- The killer's answer-node connections must be discoverable through CON clues, but spread
  across different players' starting hands so no single player starts knowing the full answer.
- CON clues primarily appear in Act 1 starting hands and Act 1 actions.
- A small number of CON clues (4 in prototype) remain discoverable in Act 2 — these confirm
  the killer's answer connections and are the reward for active investigation.

## ELIM Clue Rules

- Each ELIM clue removes exactly one node. No exceptions.
- ELIM clues do not name suspects. They only say what cannot be true.
- Event ELIM clues broadcast to all players simultaneously when the host triggers the Event.
- Act 2 ELIM clues are gated behind actions: room search, interrogation, eavesdrop.
- Minimum ELIM clues to reach the answer: 11 (prototype). Total available: 16. Surplus: 5.

## Distribution Rules

### Starting hands

Each player starts with exactly 3 CON clues. No player starts with an ELIM clue.

The three answer-node CON clues (killer → answer weapon, killer → answer location,
killer → answer motive) must be spread across three different players' starting hands.
No player starts with more than one answer-node CON clue.

The killer's starting hand contains only misdirection CON clues — all true, all pointing
away from themselves. The killer has no answer-node connections in their starting hand.

### Action clues

Room searches return one clue per search. The clue type and target is fixed per room per
scenario — searching the same room always returns the same clue.

### Event clues

2 ELIM clues broadcast to all players at the Event. These should collapse a weapon type
(e.g. eliminate both gun nodes) or confirm a major location exclusion. They reset everyone's
grid and create the Act 2 momentum.

## Revelation Trigger

A Revelation becomes available to a player when they have personally confirmed the elimination
of all nodes in a category (e.g. all 3 gun types, or all 3 nodes in the downstairs category).

The player must actively choose to Reveal — it is not automatic. When they do:

- Points awarded to that player
- A broadcast fires to all players: "[Player] has confirmed: [category] is eliminated"
- That category column crosses off on every player's grid

Revelation cooldown: one per player per 15 minutes maximum to prevent dumping.

## Temporal Scope Implementation

When a CON clue has scope `before`:

- The dot appears on the player's grid as a hollow/faded dot (visual distinction from solid)
- Label: "seen before the murder"
- An ELIM clue can reference a `before`-scoped connection to formally clear it:
  e.g. "P3 was confirmed elsewhere at the time of the murder" → removes P3/Location from active

When the Decision fires, it may `invalidate` specific suspect→motive connections:

- That connection moves from active to `invalidated` state
- Visually: struck through on the grid
- This is not the same as ELIM — the motive node may still exist for other suspects

## Scenario Design Checklist

When authoring a scenario, verify:

- [ ] Answer key defined: killer + weapon + location + motive + trait
- [ ] Every suspect has at least 2 weapon connections, 2 location connections, 2 motive connections
- [ ] No suspect other than the killer connects to all 3 answer nodes simultaneously
- [ ] Answer-node CON clues are split across 3 different starting hands
- [ ] Killer's starting hand contains 0 answer-node connections
- [ ] Minimum 11 ELIM clues available to reach answer
- [ ] ELIM clues are spread across at least 4 different action sources
- [ ] At least 2 Revelation opportunities exist (full category elimination possible)
- [ ] Decision branch defined with at least 1 motive invalidation outcome
