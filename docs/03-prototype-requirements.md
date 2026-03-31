# Hawkshaw Prototype Requirements v1

This document defines the MVP target shape that later implementation passes should satisfy.

## Locked UX Model

Action model: `hybrid`

- room-based actions are triggered from QR scans
- player-based actions are triggered from the player list

## Player Flow

### Pre-game

- receive invite link
- log in or join game
- get assigned a role
- view public info, private info, and initial goals

### Phase 1 loop

1. review role, goals, clues, and inventory
2. choose who to talk to
3. move physically
4. take a room or player action
5. receive result
6. reassess

### Event transition

- host triggers the event
- system updates phase, goals, clues, and information

### Finale

- each player submits suspect, motive, and means
- app reveals results and scoring

## Host Flow

- create game
- assign 6 players
- define rooms and QR codes
- start Phase 1
- trigger event
- start Phase 2
- launch finale and reveal

## MVP Screens

### Player

- dashboard
- role
- goals
- inventory
- clues
- player list
- room interaction
- action result
- accusation

### Host

- game setup
- room setup
- game control
- reveal screen

## Scaffold Implication

The scaffold only needs route shells and placeholders for these areas. No gameplay logic should be
implemented in this pass.

