import type { GameStage, ItemType } from "@prisma/client";

export type PrototypeGoalRule =
  | { type: "possess-item"; itemCode: string }
  | { type: "gain-clue"; clueCode: string }
  | { type: "gain-any-clue"; clueCodes: string[] }
  | { type: "decision-branch"; outcomeKey: string }
  | { type: "submit-accusation" };

export type PrototypeKnowledgeDefinition = {
  subjectRoleCode: string;
  factKey: string;
  title: string;
  body: string;
};

export type PrototypeRoleDefinition = {
  code: string;
  slotNumber: number;
  characterName: string;
  characterTitle: string;
  publicDescription: string;
  privateDescription: string;
  actTwoBriefing?: string;
  startingItemCodes: string[];
  startingClueCodes: string[];
  knowledge: PrototypeKnowledgeDefinition[];
};

export type PrototypeRoomResult = {
  key: string;
  text: string;
  clueCode?: string;
  itemCode?: string;
  stage?: "act-1" | "act-2";
};

export type PrototypeSecretDefinition = {
  code: string;
  title: string;
  truth: string;
  clueCodes: string[];
};

export type PrototypeStageContent = {
  summary: string;
  eventTitle: string;
  eventDescription: string;
};

export type PrototypeScenarioDefinition = {
  slug: string;
  title: string;
  summary: string;
  playerCount: number;
  actionBudgetPerAct: number;
  eventTitle: string;
  eventDescription: string;
  reveal: {
    suspectRoleCode: string;
    motive: string;
    means: string;
    summary: string;
    nonSuspectRoleCodes: string[];
  };
  stageContent: Record<"setup" | "act-1" | "event-1" | "act-2" | "finale" | "resolution", PrototypeStageContent>;
  secrets: PrototypeSecretDefinition[];
  roles: PrototypeRoleDefinition[];
  rooms: Array<{
    code: string;
    name: string;
    description: string;
    searchResults: PrototypeRoomResult[];
    eavesdropResults: PrototypeRoomResult[];
  }>;
  clues: Array<{
    code: string;
    title: string;
    body: string;
  }>;
  items: Array<{
    code: string;
    label: string;
    description: string;
    itemType: ItemType;
    isStealable?: boolean;
    isPlantable?: boolean;
    isTradeable?: boolean;
  }>;
  goals: Array<{
    code: string;
    roleCode: string;
    stage: GameStage;
    title: string;
    description: string;
    points: number;
    rule: PrototypeGoalRule;
  }>;
  decision: {
    code: string;
    decisionMakerRoleCode: string;
    title: string;
    description: string;
    optionA: {
      label: string;
      outcomeKey: string;
      summary: string;
    };
    optionB: {
      label: string;
      outcomeKey: string;
      summary: string;
    };
  };
  eventAwards: {
    everyoneClueCodes: string[];
    branchClueCodes: Record<string, string[]>;
  };
};

