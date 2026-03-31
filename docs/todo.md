# Hawkshaw TODO

## Next Pass Priorities

- define the MVP domain model for games, players, roles, rooms, items, clues, goals, and decisions
- design the first real Prisma schema and migration approach
- define invite, role-assignment, and player-session continuity rules
- build the host setup and game control surfaces
- build the player dashboard information architecture
- specify QR room interaction contracts
- decide where RLS should begin once the data model exists

## Open Questions For Later

- when should invite links create accounts versus attach existing users
- how should one-night player continuity work if someone changes devices mid-game
- what host monitoring data actually matters in MVP
- where should storage be used first: generated QR assets, scenario assets, or reveal media

