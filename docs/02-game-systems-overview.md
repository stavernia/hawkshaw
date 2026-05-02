# Hawkshaw Game Systems Overview v2

This document defines the core game mechanics for Hawkshaw. It replaces the high-level v1
overview with the actual system design arrived at during prototype planning.

## The Core Loop

Gather information → Evaluate what it means → Act on it → See consequences → Repeat

Every mechanic should serve this loop. If it doesn't feed into it, cut it.

## Two-Track Deduction System

The murder solution is found by crossing two independent tracks:

**Track A — Node elimination (what happened)**
Players eliminate specific weapons, locations, and motives from the game's possibility space
entirely. This is independent of suspects. A node removed from the space is removed for everyone.

**Track B — Suspect connection (who could have done it)**
Players connect suspects to nodes throughout the game. Connections accumulate on each player's
personal grid and are private — different players see different connections.

**The accusation** is where tracks cross: take the surviving nodes from Track A, find the suspect
connected to all of them in Track B. That is the killer.

This means a player can know the weapon, location, and motive without knowing the killer. A player
can have strong connections on a suspect without knowing which nodes survived elimination. Both
tracks are required to accuse correctly.

## Node Space

Each scenario defines a node space across four categories:

- **Weapons** — categories (e.g. gun, knife, poison) with 2 specific nodes each
- **Locations** — categories (e.g. upstairs, downstairs, outside) with 2 specific nodes each
- **Motives** — categories (e.g. money, revenge, protection) with 2 specific nodes each
- **Traits** — 4 nodes, each either applies to a suspect or does not

Prototype node counts: 3 weapon categories × 2 = 6, 3 location categories × 2 = 6,
3 motive categories × 2 = 6, 4 traits = 22 total nodes.

One specific combination of weapon + location + motive + trait is the answer. All other nodes
are red herrings or elimination targets.

## Clue Types

All clues are one of two types. This distinction must be tracked in the data model.

### CON (Connection)

Links a specific suspect to a specific node. All CON clues are TRUE — they represent real
observations that a player makes. The surface text is social or observational (gossip, things
noticed at a party). The mechanical tag is suspect → node.

Multiple suspects connect to each node. The killer's true connections exist alongside red herring
connections for other suspects. Players cannot know which connections are meaningful until
elimination narrows the node space.

CON clues appear primarily in Act 1 but continue to be discoverable in Act 2.

### ELIM (Elimination)

Removes one specific node from the game's possibility space entirely. One removal per clue, always.
When a node is eliminated, it is crossed off on every player's grid simultaneously.

ELIM clues appear at the Event (broadcast to all players) and throughout Act 2 via actions.

## Temporal Scope

CON clues have a temporal scope field: `before`, `after`, or `throughout`.

- `before` — connection was true before the Event (murder), may not apply after
- `after` — connection only became true after the Event
- `throughout` — true for the whole game

This handles: weapon possession changing hands, location drift, and motive invalidation via
the Decision mechanic.

## Phase Structure

Setup → Act 1 → Event → Act 2 → Finale → Resolution

- **Setup** — players read their character, backstory is prominent, no actions yet
- **Act 1** — players pursue personal goals, collect CON clues, the Decision happens
- **Event** — host-triggered murder, ELIM clues broadcast to all, grid unlocks on player screens
- **Act 2** — elimination race, ELIM clues via actions, Revelations fire, killer hides evidence
- **Finale** — accusation phase, players submit suspect + weapon + location + motive
- **Resolution** — scoring revealed, full answer shown, story explained

The Event is always host-triggered, never automatic. The host reads the room and fires it when
Act 1 energy is right.

## Action System

Each player gets a limited number of actions per phase (target: 3-4 per act). Actions target
rooms, players, or items.

**Room actions** (require being in a room via QR scan):

- Search Room — returns one ELIM or CON clue specific to that room
- Eavesdrop — returns one CON clue about another player recently in the room

**Player actions** (target another player):

- Trade Info — bilateral exchange of one CON clue each
- Interrogate — forces a player to reveal one location connection (costs action for both)
- Use Ability — character-specific action with limited uses

**Revelation** (self-triggered, no action cost):
Fires when a player has eliminated all nodes in a category. Player chooses to broadcast publicly
for points. When a Revelation fires, that category is crossed off on every player's grid.

## Decision Mechanic

One Decision exists per Act 1. One player is the decision-maker. Two or more players are
influencers who try to sway the outcome through real-world conversation.

At the end of Act 1, the decision-maker registers their choice in the app. The outcome triggers
a branch: specific motive connections are invalidated, new CON clues may be released, the game
state shifts.

The Decision does not change the killer. It changes which red herrings are active, making each
playthrough feel different.

## Balance Variables

Key numbers that control game balance. Adjust via simulation before playtesting.

- `num_suspects` — 6 for prototype
- `nodes_per_category` — 2 for prototype
- `starting_con_clues_per_player` — 3 for prototype
- `action_con_clues_available` — 6 for prototype
- `event_elim_clues` — 2 for prototype
- `act2_elim_clues_available` — 14 for prototype
- `elim_clues_needed_for_solution` — 11 for prototype
- `elim_surplus` — 5 for prototype (available minus needed; target range 3-7)
- `actions_per_player_per_act` — TBD, primary tuning dial

## System Buckets (unchanged from v1)

- Identity system
- Objective system
- Action system
- Decision system
- World state system
- Clue system
- Room system