export const PROTOTYPE_SCENARIO: PrototypeScenarioDefinition = {
  slug: "blackout-at-hale-cabin",
  title: "Blackout at Hale Cabin",
  summary:
    "A winter succession dinner at an isolated mountain cabin turns lethal when the lights fail and Victor Hale is found dead in his Study.",
  playerCount: 6,
  actionBudgetPerAct: 3,
  eventTitle: "The Blackout Murder",
  eventDescription:
    "Victor publicly names Marcus as his successor, retreats to the Study, the cabin drops into darkness, and moments later Victor is discovered murdered.",
  reveal: {
    suspectRoleCode: "marcus-reed",
    motive: "fraud exposure",
    means: "hale heirloom dagger",
    summary:
      "Marcus Reed used Jack's blackout to kill Victor in the Study with the Hale heirloom dagger before Victor could pin the fraud on him alone.",
    nonSuspectRoleCodes: ["victor-hale"],
  },
  stageContent: {
    setup: {
      summary:
        "A snowed-in succession weekend is about to begin at Hale Cabin. Victor has called everyone together to settle business, status, and old grudges before the road closes.",
      eventTitle: "Before The Announcement",
      eventDescription:
        "Victor intends to name his successor tonight. Nobody agrees on who deserves it, and several guests have private reasons to fear what Victor might say.",
    },
    "act-1": {
      summary:
        "The gathering is live. Tension around the succession is rising, private leverage is already moving between rooms, and everyone has a reason to search, listen, and trade carefully.",
      eventTitle: "Succession Dinner In Motion",
      eventDescription:
        "Victor is still alive, the announcement is imminent, and the night's social balance can still be nudged through what you uncover and how you use it.",
    },
    "event-1": {
      summary:
        "Victor has named Marcus as successor, walked to the Study, and the cabin has fallen into chaos. The blackout is over, Victor is dead, and the house is scrambling to understand what just happened.",
      eventTitle: "The Blackout Murder",
      eventDescription:
        "The murder has happened. Actions pause while everyone absorbs the new reality, fresh clues land, and the next phase of the investigation takes shape.",
    },
    "act-2": {
      summary:
        "Victor is dead, suspicion is widening, and the surviving guests are now chasing motive, means, and timing through the Study fallout, the fraud trail, and the blackout sabotage.",
      eventTitle: "Aftermath And Scramble",
      eventDescription:
        "Act 2 is about connecting the murder to the deeper secrets beneath the succession dinner while protecting your own position long enough to survive the accusation round.",
    },
    finale: {
      summary:
        "The room has reached the accusation phase. The story each player tells now matters more than any single clue found in isolation.",
      eventTitle: "Final Accusations",
      eventDescription:
        "Submit your suspect, motive, and means. This is the formal accusation round, not another search phase.",
    },
    resolution: {
      summary:
        "The accusations are locked. The true story of the blackout, the fraud, and Victor's murder can now be revealed.",
      eventTitle: "Reveal",
      eventDescription:
        "Review the solution, compare it to your accusation, and see how your goals and deductions scored out.",
    },
  },
  secrets: [
    {
      code: "victor-chooses-marcus",
      title: "Victor Chooses Marcus",
      truth:
        "Victor had already decided Marcus would inherit control of the business before the night began.",
      clueCodes: ["successor-toast-card", "victor-announcement-notes", "victor-called-marcus-back"],
    },
    {
      code: "business-fraud",
      title: "Business Fraud",
      truth:
        "The Hale business is carrying cooked books and legal exposure hidden behind Victor and Marcus's private records.",
      clueCodes: ["marcus-auditor-panic", "safe-scratched-open", "hidden-compartment-disturbed", "ledger-page-redactions"],
    },
    {
      code: "eleanor-sofia-affair",
      title: "Eleanor and Sofia's Affair",
      truth: "Eleanor and Sofia are lovers and have been hiding the relationship behind philanthropic travel.",
      clueCodes: ["matching-spa-receipt", "monogrammed-scarf", "midnight-balcony-whisper"],
    },
    {
      code: "jack-caused-blackout",
      title: "Jack Caused the Blackout",
      truth:
        "Jack opened the basement panel and cut the power so he could access Victor's things during the confusion.",
      clueCodes: ["basement-panel-fresh", "fuse-grease", "blackout-timing"],
    },
    {
      code: "marcus-killed-victor",
      title: "Marcus Killed Victor",
      truth: "Marcus used the blackout to enter the Study, stab Victor, and disturb the safe to muddy motive.",
      clueCodes: ["study-blood-angle", "study-door-ajar", "victor-called-marcus-back", "safe-rifled-after-death"],
    },
    {
      code: "dagger-circulation",
      title: "The Dagger Moved Around The House",
      truth:
        "The Hale heirloom dagger was seen, borrowed, and misplaced through Act 1, spreading suspicion widely before Marcus used it.",
      clueCodes: ["dagger-seen-with-daniel", "display-stand-empty", "dagger-return-rumor"],
    },
  ],
  roles: [
    {
      code: "victor-hale",
      slotNumber: 1,
      characterName: "Victor Hale",
      characterTitle: "The Host",
      publicDescription:
        "Patriarch of the Hale family and ruler of both the cabin and the business empire gathered under its roof.",
      privateDescription:
        "You came to announce a successor and keep everyone off balance. The fraud is real, and tonight you mean to decide who gets buried by it.",
      actTwoBriefing:
        "You are dead, but your final arrangements and private signals still shape what the others can prove. Push them toward the truth you left behind.",
      startingItemCodes: ["study-safe-key", "hale-signet-watch"],
      startingClueCodes: ["victor-health-slip"],
      knowledge: [
        {
          subjectRoleCode: "daniel-hale",
          factKey: "daniel-desperate",
          title: "Daniel is bleeding cash",
          body: "You know Daniel has been begging the company controller to cover debts he cannot repay.",
        },
        {
          subjectRoleCode: "marcus-reed",
          factKey: "marcus-knows-the-books",
          title: "Marcus knows the real books",
          body: "Marcus is one of the only people who knows how bad the books would look under an audit.",
        },
      ],
    },
    {
      code: "eleanor-hale",
      slotNumber: 2,
      characterName: "Eleanor Hale",
      characterTitle: "The Wife",
      publicDescription:
        "Victor's elegant wife, practiced at smoothing over public tension with a smile and a well-timed toast.",
      privateDescription:
        "Your marriage is a performance. Keep your secret with Sofia buried and make sure Victor's announcement does not ruin what little freedom you have left.",
      actTwoBriefing:
        "Victor's death frees some dangers and sharpens others. Protect Sofia, redirect suspicion, and decide how much truth this family deserves.",
      startingItemCodes: ["hotel-receipt"],
      startingClueCodes: ["victor-announcement-notes"],
      knowledge: [
        {
          subjectRoleCode: "sofia-vale",
          factKey: "sofia-knows-your-signal",
          title: "Sofia reads your tells",
          body: "Sofia knows the tiny signals you use when you need a conversation rescued or redirected.",
        },
        {
          subjectRoleCode: "jack-mercer",
          factKey: "jack-stares-at-victor",
          title: "Jack did not come to forgive",
          body: "Jack has been watching Victor like a man measuring an old debt rather than a guest making polite conversation.",
        },
      ],
    },
    {
      code: "daniel-hale",
      slotNumber: 3,
      characterName: "Daniel Hale",
      characterTitle: "The Son",
      publicDescription:
        "Victor's son, charming when he must be and visibly certain that tonight ought to belong to him.",
      privateDescription:
        "You expect the business to be yours. If Victor humiliates you tonight, make sure everyone remembers his cruelty before they remember your temper.",
      actTwoBriefing:
        "Now you look like the easy suspect. Turn that to your advantage by finding the real financial motive and keeping the dagger story messy.",
      startingItemCodes: ["hale-heirloom-dagger"],
      startingClueCodes: ["daniel-entitlement-note"],
      knowledge: [
        {
          subjectRoleCode: "marcus-reed",
          factKey: "marcus-stays-late",
          title: "Marcus gets private meetings",
          body: "You have caught Marcus slipping into Victor's Study after hours more than once this month.",
        },
      ],
    },
    {
      code: "marcus-reed",
      slotNumber: 4,
      characterName: "Marcus Reed",
      characterTitle: "The Partner",
      publicDescription:
        "Victor's longtime business partner, efficient, respected, and just polished enough to make everyone wonder what he is hiding.",
      privateDescription:
        "Victor has tied you to the fraud and may sacrifice you to save the family name. Control the paper trail, keep calm, and survive the night.",
      actTwoBriefing:
        "Victor is dead and everyone is finally looking where you feared they would. Stay useful, stay composed, and keep the evidence moving.",
      startingItemCodes: ["ledger-page"],
      startingClueCodes: ["marcus-auditor-panic"],
      knowledge: [
        {
          subjectRoleCode: "victor-hale",
          factKey: "victor-promised-a-meeting",
          title: "Victor wanted a private word",
          body: "Victor quietly told you he wanted you in the Study after the announcement, whether the family liked it or not.",
        },
      ],
    },
    {
      code: "sofia-vale",
      slotNumber: 5,
      characterName: "Sofia Vale",
      characterTitle: "The Consultant",
      publicDescription:
        "A family-foundation consultant invited to advise on a charitable expansion, poised enough to belong and new enough to be underestimated.",
      privateDescription:
        "You came for Eleanor, not Victor's empire. Keep your affair hidden, learn why the business is rotting, and do not let yourself become collateral damage.",
      actTwoBriefing:
        "Victor's death makes your secret both riskier and more useful. Pick the truth that protects Eleanor without handing the killer a clean escape.",
      startingItemCodes: [],
      startingClueCodes: ["matching-spa-receipt"],
      knowledge: [
        {
          subjectRoleCode: "eleanor-hale",
          factKey: "eleanor-fears-exposure",
          title: "Eleanor is close to breaking",
          body: "Eleanor can keep a room calm, but Victor's announcement had her bracing for a personal disaster too.",
        },
      ],
    },
    {
      code: "jack-mercer",
      slotNumber: 6,
      characterName: "Jack Mercer",
      characterTitle: "The Fixer",
      publicDescription:
        "A former supplier and facilities fixer called up to inspect the cabin before the storm makes the mountain road impossible.",
      privateDescription:
        "Victor wrecked your old business and then acted as if you should be grateful for scraps. The blackout is yours, but the murder is not. Get what you came for and do not hang for someone else's knife.",
      actTwoBriefing:
        "The blackout worked too well. You need enough proof of tampering and timing to separate your stunt from Victor's murder before the room decides they are the same thing.",
      startingItemCodes: ["fuse-puller"],
      startingClueCodes: ["old-lawsuit-clipping"],
      knowledge: [
        {
          subjectRoleCode: "victor-hale",
          factKey: "victor-bought-you-off",
          title: "Victor expected obedience",
          body: "Victor invited you because he thought a paid inspection and a drink would settle what he did to you years ago.",
        },
      ],
    },
  ],
  rooms: [
    {
      code: "living-room",
      name: "Living Room",
      description: "A fire, a drinks cart, and enough old family photographs to make every conversation feel loaded.",
      searchResults: [
        {
          key: "living-search-1",
          text: "Inside Victor's speaking folder you find a toast card with Marcus's name underlined twice.",
          clueCode: "successor-toast-card",
          stage: "act-1",
        },
        {
          key: "living-search-2",
          text: "The dagger display stand is empty except for fresh velvet dust and one nick in the wood.",
          clueCode: "display-stand-empty",
          stage: "act-1",
        },
        {
          key: "living-search-3",
          text: "Near the hearth you spot a dropped study matchbook and a streak of soot from hurried hands.",
          clueCode: "study-door-ajar",
          stage: "act-2",
        },
      ],
      eavesdropResults: [
        {
          key: "living-listen-1",
          text: "You catch Victor warning someone that tonight will leave only one person in control.",
          clueCode: "victor-called-marcus-back",
          stage: "act-1",
        },
        {
          key: "living-listen-2",
          text: "Someone mutters that Daniel made sure everyone saw him with the dagger before dinner.",
          clueCode: "dagger-seen-with-daniel",
          stage: "act-1",
        },
      ],
    },
    {
      code: "study",
      name: "Study",
      description: "Victor's private command post, lined with ledgers, locked drawers, and a safe no one admits noticing.",
      searchResults: [
        {
          key: "study-search-1",
          text: "The painting hangs crooked over a hidden compartment that was opened recently and shut in a hurry.",
          clueCode: "hidden-compartment-disturbed",
          stage: "act-1",
        },
        {
          key: "study-search-2",
          text: "The safe lock is scratched and one shelf stands empty where papers should be.",
          clueCode: "safe-scratched-open",
          stage: "act-1",
        },
        {
          key: "study-search-3",
          text: "Blood and paper ash near the desk suggest the safe was rifled after Victor went down, not before.",
          clueCode: "safe-rifled-after-death",
          stage: "act-2",
        },
      ],
      eavesdropResults: [
        {
          key: "study-listen-1",
          text: "From the hallway you hear Victor snap that auditors only become a problem when Marcus loses his nerve.",
          clueCode: "marcus-auditor-panic",
          stage: "act-1",
        },
        {
          key: "study-listen-2",
          text: "A shaken whisper insists the wound was too clean for a wild struggle.",
          clueCode: "study-blood-angle",
          stage: "act-2",
        },
      ],
    },
    {
      code: "kitchen",
      name: "Kitchen",
      description: "All warmth, steam, and staff traffic, with the advantage that no one notices who lingers if they carry a plate.",
      searchResults: [
        {
          key: "kitchen-search-1",
          text: "Behind the dessert tins lies a monogrammed scarf that definitely did not belong in the service laundry.",
          clueCode: "monogrammed-scarf",
          stage: "act-1",
        },
        {
          key: "kitchen-search-2",
          text: "A drawer hides a torn ledger copy with redactions that line up with Marcus's initials.",
          clueCode: "ledger-page-redactions",
          stage: "act-2",
        },
      ],
      eavesdropResults: [
        {
          key: "kitchen-listen-1",
          text: "Two voices argue about whether Sofia's receipt should have been burned before anyone saw the dates.",
          clueCode: "matching-spa-receipt",
          stage: "act-1",
        },
        {
          key: "kitchen-listen-2",
          text: "A cook swears Daniel was raging in public, but the person who slipped toward the Study moved much more quietly.",
          clueCode: "blackout-timing",
          stage: "act-2",
        },
      ],
    },
    {
      code: "bedroom",
      name: "Bedroom",
      description: "An upscale guest room turned temporary refuge, scattered with luggage, perfume, and the remains of careful lies.",
      searchResults: [
        {
          key: "bedroom-search-1",
          text: "In a luggage pocket you find a folded hotel receipt from the same weekend Eleanor claimed to be at a spa alone.",
          clueCode: "matching-spa-receipt",
          stage: "act-1",
        },
        {
          key: "bedroom-search-2",
          text: "A note in Victor's handwriting says Marcus inherits control but also every unanswered question in the books.",
          clueCode: "victor-announcement-notes",
          stage: "act-2",
        },
      ],
      eavesdropResults: [
        {
          key: "bedroom-listen-1",
          text: "Through the wall you hear Eleanor promise Sofia that Victor still knows nothing about them.",
          clueCode: "midnight-balcony-whisper",
          stage: "act-1",
        },
        {
          key: "bedroom-listen-2",
          text: "Someone admits the dagger was passed around as a joke before the lights died.",
          clueCode: "dagger-return-rumor",
          stage: "act-2",
        },
      ],
    },
    {
      code: "basement",
      name: "Basement",
      description: "The generator room and storage area, damp with cold air and full of things people assume no guest would ever touch.",
      searchResults: [
        {
          key: "basement-search-1",
          text: "The electrical panel has fresh scratches around the latch and a fuse jammed back in by hand.",
          clueCode: "basement-panel-fresh",
          stage: "act-1",
        },
        {
          key: "basement-search-2",
          text: "A rag smelling of machine grease matches the residue on a portable fuse puller.",
          clueCode: "fuse-grease",
          stage: "act-1",
        },
        {
          key: "basement-search-3",
          text: "A muddy track from the basement stairs lines up with shoes headed toward the Study corridor.",
          clueCode: "blackout-timing",
          stage: "act-2",
        },
      ],
      eavesdropResults: [
        {
          key: "basement-listen-1",
          text: "You overhear that Jack asked exactly how long the backup lights would take to recover if the main panel tripped.",
          clueCode: "jack-generator-questions",
          stage: "act-1",
        },
        {
          key: "basement-listen-2",
          text: "Someone whispers that Victor's watch is missing, but his killer came for paper first and trophies second.",
          clueCode: "safe-rifled-after-death",
          stage: "act-2",
        },
      ],
    },
  ],
  clues: [
    {
      code: "victor-health-slip",
      title: "Victor's Health Slip",
      body: "Victor has been hiding that his health is worsening, which helps explain why tonight's succession decision could not wait.",
    },
    {
      code: "daniel-entitlement-note",
      title: "Daniel's Entitlement Note",
      body: "Daniel has been speaking like the succession is already his, and the rest of the house has noticed.",
    },
    {
      code: "old-lawsuit-clipping",
      title: "Old Lawsuit Clipping",
      body: "Jack once lost his business after Victor squeezed him through a lawsuit and a bank call no one could trace.",
    },
    {
      code: "successor-toast-card",
      title: "Successor Toast Card",
      body: "Victor's private toast notes show Marcus's name prepared well before the public announcement.",
    },
    {
      code: "victor-announcement-notes",
      title: "Victor's Announcement Notes",
      body: "Victor planned to name Marcus and saddle him with cleaning up the business mess afterward.",
    },
    {
      code: "marcus-auditor-panic",
      title: "Marcus Panics About Auditors",
      body: "Marcus becomes visibly tense whenever auditors or external reviews are mentioned.",
    },
    {
      code: "safe-scratched-open",
      title: "Safe Scratched Open",
      body: "Victor's safe shows hurried scratches, as if someone forced access while pretending they belonged there.",
    },
    {
      code: "hidden-compartment-disturbed",
      title: "Hidden Compartment Disturbed",
      body: "A hidden compartment behind the Study painting was definitely opened recently, probably for documents rather than cash.",
    },
    {
      code: "ledger-page-redactions",
      title: "Ledger Page With Redactions",
      body: "A copied ledger page points to cooked books, shell entries, and Marcus's fingerprints all over the cover-up.",
    },
    {
      code: "matching-spa-receipt",
      title: "Matching Hotel Receipt",
      body: "Sofia's hotel receipt matches the weekend Eleanor claimed to be away at a spa by herself.",
    },
    {
      code: "monogrammed-scarf",
      title: "Monogrammed Scarf",
      body: "A scarf tucked into the kitchen linen suggests Eleanor and Sofia had no intention of staying apart all evening.",
    },
    {
      code: "midnight-balcony-whisper",
      title: "Midnight Balcony Whisper",
      body: "Eleanor and Sofia speak with the intimacy of people hiding a secret, not just a business arrangement.",
    },
    {
      code: "dagger-seen-with-daniel",
      title: "Dagger Seen With Daniel",
      body: "Daniel was openly seen with the Hale heirloom dagger before dinner, giving everyone a neat early suspect story.",
    },
    {
      code: "display-stand-empty",
      title: "Display Stand Empty",
      body: "The dagger display in the Living Room was empty before the murder, so someone moved the weapon well ahead of the blackout.",
    },
    {
      code: "dagger-return-rumor",
      title: "Rumor Of The Dagger's Return",
      body: "Different people swear they saw the dagger leave Daniel's hands and then appear elsewhere before the lights went out.",
    },
    {
      code: "basement-panel-fresh",
      title: "Basement Panel Freshly Opened",
      body: "The basement electrical panel was tampered with recently and deliberately.",
    },
    {
      code: "fuse-grease",
      title: "Fuse Puller Grease",
      body: "A tool coated in grease matches the residue around the panel, suggesting the blackout was engineered rather than accidental.",
    },
    {
      code: "jack-generator-questions",
      title: "Jack Asked About The Generator",
      body: "Jack asked very specific questions about the timing and reset behavior of the cabin's power system.",
    },
    {
      code: "blackout-timing",
      title: "Blackout Timing",
      body: "The blackout created a narrow window between Victor entering the Study and the murder, separating sabotage from the killing itself.",
    },
    {
      code: "victor-called-marcus-back",
      title: "Victor Called Marcus Back",
      body: "Victor privately told Marcus to join him in the Study after the announcement, placing Marcus on the murder path for a reason.",
    },
    {
      code: "study-door-ajar",
      title: "Study Door Left Ajar",
      body: "The Study door was left slightly open during the darkness, suggesting someone slipped in confident they belonged there.",
    },
    {
      code: "study-blood-angle",
      title: "Study Blood Angle",
      body: "The wound angle suggests a deliberate, close strike rather than a panicked fight in the dark.",
    },
    {
      code: "safe-rifled-after-death",
      title: "Safe Rifled After Death",
      body: "Whoever went through the safe did it after Victor was already down, likely to muddy motive and scramble the fraud trail.",
    },
    {
      code: "daniel-public-outburst",
      title: "Daniel's Public Outburst",
      body: "Daniel openly challenged Victor before the announcement, making his anger the night's most obvious public motive.",
    },
    {
      code: "daniel-swallowed-anger",
      title: "Daniel Swallowed The Anger",
      body: "Daniel kept the peace in public, which makes his private resentment feel colder and harder to read.",
    },
    {
      code: "victor-dead-in-study",
      title: "Victor Dead In The Study",
      body: "Victor was killed in the Study during the blackout, and everyone now knows the succession dinner has become a murder investigation.",
    },
    {
      code: "dagger-missing-after-blackout",
      title: "Dagger Missing After The Blackout",
      body: "The Hale heirloom dagger is no longer where anyone expected it to be once Victor's body is found.",
    },
  ],
  items: [
    {
      code: "hale-heirloom-dagger",
      label: "Hale Heirloom Dagger",
      description: "A ceremonial family dagger with enough history to start arguments before it ever starts bleeding.",
      itemType: "WEAPON",
    },
    {
      code: "study-safe-key",
      label: "Study Safe Key",
      description: "Victor's key to the Study safe and its private records.",
      itemType: "KEY_ITEM",
    },
    {
      code: "ledger-page",
      label: "Ledger Page",
      description: "A copied ledger page that hints at cooked books, shell entries, and legal exposure.",
      itemType: "EVIDENCE",
    },
    {
      code: "hotel-receipt",
      label: "Hotel Receipt",
      description: "A small but dangerous receipt that ties Eleanor and Sofia to the same hidden weekend.",
      itemType: "EVIDENCE",
    },
    {
      code: "hale-signet-watch",
      label: "Hale Signet Watch",
      description: "Victor's valuable signet watch, flashy enough to steal and important enough to notice missing.",
      itemType: "MONEY",
    },
    {
      code: "fuse-puller",
      label: "Fuse Puller",
      description: "A portable tool that makes a blackout feel accidental to anyone who does not know what to look for.",
      itemType: "KEY_ITEM",
    },
  ],
  goals: [
    {
      code: "victor-act1-hold-key",
      roleCode: "victor-hale",
      stage: "ACT_1",
      title: "Keep the safe key in hand",
      description: "Hold onto the Study safe key until the announcement is made.",
      points: 1,
      rule: { type: "possess-item", itemCode: "study-safe-key" },
    },
    {
      code: "victor-act1-read-the-room",
      roleCode: "victor-hale",
      stage: "ACT_1",
      title: "Measure the challengers",
      description: "Confirm who looks most dangerous tonight by learning either Daniel's desperation or Marcus's audit panic.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["daniel-entitlement-note", "marcus-auditor-panic"] },
    },
    {
      code: "victor-act2-guide-the-living",
      roleCode: "victor-hale",
      stage: "ACT_2",
      title: "Leave a useful trail",
      description: "Make sure someone can find one of the clues tying Marcus or the fraud to the Study aftermath.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["victor-called-marcus-back", "safe-rifled-after-death"] },
    },
    {
      code: "victor-act2-submit-accusation",
      roleCode: "victor-hale",
      stage: "ACT_2",
      title: "Name the killer",
      description: "Lock in a final accusation before the reveal.",
      points: 1,
      rule: { type: "submit-accusation" },
    },

    {
      code: "eleanor-act1-hold-receipt",
      roleCode: "eleanor-hale",
      stage: "ACT_1",
      title: "Keep the receipt buried",
      description: "Hold onto the hotel receipt through Act 1 if you can.",
      points: 1,
      rule: { type: "possess-item", itemCode: "hotel-receipt" },
    },
    {
      code: "eleanor-act1-learn-succession",
      roleCode: "eleanor-hale",
      stage: "ACT_1",
      title: "Confirm Victor's choice",
      description: "Find evidence of who Victor intends to name as successor.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["successor-toast-card", "victor-announcement-notes", "victor-called-marcus-back"] },
    },
    {
      code: "eleanor-act1-track-jack",
      roleCode: "eleanor-hale",
      stage: "ACT_1",
      title: "Work out Jack's angle",
      description: "Learn whether Jack came here for more than repairs and weather talk.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["old-lawsuit-clipping", "jack-generator-questions", "basement-panel-fresh"] },
    },
    {
      code: "eleanor-act2-protect-sofia",
      roleCode: "eleanor-hale",
      stage: "ACT_2",
      title: "Control the affair fallout",
      description: "Gain one of the clues that proves your secret with Sofia is still at risk.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["matching-spa-receipt", "monogrammed-scarf", "midnight-balcony-whisper"] },
    },
    {
      code: "eleanor-act2-find-fraud",
      roleCode: "eleanor-hale",
      stage: "ACT_2",
      title: "Find the business motive",
      description: "Get hold of a clue that points to the fraud rather than family drama.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["safe-rifled-after-death", "ledger-page-redactions", "marcus-auditor-panic"] },
    },
    {
      code: "eleanor-act2-submit-accusation",
      roleCode: "eleanor-hale",
      stage: "ACT_2",
      title: "Choose your story",
      description: "Submit a final accusation before the reveal.",
      points: 1,
      rule: { type: "submit-accusation" },
    },

    {
      code: "daniel-act1-hold-dagger",
      roleCode: "daniel-hale",
      stage: "ACT_1",
      title: "Keep the dagger moving on your terms",
      description: "Hold onto the Hale heirloom dagger through Act 1 if you can.",
      points: 1,
      rule: { type: "possess-item", itemCode: "hale-heirloom-dagger" },
    },
    {
      code: "daniel-act1-decide-posture",
      roleCode: "daniel-hale",
      stage: "ACT_1",
      title: "Choose how you take the insult",
      description: "Commit to how you handle Victor before the announcement.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["daniel-public-outburst", "daniel-swallowed-anger"] },
    },
    {
      code: "daniel-act1-see-marcus-clearly",
      roleCode: "daniel-hale",
      stage: "ACT_1",
      title: "Catch Marcus acting guilty",
      description: "Find something that makes Marcus look less steady than he pretends.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["marcus-auditor-panic", "victor-called-marcus-back"] },
    },
    {
      code: "daniel-act2-prove-youre-too-obvious",
      roleCode: "daniel-hale",
      stage: "ACT_2",
      title: "Show that you were the easy suspect",
      description: "Collect a clue that proves the dagger story was circulating well before the murder.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["display-stand-empty", "dagger-return-rumor", "dagger-missing-after-blackout"] },
    },
    {
      code: "daniel-act2-find-the-real-motive",
      roleCode: "daniel-hale",
      stage: "ACT_2",
      title: "Find the stronger motive",
      description: "Learn something that points to fraud rather than inheritance tantrums.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["safe-rifled-after-death", "ledger-page-redactions", "marcus-auditor-panic"] },
    },
    {
      code: "daniel-act2-submit-accusation",
      roleCode: "daniel-hale",
      stage: "ACT_2",
      title: "Make the room believe you",
      description: "Submit a final accusation before the reveal.",
      points: 1,
      rule: { type: "submit-accusation" },
    },

    {
      code: "marcus-act1-hold-ledger",
      roleCode: "marcus-reed",
      stage: "ACT_1",
      title: "Control the paper trail",
      description: "Keep the ledger page in your possession during Act 1.",
      points: 1,
      rule: { type: "possess-item", itemCode: "ledger-page" },
    },
    {
      code: "marcus-act1-track-safe-risk",
      roleCode: "marcus-reed",
      stage: "ACT_1",
      title: "Check what Victor hid",
      description: "Learn whether the safe or hidden compartment has already been disturbed.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["safe-scratched-open", "hidden-compartment-disturbed"] },
    },
    {
      code: "marcus-act1-confirm-succession",
      roleCode: "marcus-reed",
      stage: "ACT_1",
      title: "Confirm that Victor still means to choose you",
      description: "Find evidence that the announcement really points your way.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["successor-toast-card", "victor-announcement-notes", "victor-called-marcus-back"] },
    },
    {
      code: "marcus-act2-keep-calm",
      roleCode: "marcus-reed",
      stage: "ACT_2",
      title: "Look useful, not cornered",
      description: "Gather any clue that lets you talk about the blackout or Daniel instead of your own position.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["blackout-timing", "daniel-public-outburst", "dagger-seen-with-daniel"] },
    },
    {
      code: "marcus-act2-protect-fraud-secret",
      roleCode: "marcus-reed",
      stage: "ACT_2",
      title: "Keep the fraud from becoming the whole story",
      description: "Retain the ledger page or recover another clue tied to the missing records.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["ledger-page-redactions", "safe-rifled-after-death"] },
    },
    {
      code: "marcus-act2-submit-accusation",
      roleCode: "marcus-reed",
      stage: "ACT_2",
      title: "Accuse before they accuse you",
      description: "Submit a final accusation before the reveal.",
      points: 1,
      rule: { type: "submit-accusation" },
    },

    {
      code: "sofia-act1-learn-choice",
      roleCode: "sofia-vale",
      stage: "ACT_1",
      title: "Learn who Victor intends to elevate",
      description: "Get confirmation of Victor's planned successor.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["successor-toast-card", "victor-announcement-notes", "victor-called-marcus-back"] },
    },
    {
      code: "sofia-act1-track-affair-risk",
      roleCode: "sofia-vale",
      stage: "ACT_1",
      title: "Measure how exposed you are",
      description: "Find any sign that your secret with Eleanor is already leaking into the house.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["matching-spa-receipt", "monogrammed-scarf", "midnight-balcony-whisper"] },
    },
    {
      code: "sofia-act1-find-fraud-thread",
      roleCode: "sofia-vale",
      stage: "ACT_1",
      title: "Find the uglier secret",
      description: "Learn something that suggests the business itself may be rotten.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["safe-scratched-open", "hidden-compartment-disturbed", "marcus-auditor-panic"] },
    },
    {
      code: "sofia-act2-read-the-scene",
      roleCode: "sofia-vale",
      stage: "ACT_2",
      title: "Understand the murder scene",
      description: "Collect a clue from the Study aftermath rather than the party gossip.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["study-blood-angle", "study-door-ajar", "safe-rifled-after-death"] },
    },
    {
      code: "sofia-act2-protect-eleanor",
      roleCode: "sofia-vale",
      stage: "ACT_2",
      title: "Keep Eleanor from becoming the easy scandal",
      description: "Hold or recover the hotel receipt if it starts moving around the house.",
      points: 1,
      rule: { type: "possess-item", itemCode: "hotel-receipt" },
    },
    {
      code: "sofia-act2-submit-accusation",
      roleCode: "sofia-vale",
      stage: "ACT_2",
      title: "Pick a suspect you can live with",
      description: "Submit a final accusation before the reveal.",
      points: 1,
      rule: { type: "submit-accusation" },
    },

    {
      code: "jack-act1-hold-tool",
      roleCode: "jack-mercer",
      stage: "ACT_1",
      title: "Keep your tool close",
      description: "Hold onto the fuse puller through Act 1 if nobody gets clever.",
      points: 1,
      rule: { type: "possess-item", itemCode: "fuse-puller" },
    },
    {
      code: "jack-act1-check-panel",
      roleCode: "jack-mercer",
      stage: "ACT_1",
      title: "Make sure the panel work reads as accidental",
      description: "Find what the basement currently reveals about the electrical setup.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["basement-panel-fresh", "fuse-grease", "jack-generator-questions"] },
    },
    {
      code: "jack-act1-grab-value",
      roleCode: "jack-mercer",
      stage: "ACT_1",
      title: "Put your hands on something Victor will miss",
      description: "Get Victor's signet watch into circulation if the chance appears.",
      points: 1,
      rule: { type: "possess-item", itemCode: "hale-signet-watch" },
    },
    {
      code: "jack-act2-separate-blackout-from-murder",
      roleCode: "jack-mercer",
      stage: "ACT_2",
      title: "Separate your blackout from the killing",
      description: "Find timing evidence that the sabotage and the murder are related but not identical acts.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["blackout-timing", "study-door-ajar", "victor-called-marcus-back"] },
    },
    {
      code: "jack-act2-track-the-knife-story",
      roleCode: "jack-mercer",
      stage: "ACT_2",
      title: "Keep the dagger story muddy",
      description: "Collect a clue showing the dagger passed through multiple hands before the murder.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["dagger-seen-with-daniel", "display-stand-empty", "dagger-return-rumor"] },
    },
    {
      code: "jack-act2-submit-accusation",
      roleCode: "jack-mercer",
      stage: "ACT_2",
      title: "Blame the right sin",
      description: "Submit a final accusation before the reveal.",
      points: 1,
      rule: { type: "submit-accusation" },
    },
  ],
  decision: {
    code: "daniel-pre-announcement-choice",
    decisionMakerRoleCode: "daniel-hale",
    title: "How do you answer Victor before the announcement?",
    description:
      "Victor needles you in front of everyone moments before he names his successor. Do you challenge him publicly or swallow the insult and wait?",
    optionA: {
      label: "Challenge Victor in front of everyone",
      outcomeKey: "daniel-public-outburst",
      summary: "Daniel turns himself into the night's obvious public suspect.",
    },
    optionB: {
      label: "Swallow it and go cold",
      outcomeKey: "daniel-swallowed-anger",
      summary: "Daniel keeps control in public, making his resentment look quieter and harder to measure.",
    },
  },
  eventAwards: {
    everyoneClueCodes: ["victor-dead-in-study", "dagger-missing-after-blackout", "blackout-timing"],
    branchClueCodes: {
      "daniel-public-outburst": ["daniel-public-outburst"],
      "daniel-swallowed-anger": ["daniel-swallowed-anger"],
    },
  },
};
