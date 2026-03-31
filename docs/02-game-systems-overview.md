# Hawkshaw Game Systems Overview v1

This document turns the structure framework into build-oriented system definitions.

## Identity System

- each player has a role, public info, private info, relationships, secrets, and motivations

## Objective System

- players receive Phase 1 goals
- players receive updated or new Phase 2 goals
- goals should be auto-scored when practical

## Action System

- each player gets 3 to 4 actions per phase
- actions target rooms, players, or items
- MVP actions include Search Room, Eavesdrop, Pickpocket, and Plant Item

## Decision System

- one meaningful branching decision exists in the MVP
- other players influence socially, not systemically
- the outcome affects later game logic

## World State System

- two phases
- one major event
- explicit host-controlled transitions

## Clue System

- 10 to 25 clues total
- clues are atomic pieces of information
- distribution spans initial info, room actions, goals, and phase updates

## Room System

- host defines rooms
- each room has a QR code
- players scan to enter room actions

## Scaffold Implication

The scaffold should create named extension points for games, players, rooms, items, clues, goals,
and decisions without committing to a full data model.

