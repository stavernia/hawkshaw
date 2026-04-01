import type { GameStage, ItemType } from "@prisma/client";

export type PrototypeGoalRule =
  | { type: "possess-item"; itemCode: string }
  | { type: "gain-clue"; clueCode: string }
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
  };
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
  slug: "ashdown-manor",
  title: "Ashdown Manor Prototype",
  summary: "Six guests weather a storm at a country estate while the truth about a killing closes in.",
  playerCount: 6,
  actionBudgetPerAct: 3,
  eventTitle: "The Storm Breaks",
  eventDescription:
    "The manor loses power, the body is discovered in the cellar passage, and every guest receives a fresh reason to panic.",
  reveal: {
    suspectRoleCode: "silas-ward",
    motive: "debt",
    means: "knife",
    summary:
      "Silas Ward killed the victim to stop a debt ledger from reaching the magistrate, then pushed suspicion toward the household staff.",
  },
  roles: [
    {
      code: "evelyn-vale",
      slotNumber: 1,
      characterName: "Evelyn Vale",
      characterTitle: "The Hostess",
      publicDescription: "The manor's composed hostess, determined to keep the evening civilized.",
      privateDescription:
        "You know the victim was blackmailing the household. Keep the sealed letter from becoming common gossip.",
      actTwoBriefing:
        "The blackout exposes how close the scandal is to breaking. Decide whether protecting the family is still worth it.",
      startingItemCodes: ["sealed-letter"],
      startingClueCodes: ["blackmail-note"],
      knowledge: [
        {
          subjectRoleCode: "corin-march",
          factKey: "corin-kept-the-ledger",
          title: "Corin handled the books",
          body: "You personally asked Corin to lock away the estate ledger before dinner.",
        },
      ],
    },
    {
      code: "jonah-frost",
      slotNumber: 2,
      characterName: "Jonah Frost",
      characterTitle: "The Columnist",
      publicDescription: "A charming columnist with a talent for drawing out secrets from strangers.",
      privateDescription:
        "You came hunting a corruption story, not a corpse. Gather hard evidence before anyone decides to silence you.",
      actTwoBriefing:
        "The murder confirms the scandal is real. You need proof strong enough to publish without becoming the next victim.",
      startingItemCodes: ["reporter-notes"],
      startingClueCodes: ["greenhouse-receipt"],
      knowledge: [
        {
          subjectRoleCode: "lena-thorne",
          factKey: "lena-was-outside",
          title: "Lena left the house early",
          body: "You saw Lena return from the grounds with mud on her boots before the toast.",
        },
      ],
    },
    {
      code: "mira-hale",
      slotNumber: 3,
      characterName: "Dr. Mira Hale",
      characterTitle: "The Physician",
      publicDescription: "The family physician, observant and impossible to fluster.",
      privateDescription:
        "You noticed the victim was already injured before the lights failed. Work out who exploited that weakness.",
      actTwoBriefing:
        "Now that the body has been found, your medical read can cut through the panic if you assemble the right details.",
      startingItemCodes: ["doctor-case"],
      startingClueCodes: ["bloodied-cufflink"],
      knowledge: [
        {
          subjectRoleCode: "silas-ward",
          factKey: "silas-tremor",
          title: "Silas was shaking",
          body: "Silas asked you for a tonic before dinner, claiming his hands would not stop trembling.",
        },
      ],
    },
    {
      code: "corin-march",
      slotNumber: 4,
      characterName: "Corin March",
      characterTitle: "The Solicitor",
      publicDescription: "The family's solicitor, sharp-suited and careful with every word.",
      privateDescription:
        "You found the ledger page that could ruin several guests. Decide whether to expose it or destroy it.",
      actTwoBriefing:
        "Your choice about the ledger now shapes the story everyone believes. Live with the branch you chose.",
      startingItemCodes: ["estate-ledger-page"],
      startingClueCodes: ["duplicate-seal"],
      knowledge: [
        {
          subjectRoleCode: "evelyn-vale",
          factKey: "evelyn-feared-the-letter",
          title: "Evelyn feared the mail bag",
          body: "Evelyn personally asked whether any sealed correspondence had arrived for the victim.",
        },
      ],
    },
    {
      code: "lena-thorne",
      slotNumber: 5,
      characterName: "Lena Thorne",
      characterTitle: "The Groundskeeper",
      publicDescription: "The groundskeeper, practical and hard to intimidate.",
      privateDescription:
        "You know where the house hides its keys and knives. Keep suspicion away from the servants while you learn who framed them.",
      actTwoBriefing:
        "The murder weapon points toward the staff. You need proof that the framing was deliberate.",
      startingItemCodes: ["silver-key"],
      startingClueCodes: ["mud-on-boots"],
      knowledge: [
        {
          subjectRoleCode: "silas-ward",
          factKey: "silas-cellar-route",
          title: "Silas knew the cellar route",
          body: "Silas asked you last week how to reach the cellar passage without crossing the main hall.",
        },
      ],
    },
    {
      code: "silas-ward",
      slotNumber: 6,
      characterName: "Silas Ward",
      characterTitle: "The Investor",
      publicDescription: "An antiquarian investor with expensive taste and nerves stretched thin.",
      privateDescription:
        "You know exactly how dangerous the ledger could be. Keep control of the evidence and redirect suspicion before the finale.",
      actTwoBriefing:
        "The body changes everything. Survive the accusation round by steering attention toward motive and chaos, not certainty.",
      startingItemCodes: ["signet-ring"],
      startingClueCodes: ["revolver-case-empty"],
      knowledge: [
        {
          subjectRoleCode: "jonah-frost",
          factKey: "jonah-chased-a-story",
          title: "Jonah arrived with questions",
          body: "Jonah approached the household with a cover story, but you recognized a reporter's notebook in his coat.",
        },
      ],
    },
  ],
  rooms: [
    {
      code: "salon",
      name: "Salon",
      description: "Low lamps, warm drinks, and too many polite lies.",
      searchResults: [
        {
          key: "salon-search-1",
          text: "Behind the liquor cart you find a torn section of the victim's will.",
          clueCode: "torn-will",
        },
        {
          key: "salon-search-2",
          text: "Inside an umbrella stand you find a scrap noting a secret meeting in the greenhouse.",
          clueCode: "map-annotation",
        },
      ],
      eavesdropResults: [
        {
          key: "salon-listen-1",
          text: "You overhear that the victim threatened to expose someone's debts before midnight.",
          clueCode: "overheard-argument",
        },
      ],
    },
    {
      code: "study",
      name: "Study",
      description: "Locked drawers, estate papers, and the smell of old smoke.",
      searchResults: [
        {
          key: "study-search-1",
          text: "A half-burned note reveals a missing page from the estate ledger.",
          clueCode: "ledger-missing-page",
        },
        {
          key: "study-search-2",
          text: "You recover a brass key hidden in the atlas stand.",
          itemCode: "brass-key",
        },
      ],
      eavesdropResults: [
        {
          key: "study-listen-1",
          text: "A tense whisper confirms the victim had been demanding payment by dawn.",
          clueCode: "blackmail-pressure",
        },
      ],
    },
    {
      code: "greenhouse",
      name: "Greenhouse",
      description: "Wet glass, muddy footprints, and an exit no one admits using.",
      searchResults: [
        {
          key: "greenhouse-search-1",
          text: "A damp receipt links the victim to a rushed purchase earlier that day.",
          clueCode: "greenhouse-receipt",
        },
        {
          key: "greenhouse-search-2",
          text: "You recover the gardener's knife wrapped in a torn apron cloth.",
          itemCode: "gardener-knife",
        },
      ],
      eavesdropResults: [
        {
          key: "greenhouse-listen-1",
          text: "From beyond the fern wall you catch someone insisting the ledger must disappear.",
          clueCode: "duplicate-seal",
        },
      ],
    },
    {
      code: "cellar",
      name: "Cellar Passage",
      description: "Cold stone, unstable lantern light, and the place where the body is discovered.",
      searchResults: [
        {
          key: "cellar-search-1",
          text: "A dropped lantern reveals the path used to stage the scene.",
          clueCode: "cellar-lantern",
           stage: "act-2",
        },
        {
          key: "cellar-search-2",
          text: "Wedged behind a crate is the victim's signet case, empty except for dust.",
          clueCode: "victim-signet-case",
           stage: "act-2",
        },
      ],
      eavesdropResults: [
        {
          key: "cellar-listen-1",
          text: "The constable outside confirms the wound came from a narrow blade, not a firearm.",
          clueCode: "medical-wound",
           stage: "act-2",
        },
      ],
    },
  ],
  clues: [
    { code: "blackmail-note", title: "Blackmail Note", body: "The victim was extorting someone tied to the estate." },
    { code: "greenhouse-receipt", title: "Greenhouse Receipt", body: "The victim paid cash for a late delivery to the greenhouse." },
    { code: "bloodied-cufflink", title: "Bloodied Cufflink", body: "A cufflink with fresh blood suggests the victim struggled before death." },
    { code: "duplicate-seal", title: "Duplicate Seal", body: "Someone in the manor could forge the estate seal well enough to fake official papers." },
    { code: "mud-on-boots", title: "Mud on Boots", body: "Fresh mud indicates at least one guest used the side path before the storm broke." },
    { code: "revolver-case-empty", title: "Empty Revolver Case", body: "A revolver case was displayed prominently, but the weapon is gone and may be a false lead." },
    { code: "torn-will", title: "Torn Will", body: "Part of the victim's will has been torn away, likely to hide who stood to lose money." },
    { code: "map-annotation", title: "Map Annotation", body: "A marked map points to a private greenhouse meeting before dinner." },
    { code: "ledger-missing-page", title: "Missing Ledger Page", body: "A missing ledger page tracks debts and secret payments owed to the victim." },
    { code: "blackmail-pressure", title: "Pressure From the Study", body: "Someone was told to settle their account before dawn or face public ruin." },
    { code: "overheard-argument", title: "Overheard Argument", body: "The victim threatened to make an example of someone that same night." },
    { code: "cellar-lantern", title: "Cellar Lantern", body: "The lantern placement suggests the killer knew the cellar passage well." },
    { code: "victim-signet-case", title: "Victim's Signet Case", body: "The victim's signet case is empty, implying a valuable item was taken or swapped." },
    { code: "medical-wound", title: "Medical Wound Assessment", body: "The fatal wound came from a narrow blade and was delivered with precision." },
    { code: "ledger-exposed", title: "Ledger Exposed", body: "Corin chose to reveal the ledger, spreading the debt scandal across the house." },
    { code: "ledger-burned", title: "Ledger Burned", body: "Corin destroyed the ledger, leaving only fragments and second-hand accounts behind." },
  ],
  items: [
    {
      code: "sealed-letter",
      label: "Sealed Letter",
      description: "A private letter linking the victim to the household scandal.",
      itemType: "EVIDENCE",
    },
    {
      code: "reporter-notes",
      label: "Reporter Notes",
      description: "Jonah's shorthand notebook of suspicious conversations.",
      itemType: "EVIDENCE",
      isStealable: false,
      isPlantable: false,
      isTradeable: false,
    },
    {
      code: "doctor-case",
      label: "Doctor's Case",
      description: "A leather bag with bandages and a sharp eye for wounds.",
      itemType: "KEY_ITEM",
      isStealable: false,
      isPlantable: false,
      isTradeable: false,
    },
    {
      code: "estate-ledger-page",
      label: "Ledger Page",
      description: "A missing ledger page listing debts owed to the victim.",
      itemType: "EVIDENCE",
    },
    {
      code: "silver-key",
      label: "Silver Key",
      description: "A service key that opens side corridors and the study cabinet.",
      itemType: "KEY_ITEM",
    },
    {
      code: "signet-ring",
      label: "Signet Ring",
      description: "A ring used to authenticate private family correspondence.",
      itemType: "KEY_ITEM",
    },
    {
      code: "brass-key",
      label: "Brass Key",
      description: "A hidden brass key recovered from the study atlas stand.",
      itemType: "KEY_ITEM",
    },
    {
      code: "gardener-knife",
      label: "Gardener's Knife",
      description: "A narrow blade suitable for trimming vines or committing murder.",
      itemType: "WEAPON",
    },
  ],
  goals: [
    {
      code: "evelyn-protect-letter",
      roleCode: "evelyn-vale",
       stage: "ACT_1",
      title: "Keep the letter contained",
      description: "Hold onto the sealed letter through the first phase.",
      points: 2,
      rule: { type: "possess-item", itemCode: "sealed-letter" },
    },
    {
      code: "evelyn-submit-accusation",
      roleCode: "evelyn-vale",
       stage: "ACT_2",
      title: "Name a culprit",
      description: "Make a complete accusation before the reveal.",
      points: 1,
      rule: { type: "submit-accusation" },
    },
    {
      code: "jonah-find-ledger",
      roleCode: "jonah-frost",
       stage: "ACT_1",
      title: "Confirm the scandal",
      description: "Gain the missing ledger clue before the event.",
      points: 2,
      rule: { type: "gain-clue", clueCode: "ledger-missing-page" },
    },
    {
      code: "jonah-submit-accusation",
      roleCode: "jonah-frost",
       stage: "ACT_2",
      title: "File your final version",
      description: "Submit a full accusation to lock in your story.",
      points: 1,
      rule: { type: "submit-accusation" },
    },
    {
      code: "mira-find-wound",
      roleCode: "mira-hale",
       stage: "ACT_1",
      title: "Document the injuries",
      description: "Secure the medical wound clue once the event begins.",
      points: 2,
      rule: { type: "gain-clue", clueCode: "medical-wound" },
    },
    {
      code: "mira-submit-accusation",
      roleCode: "mira-hale",
       stage: "ACT_2",
      title: "Deliver a clear diagnosis",
      description: "Record your accusation before the reveal.",
      points: 1,
      rule: { type: "submit-accusation" },
    },
    {
      code: "corin-hold-ledger",
      roleCode: "corin-march",
       stage: "ACT_1",
      title: "Control the ledger page",
      description: "Keep the ledger page in your possession while choosing what to do with it.",
      points: 2,
      rule: { type: "possess-item", itemCode: "estate-ledger-page" },
    },
    {
      code: "corin-lock-branch",
      roleCode: "corin-march",
       stage: "ACT_2",
      title: "Commit to your choice",
      description: "Submit your ledger decision before the reveal.",
      points: 2,
      rule: { type: "decision-branch", outcomeKey: "ledger-exposed" },
    },
    {
      code: "lena-hold-key",
      roleCode: "lena-thorne",
       stage: "ACT_1",
      title: "Protect the service routes",
      description: "Keep a key in hand while the household turns on the staff.",
      points: 2,
      rule: { type: "possess-item", itemCode: "silver-key" },
    },
    {
      code: "lena-find-lantern",
      roleCode: "lena-thorne",
       stage: "ACT_2",
      title: "Prove the route was staged",
      description: "Gain the cellar lantern clue.",
      points: 2,
      rule: { type: "gain-clue", clueCode: "cellar-lantern" },
    },
    {
      code: "silas-hold-ring",
      roleCode: "silas-ward",
       stage: "ACT_1",
      title: "Keep the ring close",
      description: "Retain the signet ring through the first phase.",
      points: 2,
      rule: { type: "possess-item", itemCode: "signet-ring" },
    },
    {
      code: "silas-submit-accusation",
      roleCode: "silas-ward",
       stage: "ACT_2",
      title: "Sell your version",
      description: "Submit an accusation before the reveal.",
      points: 1,
      rule: { type: "submit-accusation" },
    },
  ],
  decision: {
    code: "ledger-fate",
    decisionMakerRoleCode: "corin-march",
    title: "Decide the fate of the ledger",
    description: "Corin can reveal the ledger to everyone or destroy it and control the fallout.",
    optionA: {
      label: "Expose the ledger",
      outcomeKey: "ledger-exposed",
      summary: "The debt scandal becomes public and everyone receives a harder clue trail.",
    },
    optionB: {
      label: "Burn the ledger",
      outcomeKey: "ledger-burned",
      summary: "The clean evidence is gone, forcing everyone to work from fragments and testimony.",
    },
  },
  eventAwards: {
    everyoneClueCodes: ["cellar-lantern"],
    branchClueCodes: {
      "ledger-exposed": ["ledger-exposed"],
      "ledger-burned": ["ledger-burned"],
    },
  },
};
