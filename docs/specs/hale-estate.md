# Hale Estate — Scenario Spec v1

The first Hawkshaw scenario. Used for prototype playtesting and as the reference implementation
for the scenario JSON schema.

## Premise

Victor Hale, patriarch of a wealthy family, summons his family and close associates to his
mountain cabin. He plans to announce a successor for his business empire. During the evening,
he uncovers secrets about the people around him. Before he can act on what he's learned,
he is murdered.

## Answer Key

- **Killer:** Marcus Reed
- **Weapon:** Poison (arsenic dissolved in Victor's water glass)
- **Location:** The Study
- **Motive:** Protection (named as successor = prison sentence for fraud)
- **Trait:** Left-handed

## Characters

### Victor Hale — The Patriarch (host / victim)

Public: family patriarch, calling everyone together to announce succession
Secret: has been quietly gathering damaging information about everyone present
Role: not a playable character — run by the host until the Event

### Eleanor Hale — The Wife

Public: devoted wife, gracious hostess
Secret: having an affair (with Victor's consultant Sophia)
Motive connections: Revenge, Money
Weapon connections: Poison, Knife
Location connections: Study (pre-murder), Bedroom

### Ashley Hale — The Heir

Public: Victor's child, expected successor
Secret: in massive personal debt, desperate to inherit
Motive connections: Money, Revenge
Weapon connections: Bludgeon, Knife
Location connections: Bedroom, Study

### Marcus Reed — The Partner ★ KILLER

Public: Victor's trusted business partner
Secret: has been embezzling — cooking the books for years
Motive connections: Protection ★, Money
Weapon connections: Poison ★, (red herring: connected to Kitchen via early alibi)
Location connections: Study ★, Kitchen (alibi)
Trait: Left-handed ★
Note: Marcus's starting hand contains only misdirection clues pointing at other suspects.

### Sophia Marlow — The Consultant

Public: business consultant Victor brought in
Secret: FBI informant — building a case against the fraud
Motive connections: Protection, (affair with Eleanor is a red herring motive)
Weapon connections: Poison, Knife
Location connections: Kitchen (confirmed alibi), Study

### Jack Mercer — The Fixer

Public: old associate of Victor's
Secret: Victor wronged Jack's family years ago — he is here partly for revenge, partly to
steal a valuable document
Motive connections: Revenge, Money
Weapon connections: Knife, Bludgeon
Location connections: Basement (cut the lights), all rooms (he was moving)

## Node Space

### Weapons (6 nodes)

- Gun 1, Gun 2 — eliminated in Act 2
- Knife 1, Knife 2 — eliminated in Act 2
- Poison 1 — red herring, eliminated in Act 2
- **Poison 2 ★** — the answer weapon

### Locations (6 nodes)

- **Room A1 — The Study ★** — the answer location
- Room A2 — Upstairs hallway — eliminated
- Room B1 — Kitchen — red herring, eliminated
- Room B2 — Bedroom — eliminated at Event
- Room C1 — Patio — eliminated
- Room C2 — Basement — eliminated

### Motives (6 nodes)

- Money 1, Money 2 — eliminated
- Revenge 1, Revenge 2 — eliminated
- **Protection 1 ★** — the answer motive
- Protection 2 — red herring, eliminated

### Traits (4 nodes)

- Trait A1 — right-handed (S1, S3, S5 have this) — eliminated as tiebreaker
- **Trait A2 — left-handed ★** (S2/Marcus, S4/Eleanor, S6/Jack have this)
- Trait B1, Trait B2

## Starting Clue Hands

Each player starts with 3 CON clues. Answer-node connections to Marcus are split across
S1 (weapon), S3 (location), S5 (motive) — never more than one per starting hand.

| Held by     | Clue   | Type | Target                                   |
| ----------- | ------ | ---- | ---------------------------------------- |
| Eleanor     | CON-05 | CON  | Marcus → Poison 2 ★                      |
| Eleanor     | CON-07 | CON  | Ashley → Study (red herring)             |
| Eleanor     | CON-17 | CON  | Jack → Protection 2 (red herring)        |
| Ashley      | CON-01 | CON  | Eleanor → Gun 1 (red herring)            |
| Ashley      | CON-10 | CON  | Sophia → Bedroom (red herring)           |
| Ashley      | CON-13 | CON  | Sophia → Money 1 (red herring)           |
| Sophia      | CON-02 | CON  | Ashley → Gun 2 (red herring)             |
| Sophia      | CON-08 | CON  | Marcus → Study ★                         |
| Sophia      | CON-18 | CON  | Ashley → Money 2 (red herring)           |
| Marcus      | CON-03 | CON  | Sophia → Knife 1 (misdirection)          |
| Marcus      | CON-09 | CON  | Eleanor → Kitchen (misdirection)         |
| Marcus      | CON-14 | CON  | Jack → Revenge 1 (misdirection)          |
| Jack        | CON-06 | CON  | Jack → Poison 1 (red herring)            |
| Jack        | CON-16 | CON  | Marcus → Protection 1 ★                  |
| Jack        | CON-11 | CON  | Jack → Patio (self / red herring)        |
| Victor/host | CON-04 | CON  | Jack → Knife 2 (red herring)             |
| Victor/host | CON-12 | CON  | Jack → Basement (establishes Jack alibi) |
| Victor/host | CON-15 | CON  | Eleanor → Revenge 2 (red herring)        |

## Event Clues (broadcast to all)

| ID       | Type | Effect             |
| -------- | ---- | ------------------ |
| ELIM-EV1 | ELIM | Gun 1 eliminated   |
| ELIM-EV2 | ELIM | Bedroom eliminated |

## Act 1 Action Clues

| ID     | Type | Source         | Effect                                     |
| ------ | ---- | -------------- | ------------------------------------------ |
| CON-19 | CON  | Search Kitchen | Marcus → Poison 1 (red herring for Marcus) |
| CON-20 | CON  | Search Hallway | Jack → Money 1                             |
| CON-21 | CON  | Search Patio   | Ashley → Knife 1                           |
| CON-22 | CON  | Eavesdrop      | Eleanor → Protection 2                     |
| CON-23 | CON  | Trade          | Sophia → Poison 2 (red herring for Sophia) |
| CON-24 | CON  | Trade          | Jack → Study (red herring for Jack)        |

## Act 2 Elimination Clues

| ID      | Type | Source              | Removes               |
| ------- | ---- | ------------------- | --------------------- |
| ELIM-01 | ELIM | Search Kitchen      | Gun 2                 |
| ELIM-02 | ELIM | Search Hallway      | Knife 1               |
| ELIM-03 | ELIM | Search Basement     | Knife 2               |
| ELIM-04 | ELIM | Search Patio        | Poison 1              |
| ELIM-05 | ELIM | Interrogate Eleanor | Hallway               |
| ELIM-06 | ELIM | Interrogate Sophia  | Kitchen               |
| ELIM-07 | ELIM | Search Study        | Patio                 |
| ELIM-08 | ELIM | Interrogate Jack    | Basement              |
| ELIM-09 | ELIM | Eavesdrop           | Money 1               |
| ELIM-10 | ELIM | Eavesdrop           | Money 2               |
| ELIM-11 | ELIM | Search Kitchen      | Revenge 1             |
| ELIM-12 | ELIM | Search Basement     | Revenge 2             |
| ELIM-13 | ELIM | Search Study        | Protection 2          |
| ELIM-14 | ELIM | Interrogate Marcus  | Trait A1 (tiebreaker) |

## Act 2 Confirmation Clues

These CON clues are only available in Act 2. They confirm the killer's answer connections
for players who have done the work to narrow down the space.

| ID     | Type | Source             | Effect                                         |
| ------ | ---- | ------------------ | ---------------------------------------------- |
| CON-25 | CON  | Search Study       | Marcus → Protection 1 ★ confirms answer motive |
| CON-26 | CON  | Trade / persuasion | Marcus → Study ★ confirms answer location      |
| CON-27 | CON  | Observe Marcus     | Marcus → Trait A2 ★ confirms left-handed       |
| CON-28 | CON  | Eavesdrop          | Marcus → Poison 2 ★ confirms answer weapon     |

## Decision: The Succession

**Decision maker:** Marcus Reed
**Influencers:** Ashley Hale (push to name Ashley), Sophia Marlow (push to name Marcus)
**Timing:** End of Act 1

**Option A — Victor names Ashley as successor (default)**

- Ashley's debt motive weakens (relief)
- Marcus's protection motive activates fully (he'll go to jail as the named outsider)
- ELIM: Money 1 becomes unavailable (Ashley's desperation cools)

**Option B — Victor names Marcus as successor**

- Marcus's protection motive activates at maximum intensity
- Ashley's revenge motive activates (rage at being passed over)
- New CON released: Ashley → Study (he confronted Victor)

In the actual murder, Victor chose Marcus. The Decision mechanic lets players influence which
branch fires, making each playthrough feel live.

## Balance Check

- Total CON clues: 28
- Total ELIM clues: 16
- Starting CON per player: 3
- Minimum ELIM to solve: 11
- ELIM surplus: 5
- Revelation opportunities: Guns cleared, Knives cleared, Non-Study locations cleared,
  Non-Protection motives cleared (4 possible Revelations)
- Answer reachable without Act 2 confirmation CON clues if ELIM track is aggressive
- Active player can solve by step 12 of elimination sequence
- Passive player has strong suspicion but not certainty by Finale
