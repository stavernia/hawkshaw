# Hawkshaw Structure Framework v1

## Product Vision

Hawkshaw is a live, app-powered, in-person social mystery game platform.

The app should:

- distribute information over time
- track actions and game state
- resolve hidden interactions
- support room-based play
- update goals and clues after major events
- support accusation, scoring, and reveal

## Core Experience Goals

### Player fantasy

- feel important to the story
- know things others do not
- have meaningful reasons to talk and move
- influence outcomes
- succeed without only solving the murder

### Host fantasy

- setup is manageable
- phase transitions are clear
- the app carries most state-tracking burden
- the experience still works when players are chaotic

## Design Principles

1. Human interaction comes first.
2. Every player needs agency.
3. Phase 2 must feel materially different from Phase 1.
4. The mystery must stay coherent and solvable.
5. The app should track what matters.
6. Host burden must stay low.
7. Depth beats breadth for MVP.
8. Information should unlock at a controlled pace.
9. Limited actions create tension.
10. Winning should be multi-dimensional.

## Core System Buckets

- Identity system
- Objective system
- Action system
- Decision system
- World state system
- Clue system
- Room system

## Scaffold Implication

The scaffold should prepare for these systems with route boundaries, feature folders, shared types,
and service seams, but should not implement the systems themselves yet.

