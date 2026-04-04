import type { GameStage, ItemType } from "@prisma/client";

export type PrototypeGoalRule =
  | { type: "possess-item"; itemCode: string }
  | { type: "possess-item-until-stage-end"; itemCode: string }
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

export type PrototypeRoleStageBriefing = {
  summary: string;
  nextSteps: string[];
};

export type PrototypeStageMechanicDefinition = {
  roomActions: boolean;
  decision: boolean;
  accusations: boolean;
};

export type PrototypeRoleDefinition = {
  code: string;
  slotNumber: number;
  characterName: string;
  characterTitle: string;
  publicDescription: string;
  privateDescription: string;
  actTwoBriefing?: string;
  stageBriefings: Record<"setup" | "act-1" | "event-1" | "act-2" | "finale", PrototypeRoleStageBriefing>;
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
  stageMechanics: Record<"setup" | "act-1" | "event-1" | "act-2" | "finale" | "resolution", PrototypeStageMechanicDefinition>;
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
    secretCodes?: string[];
    sourceHints?: string[];
    reachableByRoleCodes?: string[];
  }>;
  items: Array<{
    code: string;
    label: string;
    description: string;
    itemType: ItemType;
    isStealable?: boolean;
    isPlantable?: boolean;
    isTradeable?: boolean;
    usedByGoalCodes?: string[];
    sourceHints?: string[];
  }>;
  goals: Array<{
    code: string;
    roleCode: string;
    stage: GameStage;
    title: string;
    description: string;
    points: number;
    rule: PrototypeGoalRule;
    authorPath?: string[];
    dependsOnClueCodes?: string[];
    dependsOnItemCodes?: string[];
    softContacts?: string[];
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
        "You have arrived at Hale Cabin, an isolated mountain retreat owned by Victor Hale, the hard-edged head of a wealthy family business. A winter storm is gathering outside, the road down the mountain may not stay open all night, and Victor has deliberately brought this small group together before anyone can easily leave. Everyone knows the evening matters. Victor is getting older, the question of who will control the business is hanging in the air, and the room is full of people with history, expectations, and reasons to watch one another closely. You do not know every secret in the house yet, but you do know this is not a casual dinner. Something important is coming, and everyone is already reacting to it.",
      eventTitle: "Why Everyone Is Here",
      eventDescription:
        "Before anything dramatic happens, the central question is simple: what does Victor intend to do tonight? He has hinted that he may make a decision about the future of the family business, and that possibility is already shaping every conversation in the cabin. Some people want influence. Some want protection. Some want information. Some are trying to keep old scandals and private loyalties from becoming useful to the wrong person. Start by learning who you are, why you are here, what you already know, and which people or objects feel most dangerous from your point of view.",
    },
    "act-1": {
      summary:
        "Dinner is underway now, and the pressure in the cabin is no longer hypothetical. Victor still has not made his announcement, but everyone can feel that he is weighing the room. Conversations that sound social on the surface may matter politically underneath. Private tensions are starting to show, sensitive items are already moving from hand to hand, and the difference between a harmless rumor and a real threat is becoming harder to judge. You are not investigating a murder yet. Act 1 is about understanding the people around you, protecting what matters to you, and positioning yourself before Victor's decision and the night's true crisis arrive.",
      eventTitle: "What Act 1 Is About",
      eventDescription:
        "This is the phase where you build your footing. Use Act 1 to talk, search, eavesdrop, trade, steal, or plant if your character has reason to. Pay attention to which relationships feel strained, which rooms seem important, which objects are socially sensitive, and who becomes nervous when certain topics come up. If you are not sure how to start, follow your goals, your inventory, and your private reads on the other characters. Those are your clearest signals for what your character should care about first.",
    },
    "event-1": {
      summary:
        "The night's balance has shattered. The announcement has happened, the blackout has hit, and the house is trying to absorb a violent turn no one can ignore.",
      eventTitle: "The Blackout Murder",
      eventDescription:
        "The murder has happened. Actions pause while everyone absorbs the new reality, fresh clues land, and the next phase of the investigation takes shape.",
    },
    "act-2": {
      summary:
        "Now the game is about motive, means, timing, and survival. Suspicion is spreading, earlier secrets matter more, and every player needs a story strong enough to carry into the finale.",
      eventTitle: "Aftermath And Scramble",
      eventDescription:
        "Use Act 2 to connect the murder to the deeper secrets underneath the weekend while protecting your own position long enough to survive the accusation round.",
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
  stageMechanics: {
    setup: {
      roomActions: false,
      decision: false,
      accusations: false,
    },
    "act-1": {
      roomActions: true,
      decision: true,
      accusations: false,
    },
    "event-1": {
      roomActions: false,
      decision: false,
      accusations: false,
    },
    "act-2": {
      roomActions: true,
      decision: false,
      accusations: false,
    },
    finale: {
      roomActions: false,
      decision: false,
      accusations: true,
    },
    resolution: {
      roomActions: false,
      decision: false,
      accusations: false,
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
      stageBriefings: {
        setup: {
          summary:
            "You are Victor Hale. This weekend exists because you called everyone here to settle succession, control the business narrative, and keep the most dangerous truths in your own hands.",
          nextSteps: [
            "Review who is under pressure before dinner begins.",
            "Keep the safe key and your watch secure.",
            "Decide how much you want Daniel, Marcus, and Eleanor off balance before the announcement.",
          ],
        },
        "act-1": {
          summary:
            "The dinner is in motion. Your job is to keep command of the room long enough to judge who should inherit control and who might become a liability.",
          nextSteps: [
            "Read Daniel and Marcus carefully.",
            "Protect the safe key and anything tied to the books.",
            "Let the room feel your control without exposing more than you must.",
          ],
        },
        "event-1": {
          summary:
            "You have been killed. You no longer move through the house, but your earlier choices, items, and private signals now matter more than your direct control.",
          nextSteps: [
            "Review what you left in motion before the blackout.",
            "Notice which clues can still point others toward the Study and the fraud trail.",
            "Prepare to use Act 2 as a posthumous information seat rather than a living suspect.",
          ],
        },
        "act-2": {
          summary:
            "Your role is now posthumous. The value you add comes from what you already knew, what you were carrying, and which clues can still guide the others toward the truth.",
          nextSteps: [
            "Help connect Marcus to the Study if the path is there.",
            "Watch whether the fraud trail or the family drama becomes dominant.",
            "Decide who deserves the clearest trail from what you left behind.",
          ],
        },
        finale: {
          summary:
            "The accusation round is open. Your job is to turn what you knew before your death into a final, coherent suspicion.",
          nextSteps: [
            "Review the strongest clues connecting motive, means, and timing.",
            "Ignore noise that only creates scandal without explaining the killing.",
            "Submit the clearest accusation you can defend.",
          ],
        },
      },
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
        {
          subjectRoleCode: "eleanor-hale",
          factKey: "eleanor-keeps-sofia-close",
          title: "Eleanor is unusually protective of Sofia",
          body: "Eleanor has been far more attentive to Sofia than the foundation work alone would explain.",
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
      stageBriefings: {
        setup: {
          summary:
            "You are Eleanor Hale. Publicly, you are the poised wife keeping the weekend elegant. Privately, you need to protect your secret with Sofia and judge how dangerous Victor's announcement may be.",
          nextSteps: [
            "Orient yourself to the succession tension in the room.",
            "Keep the hotel receipt out of careless hands.",
            "Identify whether Jack or Marcus is more likely to destabilize the night.",
          ],
        },
        "act-1": {
          summary:
            "Dinner has started. You should look composed, learn who Victor intends to favor, and quietly stop your personal scandal from becoming easy leverage.",
          nextSteps: [
            "Confirm Victor's intended successor.",
            "Track whether Jack's presence is becoming a real threat.",
            "Keep Sofia calm and keep the receipt buried if possible.",
          ],
        },
        "event-1": {
          summary:
            "The night has turned violent. Victor is dead, the room is shocked, and your private life is now both more fragile and more politically useful.",
          nextSteps: [
            "Separate murder questions from pure scandal.",
            "Work out whether Sofia is exposed.",
            "Start shifting attention toward motive, not gossip.",
          ],
        },
        "act-2": {
          summary:
            "You now need to survive both the murder investigation and the fallout around Sofia. The strongest version of your story is one that moves from scandal toward the fraud motive.",
          nextSteps: [
            "Recover or neutralize affair evidence if it is moving.",
            "Follow the fraud thread through Marcus or the Study.",
            "Choose whether to protect the family image or expose what matters.",
          ],
        },
        finale: {
          summary:
            "The accusation phase is no longer about looking graceful. It is about deciding which truth you are willing to stand behind publicly.",
          nextSteps: [
            "Review whether scandal explains embarrassment or actual murder.",
            "Choose the motive you believe best explains Victor's death.",
            "Submit an accusation you can defend in front of the room.",
          ],
        },
      },
      startingItemCodes: ["hotel-receipt"],
      startingClueCodes: ["victor-already-decided"],
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
        {
          subjectRoleCode: "daniel-hale",
          factKey: "daniel-expects-the-crown",
          title: "Daniel thinks tonight belongs to him",
          body: "Daniel is acting less like a son hoping to be chosen and more like an heir expecting the crown by right.",
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
      stageBriefings: {
        setup: {
          summary:
            "You are Daniel Hale, Victor's son, and you believe tonight should end with the business pointed toward you. You expect the room to treat you like the natural heir even if Victor does not.",
          nextSteps: [
            "Notice who is standing too close to Victor's authority.",
            "Decide how you want to carry yourself before dinner starts.",
            "Keep control of the dagger unless moving it helps you more.",
          ],
        },
        "act-1": {
          summary:
            "The succession pressure is live. You need to decide how openly to challenge Victor, watch Marcus closely, and make sure your anger does not become the only story anyone remembers.",
          nextSteps: [
            "Use your decision to define how the room sees your temper.",
            "Look for signs Victor is favoring Marcus.",
            "If you move the dagger, do it on purpose rather than by accident.",
          ],
        },
        "event-1": {
          summary:
            "Victor is dead and you are suddenly the obvious suspect whether you deserve it or not. The room already has an easy story about your anger and the dagger.",
          nextSteps: [
            "Do not panic just because suspicion lands on you first.",
            "Start proving that the dagger story was messy before the murder.",
            "Look for a motive stronger than family resentment.",
          ],
        },
        "act-2": {
          summary:
            "Your best path now is to show that you were the convenient suspect, not necessarily the correct one. The deeper motive likely lives in the business, not in your public anger alone.",
          nextSteps: [
            "Trace the dagger's movement before the blackout.",
            "Push into the fraud and safe records if you can.",
            "Turn Marcus from a polished partner into a believable suspect.",
          ],
        },
        finale: {
          summary:
            "The accusation round is your chance to replace the room's easy first impression with a stronger explanation.",
          nextSteps: [
            "Use the clearest clues that separate anger from murder.",
            "Choose the motive and means you can state without hesitation.",
            "Submit an accusation that beats the obvious story.",
          ],
        },
      },
      startingItemCodes: ["hale-heirloom-dagger"],
      startingClueCodes: ["daniel-entitlement-note"],
      knowledge: [
        {
          subjectRoleCode: "marcus-reed",
          factKey: "marcus-stays-late",
          title: "Marcus gets private meetings",
          body: "You have caught Marcus slipping into Victor's Study after hours more than once this month.",
        },
        {
          subjectRoleCode: "jack-mercer",
          factKey: "jack-was-a-provocation",
          title: "Jack's invitation feels deliberate",
          body: "Victor did not invite Jack by accident. He wanted someone old and dangerous in the room tonight.",
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
      stageBriefings: {
        setup: {
          summary:
            "You are Marcus Reed, Victor's partner. You know the business is dirtier than the family admits, and tonight may determine whether you rise, fall, or get blamed for everything.",
          nextSteps: [
            "Keep the ledger page secure.",
            "Judge whether Victor still intends to favor you or expose you.",
            "Enter dinner looking steady even if you are not.",
          ],
        },
        "act-1": {
          summary:
            "The dinner is active and pressure is rising. You need to confirm whether Victor really plans to choose you, while managing the records and staying outwardly calm.",
          nextSteps: [
            "Protect the ledger page.",
            "Check whether the Study safe or hidden compartment has already been touched.",
            "Do not let audit talk shake you in front of the wrong people.",
          ],
        },
        "event-1": {
          summary:
            "Victor is dead and the danger you feared is now loose in the room. Every clue tied to the Study or the books can now become a weapon against you.",
          nextSteps: [
            "Stay composed even if suspicion starts turning toward the business.",
            "Notice which clues now threaten the fraud trail.",
            "Start thinking about which alternate story is strongest.",
          ],
        },
        "act-2": {
          summary:
            "Act 2 is about survival. You need to redirect attention toward sabotage, Daniel, or chaos while keeping the paper trail from becoming a clean motive.",
          nextSteps: [
            "Keep discussion wide and noisy where it helps you.",
            "Recover or reinterpret fraud-linked evidence if possible.",
            "Make yourself look useful rather than cornered.",
          ],
        },
        finale: {
          summary:
            "The room is choosing a story. Your advantage is confidence and misdirection; your danger is any clean line from the books to Victor's death.",
          nextSteps: [
            "Anchor the accusation on someone easier to picture with motive and means.",
            "Avoid repeating any detail that centers the fraud too cleanly.",
            "Submit an accusation before the room settles against you.",
          ],
        },
      },
      startingItemCodes: ["ledger-page"],
      startingClueCodes: ["marcus-auditor-panic"],
      knowledge: [
        {
          subjectRoleCode: "victor-hale",
          factKey: "victor-promised-a-meeting",
          title: "Victor wanted a private word",
          body: "Victor quietly told you he wanted you in the Study after the announcement, whether the family liked it or not.",
        },
        {
          subjectRoleCode: "daniel-hale",
          factKey: "daniel-has-the-dagger",
          title: "Daniel has been handling the dagger",
          body: "You noticed Daniel treating the heirloom dagger like it already belonged to him.",
        },
      ],
    },
    {
      code: "sofia-vale",
      slotNumber: 5,
      characterName: "Sofia Marlow",
      characterTitle: "The Consultant",
      publicDescription:
        "A family-foundation consultant invited to advise on a charitable expansion, poised enough to belong and new enough to be underestimated.",
      privateDescription:
        "You came for Eleanor, not Victor's empire. Keep your affair hidden, learn why the business is rotting, and do not let yourself become collateral damage.",
      actTwoBriefing:
        "Victor's death makes your secret both riskier and more useful. Pick the truth that protects Eleanor without handing the killer a clean escape.",
      stageBriefings: {
        setup: {
          summary:
            "You are Sofia Marlow, officially here as a consultant and unofficially here for Eleanor. You do not belong to the family power struggle, which makes you both harder to read and easier to underestimate.",
          nextSteps: [
            "Stay socially plausible while reading the room.",
            "Watch for signs that your secret with Eleanor is already exposed.",
            "Pay attention to anything that suggests the business itself is unstable.",
          ],
        },
        "act-1": {
          summary:
            "Dinner is live. Your job is to understand the succession decision, protect Eleanor, and work out whether the real danger tonight is social scandal or something larger.",
          nextSteps: [
            "Confirm who Victor intends to elevate.",
            "Check whether your affair evidence is still contained.",
            "Notice whether the Study and the business records matter more than anyone is saying aloud.",
          ],
        },
        "event-1": {
          summary:
            "The murder changes your position immediately. You are now balancing self-protection, Eleanor's safety, and the possibility that one of the business insiders has killed to bury something.",
          nextSteps: [
            "Stop treating the night as a social disaster alone.",
            "Read the physical evidence more carefully than the gossip.",
            "Decide whether the affair is a distraction or a leverage point.",
          ],
        },
        "act-2": {
          summary:
            "Act 2 rewards calm observation. If you can separate the murder scene from the social scandal, you can become one of the clearest readers of the room.",
          nextSteps: [
            "Look for evidence from the Study aftermath.",
            "Protect Eleanor where you can without becoming blind.",
            "Follow the path from records to motive if it starts opening.",
          ],
        },
        finale: {
          summary:
            "By Finale, your role is to weigh what is merely compromising against what actually explains the killing.",
          nextSteps: [
            "Review whether the physical clues support your suspicion.",
            "Do not let the affair evidence over-explain the murder.",
            "Submit the accusation that best matches what you have actually seen.",
          ],
        },
      },
      startingItemCodes: [],
      startingClueCodes: ["eleanor-too-careful-tonight"],
      knowledge: [
        {
          subjectRoleCode: "eleanor-hale",
          factKey: "eleanor-fears-exposure",
          title: "Eleanor is close to breaking",
          body: "Eleanor can keep a room calm, but Victor's announcement had her bracing for a personal disaster too.",
        },
        {
          subjectRoleCode: "marcus-reed",
          factKey: "marcus-hates-auditors",
          title: "Marcus hates outside scrutiny",
          body: "Marcus tenses whenever anyone mentions auditors, regulators, or outside reviews.",
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
      stageBriefings: {
        setup: {
          summary:
            "You are Jack Mercer, invited under the excuse of storm prep and cabin systems. In truth, Victor ruined your life and you came up this mountain with your own agenda.",
          nextSteps: [
            "Keep your fuse puller out of sight.",
            "Read whether Victor thinks he owns you or fears you.",
            "Decide how bold you can afford to be before dinner begins.",
          ],
        },
        "act-1": {
          summary:
            "The house is distracted by succession, which gives you room to move. Your challenge is to keep your sabotage separate from the far worse thing someone else may do with it.",
          nextSteps: [
            "Check what the Basement can reveal or expose.",
            "Get hold of something valuable if the opportunity appears.",
            "Avoid looking like the only man in the house with a grudge.",
          ],
        },
        "event-1": {
          summary:
            "The blackout happened, but now there is also a murder. That is bad for you. If the room collapses sabotage and killing into one story, you are in real danger.",
          nextSteps: [
            "Do not deny the physical reality of the sabotage if it will be found anyway.",
            "Start separating timing, motive, and weapon.",
            "Watch who benefits most from the room thinking chaos alone caused everything.",
          ],
        },
        "act-2": {
          summary:
            "Your entire Act 2 job is separation: your blackout from the murder, your revenge from the killing, the dagger chaos from the true motive.",
          nextSteps: [
            "Collect timing evidence tied to the blackout window.",
            "Show that the dagger was moving before the murder.",
            "Push the room toward the person who used your chaos best.",
          ],
        },
        finale: {
          summary:
            "The final accusation is where you either remain the house villain or prove that someone else turned your chaos into murder.",
          nextSteps: [
            "Use timing and item-circulation clues together.",
            "Avoid over-defending yourself if it makes you sound guilty.",
            "Submit the accusation that best separates sabotage from killing.",
          ],
        },
      },
      startingItemCodes: ["fuse-puller"],
      startingClueCodes: ["old-lawsuit-clipping"],
      knowledge: [
        {
          subjectRoleCode: "victor-hale",
          factKey: "victor-bought-you-off",
          title: "Victor expected obedience",
          body: "Victor invited you because he thought a paid inspection and a drink would settle what he did to you years ago.",
        },
        {
          subjectRoleCode: "daniel-hale",
          factKey: "daniel-is-the-obvious-suspect",
          title: "Daniel is too obvious",
          body: "If anything goes wrong tonight, the room will find it very easy to blame Daniel first.",
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
        {
          key: "living-listen-3",
          text: "Jack casually asks how long the cabin would stay dark if the main panel tripped before the backup lights recovered.",
          clueCode: "jack-counted-the-lights",
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
      secretCodes: ["victor-chooses-marcus"],
      sourceHints: ["Starting clue: Victor"],
      reachableByRoleCodes: ["victor-hale"],
    },
    {
      code: "daniel-entitlement-note",
      title: "Daniel's Entitlement Note",
      body: "Daniel has been speaking like the succession is already his, and the rest of the house has noticed.",
      secretCodes: ["victor-chooses-marcus"],
      sourceHints: ["Starting clue: Daniel"],
      reachableByRoleCodes: ["daniel-hale", "victor-hale"],
    },
    {
      code: "old-lawsuit-clipping",
      title: "Old Lawsuit Clipping",
      body: "Jack once lost his business after Victor squeezed him through a lawsuit and a bank call no one could trace.",
      secretCodes: ["jack-caused-blackout"],
      sourceHints: ["Starting clue: Jack"],
      reachableByRoleCodes: ["jack-mercer", "eleanor-hale"],
    },
    {
      code: "successor-toast-card",
      title: "Successor Toast Card",
      body: "Victor's private toast notes show Marcus's name prepared well before the public announcement.",
      secretCodes: ["victor-chooses-marcus"],
      sourceHints: ["Living Room search, Act 1"],
      reachableByRoleCodes: ["eleanor-hale", "daniel-hale", "sofia-vale", "marcus-reed"],
    },
    {
      code: "victor-already-decided",
      title: "Victor Has Already Chosen",
      body: "Victor is carrying himself like a man who has already made up his mind and is now waiting to see how the room reacts.",
      secretCodes: ["victor-chooses-marcus"],
      sourceHints: ["Starting clue: Eleanor"],
      reachableByRoleCodes: ["eleanor-hale"],
    },
    {
      code: "victor-announcement-notes",
      title: "Victor's Announcement Notes",
      body: "Victor planned to name Marcus and saddle him with cleaning up the business mess afterward.",
      secretCodes: ["victor-chooses-marcus", "business-fraud"],
      sourceHints: ["Bedroom search, Act 2"],
      reachableByRoleCodes: ["eleanor-hale", "sofia-vale", "daniel-hale", "marcus-reed"],
    },
    {
      code: "marcus-auditor-panic",
      title: "Marcus Panics About Auditors",
      body: "Marcus becomes visibly tense whenever auditors or external reviews are mentioned.",
      secretCodes: ["business-fraud"],
      sourceHints: ["Starting clue: Marcus", "Study eavesdrop, Act 1"],
      reachableByRoleCodes: ["marcus-reed", "daniel-hale", "sofia-vale", "eleanor-hale"],
    },
    {
      code: "safe-scratched-open",
      title: "Safe Scratched Open",
      body: "Victor's safe shows hurried scratches, as if someone forced access while pretending they belonged there.",
      secretCodes: ["business-fraud"],
      sourceHints: ["Study search, Act 1"],
      reachableByRoleCodes: ["marcus-reed", "eleanor-hale", "sofia-vale"],
    },
    {
      code: "hidden-compartment-disturbed",
      title: "Hidden Compartment Disturbed",
      body: "A hidden compartment behind the Study painting was definitely opened recently, probably for documents rather than cash.",
      secretCodes: ["business-fraud"],
      sourceHints: ["Study search, Act 1"],
      reachableByRoleCodes: ["marcus-reed", "eleanor-hale", "sofia-vale"],
    },
    {
      code: "ledger-page-redactions",
      title: "Ledger Page With Redactions",
      body: "A copied ledger page points to cooked books, shell entries, and Marcus's fingerprints all over the cover-up.",
      secretCodes: ["business-fraud"],
      sourceHints: ["Kitchen search, Act 2"],
      reachableByRoleCodes: ["marcus-reed", "daniel-hale", "eleanor-hale", "sofia-vale"],
    },
    {
      code: "eleanor-too-careful-tonight",
      title: "Eleanor Is Too Careful Tonight",
      body: "Eleanor is being more careful than usual about where she stands near you and who sees the two of you together, which suggests she fears exposure.",
      secretCodes: ["eleanor-sofia-affair"],
      sourceHints: ["Starting clue: Sofia"],
      reachableByRoleCodes: ["sofia-vale"],
    },
    {
      code: "matching-spa-receipt",
      title: "Matching Hotel Receipt",
      body: "Sofia's hotel receipt matches the weekend Eleanor claimed to be away at a spa by herself.",
      secretCodes: ["eleanor-sofia-affair"],
      sourceHints: ["Kitchen eavesdrop, Act 1", "Bedroom search, Act 1"],
      reachableByRoleCodes: ["sofia-vale", "eleanor-hale"],
    },
    {
      code: "monogrammed-scarf",
      title: "Monogrammed Scarf",
      body: "A scarf tucked into the kitchen linen suggests Eleanor and Sofia had no intention of staying apart all evening.",
      secretCodes: ["eleanor-sofia-affair"],
      sourceHints: ["Kitchen search, Act 1"],
      reachableByRoleCodes: ["eleanor-hale", "sofia-vale"],
    },
    {
      code: "midnight-balcony-whisper",
      title: "Midnight Balcony Whisper",
      body: "Eleanor and Sofia speak with the intimacy of people hiding a secret, not just a business arrangement.",
      secretCodes: ["eleanor-sofia-affair"],
      sourceHints: ["Bedroom eavesdrop, Act 1"],
      reachableByRoleCodes: ["eleanor-hale", "sofia-vale"],
    },
    {
      code: "dagger-seen-with-daniel",
      title: "Dagger Seen With Daniel",
      body: "Daniel was openly seen with the Hale heirloom dagger before dinner, giving everyone a neat early suspect story.",
      secretCodes: ["dagger-circulation"],
      sourceHints: ["Living Room eavesdrop, Act 1"],
      reachableByRoleCodes: ["daniel-hale", "jack-mercer", "marcus-reed"],
    },
    {
      code: "display-stand-empty",
      title: "Display Stand Empty",
      body: "The dagger display in the Living Room was empty before the murder, so someone moved the weapon well ahead of the blackout.",
      secretCodes: ["dagger-circulation"],
      sourceHints: ["Living Room search, Act 1"],
      reachableByRoleCodes: ["daniel-hale", "jack-mercer", "eleanor-hale"],
    },
    {
      code: "dagger-return-rumor",
      title: "Rumor Of The Dagger's Return",
      body: "Different people swear they saw the dagger leave Daniel's hands and then appear elsewhere before the lights went out.",
      secretCodes: ["dagger-circulation"],
      sourceHints: ["Bedroom eavesdrop, Act 2"],
      reachableByRoleCodes: ["daniel-hale", "jack-mercer", "marcus-reed"],
    },
    {
      code: "basement-panel-fresh",
      title: "Basement Panel Freshly Opened",
      body: "The basement electrical panel was tampered with recently and deliberately.",
      secretCodes: ["jack-caused-blackout"],
      sourceHints: ["Basement search, Act 1"],
      reachableByRoleCodes: ["jack-mercer", "eleanor-hale"],
    },
    {
      code: "fuse-grease",
      title: "Fuse Puller Grease",
      body: "A tool coated in grease matches the residue around the panel, suggesting the blackout was engineered rather than accidental.",
      secretCodes: ["jack-caused-blackout"],
      sourceHints: ["Basement search, Act 1"],
      reachableByRoleCodes: ["jack-mercer", "eleanor-hale"],
    },
    {
      code: "jack-generator-questions",
      title: "Jack Asked About The Generator",
      body: "Jack asked very specific questions about the timing and reset behavior of the cabin's power system.",
      secretCodes: ["jack-caused-blackout"],
      sourceHints: ["Basement eavesdrop, Act 1"],
      reachableByRoleCodes: ["jack-mercer", "eleanor-hale"],
    },
    {
      code: "jack-counted-the-lights",
      title: "Jack Counted The Seconds",
      body: "Jack was quietly working out how long the cabin would stay dark if the power failed, which makes his interest in the blackout feel too specific to be innocent.",
      secretCodes: ["jack-caused-blackout"],
      sourceHints: ["Living Room eavesdrop, Act 1"],
      reachableByRoleCodes: ["daniel-hale", "marcus-reed", "sofia-vale", "eleanor-hale"],
    },
    {
      code: "blackout-timing",
      title: "Blackout Timing",
      body: "The blackout created a narrow window between Victor entering the Study and the murder, separating sabotage from the killing itself.",
      secretCodes: ["jack-caused-blackout", "marcus-killed-victor"],
      sourceHints: ["Event 1 award", "Kitchen eavesdrop, Act 2", "Basement search, Act 2"],
      reachableByRoleCodes: ["jack-mercer", "daniel-hale", "marcus-reed", "sofia-vale"],
    },
    {
      code: "victor-called-marcus-back",
      title: "Victor Called Marcus Back",
      body: "Victor privately told Marcus to join him in the Study after the announcement, placing Marcus on the murder path for a reason.",
      secretCodes: ["victor-chooses-marcus", "marcus-killed-victor"],
      sourceHints: ["Living Room eavesdrop, Act 1"],
      reachableByRoleCodes: ["victor-hale", "marcus-reed", "daniel-hale"],
    },
    {
      code: "study-door-ajar",
      title: "Study Door Left Ajar",
      body: "The Study door was left slightly open during the darkness, suggesting someone slipped in confident they belonged there.",
      secretCodes: ["marcus-killed-victor"],
      sourceHints: ["Living Room search, Act 2"],
      reachableByRoleCodes: ["jack-mercer", "sofia-vale", "daniel-hale"],
    },
    {
      code: "study-blood-angle",
      title: "Study Blood Angle",
      body: "The wound angle suggests a deliberate, close strike rather than a panicked fight in the dark.",
      secretCodes: ["marcus-killed-victor"],
      sourceHints: ["Study eavesdrop, Act 2"],
      reachableByRoleCodes: ["sofia-vale", "victor-hale", "marcus-reed"],
    },
    {
      code: "safe-rifled-after-death",
      title: "Safe Rifled After Death",
      body: "Whoever went through the safe did it after Victor was already down, likely to muddy motive and scramble the fraud trail.",
      secretCodes: ["business-fraud", "marcus-killed-victor"],
      sourceHints: ["Study search, Act 2", "Basement eavesdrop, Act 2"],
      reachableByRoleCodes: ["marcus-reed", "eleanor-hale", "daniel-hale", "sofia-vale"],
    },
    {
      code: "daniel-public-outburst",
      title: "Daniel's Public Outburst",
      body: "Daniel openly challenged Victor before the announcement, making his anger the night's most obvious public motive.",
      secretCodes: [],
      sourceHints: ["Decision outcome: Daniel public challenge"],
      reachableByRoleCodes: ["daniel-hale"],
    },
    {
      code: "daniel-swallowed-anger",
      title: "Daniel Swallowed The Anger",
      body: "Daniel kept the peace in public, which makes his private resentment feel colder and harder to read.",
      secretCodes: [],
      sourceHints: ["Decision outcome: Daniel stays cold"],
      reachableByRoleCodes: ["daniel-hale"],
    },
    {
      code: "victor-dead-in-study",
      title: "Victor Dead In The Study",
      body: "Victor was killed in the Study during the blackout, and everyone now knows the succession dinner has become a murder investigation.",
      secretCodes: ["marcus-killed-victor"],
      sourceHints: ["Event 1 award"],
      reachableByRoleCodes: ["victor-hale", "eleanor-hale", "daniel-hale", "marcus-reed", "sofia-vale", "jack-mercer"],
    },
    {
      code: "dagger-missing-after-blackout",
      title: "Dagger Missing After The Blackout",
      body: "The Hale heirloom dagger is no longer where anyone expected it to be once Victor's body is found.",
      secretCodes: ["dagger-circulation", "marcus-killed-victor"],
      sourceHints: ["Event 1 award"],
      reachableByRoleCodes: ["victor-hale", "eleanor-hale", "daniel-hale", "marcus-reed", "sofia-vale", "jack-mercer"],
    },
  ],
  items: [
    {
      code: "hale-heirloom-dagger",
      label: "Hale Heirloom Dagger",
      description: "A ceremonial family dagger with enough history to start arguments before it ever starts bleeding.",
      itemType: "WEAPON",
      usedByGoalCodes: ["daniel-act1-hold-dagger", "jack-act2-track-the-knife-story", "daniel-act2-prove-youre-too-obvious"],
      sourceHints: ["Starting item: Daniel", "Can be traded, pickpocketed, or planted"],
    },
    {
      code: "study-safe-key",
      label: "Study Safe Key",
      description: "Victor's key to the Study safe and its private records.",
      itemType: "KEY_ITEM",
      usedByGoalCodes: ["victor-act1-hold-key", "eleanor-act2-find-fraud", "marcus-act1-track-safe-risk"],
      sourceHints: ["Starting item: Victor", "Can be moved through trade, theft, or planting"],
    },
    {
      code: "ledger-page",
      label: "Ledger Page",
      description: "A copied ledger page that hints at cooked books, shell entries, and legal exposure.",
      itemType: "EVIDENCE",
      usedByGoalCodes: ["marcus-act1-hold-ledger", "marcus-act2-protect-fraud-secret"],
      sourceHints: ["Starting item: Marcus", "Can be traded, pickpocketed, or planted"],
    },
    {
      code: "hotel-receipt",
      label: "Hotel Receipt",
      description: "A small but dangerous receipt that ties Eleanor and Sofia to the same hidden weekend.",
      itemType: "EVIDENCE",
      usedByGoalCodes: ["eleanor-act1-hold-receipt", "sofia-act2-protect-eleanor"],
      sourceHints: ["Starting item: Eleanor", "Can be traded, pickpocketed, or planted"],
    },
    {
      code: "hale-signet-watch",
      label: "Hale Signet Watch",
      description: "Victor's valuable signet watch, flashy enough to steal and important enough to notice missing.",
      itemType: "MONEY",
      usedByGoalCodes: ["jack-act1-grab-value"],
      sourceHints: ["Starting item: Victor", "High-value theft target"],
    },
    {
      code: "fuse-puller",
      label: "Fuse Puller",
      description: "A portable tool that makes a blackout feel accidental to anyone who does not know what to look for.",
      itemType: "KEY_ITEM",
      usedByGoalCodes: ["jack-act1-hold-tool", "jack-act1-check-panel"],
      sourceHints: ["Starting item: Jack", "Matches Basement sabotage clues"],
    },
  ],
  goals: [
    {
      code: "victor-act1-hold-key",
      roleCode: "victor-hale",
      stage: "ACT_1",
      title: "Keep the safe key in hand",
      description: "Keep the Study safe key in your possession through Act 1.",
      points: 1,
      rule: { type: "possess-item-until-stage-end", itemCode: "study-safe-key" },
      authorPath: ["Start with the safe key", "Keep it out of circulation until Victor's announcement lands"],
      dependsOnItemCodes: ["study-safe-key"],
      softContacts: ["marcus-reed", "eleanor-hale"],
    },
    {
      code: "victor-act1-read-the-room",
      roleCode: "victor-hale",
      stage: "ACT_1",
      title: "Measure the challengers",
      description: "Work out whether Daniel or Marcus looks more dangerous before dinner turns.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["daniel-entitlement-note", "marcus-auditor-panic"] },
      authorPath: ["Talk to Daniel or Marcus", "Pressure the succession topic", "Confirm who seems most destabilized"],
      dependsOnClueCodes: ["daniel-entitlement-note", "marcus-auditor-panic"],
      softContacts: ["daniel-hale", "marcus-reed"],
    },
    {
      code: "victor-act2-guide-the-living",
      roleCode: "victor-hale",
      stage: "ACT_2",
      title: "Leave a useful trail",
      description: "Help the others connect the Study aftermath to Marcus or the fraud trail.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["victor-called-marcus-back", "safe-rifled-after-death"] },
      authorPath: ["Push survivors toward the Study thread", "Let them connect Marcus to Victor or the safe"],
      dependsOnClueCodes: ["victor-called-marcus-back", "safe-rifled-after-death"],
      softContacts: ["daniel-hale", "eleanor-hale", "sofia-vale"],
    },
    {
      code: "victor-act2-submit-accusation",
      roleCode: "victor-hale",
      stage: "ACT_2",
      title: "Name the killer",
      description: "Submit your best accusation before the reveal opens.",
      points: 1,
      rule: { type: "submit-accusation" },
      authorPath: ["Carry your suspicion to finale", "Submit a complete accusation"],
      dependsOnClueCodes: ["victor-called-marcus-back", "safe-rifled-after-death", "study-blood-angle"],
    },

    {
      code: "eleanor-act1-hold-receipt",
      roleCode: "eleanor-hale",
      stage: "ACT_1",
      title: "Keep the receipt buried",
      description: "Keep the hotel receipt out of anyone else's hands through Act 1.",
      points: 1,
      rule: { type: "possess-item-until-stage-end", itemCode: "hotel-receipt" },
      authorPath: ["Keep the receipt hidden", "Prevent theft or trade before the murder"],
      dependsOnItemCodes: ["hotel-receipt"],
      softContacts: ["sofia-vale"],
    },
    {
      code: "eleanor-act1-learn-succession",
      roleCode: "eleanor-hale",
      stage: "ACT_1",
      title: "Confirm Victor's choice",
      description: "Learn who Victor truly intends to name as successor.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["successor-toast-card", "victor-announcement-notes", "victor-called-marcus-back"] },
      authorPath: ["Search the Living Room or Bedroom", "Or overhear Victor's private instructions", "Confirm Marcus is the intended choice"],
      dependsOnClueCodes: ["successor-toast-card", "victor-announcement-notes", "victor-called-marcus-back"],
      softContacts: ["victor-hale", "daniel-hale", "marcus-reed"],
    },
    {
      code: "eleanor-act1-track-jack",
      roleCode: "eleanor-hale",
      stage: "ACT_1",
      title: "Work out Jack's angle",
      description: "Find out whether Jack came here for more than storm repairs.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["old-lawsuit-clipping", "jack-generator-questions", "jack-counted-the-lights", "basement-panel-fresh"] },
      authorPath: ["Press Jack socially or check the Basement", "Connect his history with the sabotage thread"],
      dependsOnClueCodes: ["old-lawsuit-clipping", "jack-generator-questions", "jack-counted-the-lights", "basement-panel-fresh"],
      softContacts: ["jack-mercer"],
    },
    {
      code: "eleanor-act2-protect-sofia",
      roleCode: "eleanor-hale",
      stage: "ACT_2",
      title: "Control the affair fallout",
      description: "Confirm whether your secret with Sofia is in danger of exposure.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["matching-spa-receipt", "monogrammed-scarf", "midnight-balcony-whisper"] },
      authorPath: ["Recover or trace the affair evidence", "Decide whether to bury it or weaponize it"],
      dependsOnClueCodes: ["matching-spa-receipt", "monogrammed-scarf", "midnight-balcony-whisper"],
      dependsOnItemCodes: ["hotel-receipt"],
      softContacts: ["sofia-vale"],
    },
    {
      code: "eleanor-act2-find-fraud",
      roleCode: "eleanor-hale",
      stage: "ACT_2",
      title: "Find the business motive",
      description: "Find evidence that points to business fraud rather than family drama.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["safe-rifled-after-death", "ledger-page-redactions", "marcus-auditor-panic"] },
      authorPath: ["Move from gossip to records", "Focus on Marcus or the Study safe", "Anchor a motive beyond family resentment"],
      dependsOnClueCodes: ["safe-rifled-after-death", "ledger-page-redactions", "marcus-auditor-panic"],
      dependsOnItemCodes: ["study-safe-key"],
      softContacts: ["marcus-reed", "victor-hale", "jack-mercer"],
    },
    {
      code: "eleanor-act2-submit-accusation",
      roleCode: "eleanor-hale",
      stage: "ACT_2",
      title: "Choose your story",
      description: "Choose your public story and submit it in Finale.",
      points: 1,
      rule: { type: "submit-accusation" },
      authorPath: ["Choose whether scandal or fraud matters more", "Submit your accusation in Finale"],
      dependsOnClueCodes: ["safe-rifled-after-death", "midnight-balcony-whisper", "victor-called-marcus-back"],
    },

    {
      code: "daniel-act1-hold-dagger",
      roleCode: "daniel-hale",
      stage: "ACT_1",
      title: "Keep the dagger under control",
      description: "Keep the heirloom dagger in your possession through Act 1 if you can.",
      points: 1,
      rule: { type: "possess-item-until-stage-end", itemCode: "hale-heirloom-dagger" },
      authorPath: ["Start with the dagger", "Hold onto it through Act 1 if you do not want the weapon story to drift away from you"],
      dependsOnItemCodes: ["hale-heirloom-dagger"],
      softContacts: ["jack-mercer", "marcus-reed"],
    },
    {
      code: "daniel-act1-decide-posture",
      roleCode: "daniel-hale",
      stage: "ACT_1",
      title: "Choose how you take the insult",
      description: "Decide whether you confront Victor or swallow the insult before the announcement.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["daniel-public-outburst", "daniel-swallowed-anger"] },
      authorPath: ["Use your Act 1 decision", "Lock in how the room will remember your anger"],
      dependsOnClueCodes: ["daniel-public-outburst", "daniel-swallowed-anger"],
      softContacts: ["victor-hale"],
    },
    {
      code: "daniel-act1-see-marcus-clearly",
      roleCode: "daniel-hale",
      stage: "ACT_1",
      title: "Catch Marcus acting guilty",
      description: "Catch Marcus showing fear, nerves, or private access you can use against him.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["marcus-auditor-panic", "victor-called-marcus-back"] },
      authorPath: ["Watch Marcus around audit talk", "Or learn Victor called him to the Study", "Turn your jealousy into a real lead"],
      dependsOnClueCodes: ["marcus-auditor-panic", "victor-called-marcus-back"],
      softContacts: ["marcus-reed", "victor-hale"],
    },
    {
      code: "daniel-act2-prove-youre-too-obvious",
      roleCode: "daniel-hale",
      stage: "ACT_2",
      title: "Show that you were the easy suspect",
      description: "Show that the dagger was already moving around the house before the murder.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["display-stand-empty", "dagger-return-rumor", "dagger-missing-after-blackout"] },
      authorPath: ["Show the dagger was already moving", "Reframe yourself as the obvious decoy suspect"],
      dependsOnClueCodes: ["display-stand-empty", "dagger-return-rumor", "dagger-missing-after-blackout"],
      dependsOnItemCodes: ["hale-heirloom-dagger"],
      softContacts: ["jack-mercer", "eleanor-hale"],
    },
    {
      code: "daniel-act2-find-the-real-motive",
      roleCode: "daniel-hale",
      stage: "ACT_2",
      title: "Find the stronger motive",
      description: "Find a motive stronger than your own anger and the inheritance fight.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["safe-rifled-after-death", "ledger-page-redactions", "marcus-auditor-panic"] },
      authorPath: ["Follow Marcus into the business angle", "Find a clue that beats the family-drama motive"],
      dependsOnClueCodes: ["safe-rifled-after-death", "ledger-page-redactions", "marcus-auditor-panic"],
      softContacts: ["marcus-reed", "victor-hale"],
    },
    {
      code: "daniel-act2-submit-accusation",
      roleCode: "daniel-hale",
      stage: "ACT_2",
      title: "Make the room believe you",
      description: "Build a stronger story than the one that makes you look guilty and submit it in Finale.",
      points: 1,
      rule: { type: "submit-accusation" },
      authorPath: ["Turn suspicion into a coherent case", "Submit it in Finale"],
      dependsOnClueCodes: ["display-stand-empty", "safe-rifled-after-death", "victor-called-marcus-back"],
    },

    {
      code: "marcus-act1-hold-ledger",
      roleCode: "marcus-reed",
      stage: "ACT_1",
      title: "Control the paper trail",
      description: "Keep the ledger page under your control during Act 1.",
      points: 1,
      rule: { type: "possess-item-until-stage-end", itemCode: "ledger-page" },
      authorPath: ["Start with the ledger page", "Prevent anyone else from stabilizing the fraud story"],
      dependsOnItemCodes: ["ledger-page"],
      softContacts: ["victor-hale"],
    },
    {
      code: "marcus-act1-track-safe-risk",
      roleCode: "marcus-reed",
      stage: "ACT_1",
      title: "Check what Victor hid",
      description: "Check whether Victor's private records have already been disturbed.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["safe-scratched-open", "hidden-compartment-disturbed"] },
      authorPath: ["Check the Study early", "Confirm whether Victor moved the records already"],
      dependsOnClueCodes: ["safe-scratched-open", "hidden-compartment-disturbed"],
      dependsOnItemCodes: ["study-safe-key"],
      softContacts: ["victor-hale", "jack-mercer"],
    },
    {
      code: "marcus-act1-confirm-succession",
      roleCode: "marcus-reed",
      stage: "ACT_1",
      title: "Confirm that Victor still means to choose you",
      description: "Confirm that Victor truly means to choose you tonight.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["successor-toast-card", "victor-announcement-notes", "victor-called-marcus-back"] },
      authorPath: ["Search for Victor's prepared remarks", "Or confirm he summoned you privately", "Make sure the promotion is real before it turns dangerous"],
      dependsOnClueCodes: ["successor-toast-card", "victor-announcement-notes", "victor-called-marcus-back"],
      softContacts: ["victor-hale"],
    },
    {
      code: "marcus-act2-keep-calm",
      roleCode: "marcus-reed",
      stage: "ACT_2",
      title: "Look useful, not cornered",
      description: "Collect material that lets you redirect suspicion toward Daniel or the blackout.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["blackout-timing", "daniel-public-outburst", "dagger-seen-with-daniel"] },
      authorPath: ["Redirect the room toward Daniel or the sabotage", "Keep your own motive off center stage"],
      dependsOnClueCodes: ["blackout-timing", "daniel-public-outburst", "dagger-seen-with-daniel"],
      softContacts: ["daniel-hale", "jack-mercer"],
    },
    {
      code: "marcus-act2-protect-fraud-secret",
      roleCode: "marcus-reed",
      stage: "ACT_2",
      title: "Keep the fraud from becoming the whole story",
      description: "Keep control of the fraud trail or recover it if it slips away.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["ledger-page-redactions", "safe-rifled-after-death"] },
      authorPath: ["Keep control of the paper trail", "Or reinterpret the safe scene before others do"],
      dependsOnClueCodes: ["ledger-page-redactions", "safe-rifled-after-death"],
      dependsOnItemCodes: ["ledger-page"],
      softContacts: ["victor-hale", "eleanor-hale"],
    },
    {
      code: "marcus-act2-submit-accusation",
      roleCode: "marcus-reed",
      stage: "ACT_2",
      title: "Accuse before they accuse you",
      description: "Submit an accusation that keeps attention away from you.",
      points: 1,
      rule: { type: "submit-accusation" },
      authorPath: ["Accuse early and confidently in Finale", "Keep the room focused away from fraud exposure"],
      dependsOnClueCodes: ["blackout-timing", "dagger-seen-with-daniel", "daniel-public-outburst"],
    },

    {
      code: "sofia-act1-learn-choice",
      roleCode: "sofia-vale",
      stage: "ACT_1",
      title: "Learn who Victor intends to elevate",
      description: "Confirm who Victor really plans to elevate.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["successor-toast-card", "victor-announcement-notes", "victor-called-marcus-back"] },
      authorPath: ["Search the social spaces", "Confirm the succession truth before the room turns violent"],
      dependsOnClueCodes: ["successor-toast-card", "victor-announcement-notes", "victor-called-marcus-back"],
      softContacts: ["eleanor-hale", "victor-hale"],
    },
    {
      code: "sofia-act1-track-affair-risk",
      roleCode: "sofia-vale",
      stage: "ACT_1",
      title: "Measure how exposed you are",
      description: "Check whether your secret with Eleanor is already leaking into the house.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["matching-spa-receipt", "monogrammed-scarf", "midnight-balcony-whisper"] },
      authorPath: ["Check whether the affair evidence escaped control", "Judge whether silence or leverage is safer"],
      dependsOnClueCodes: ["matching-spa-receipt", "monogrammed-scarf", "midnight-balcony-whisper"],
      dependsOnItemCodes: ["hotel-receipt"],
      softContacts: ["eleanor-hale"],
    },
    {
      code: "sofia-act1-find-fraud-thread",
      roleCode: "sofia-vale",
      stage: "ACT_1",
      title: "Find the uglier secret",
      description: "Find proof that the business may be hiding something uglier than family drama.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["safe-scratched-open", "hidden-compartment-disturbed", "marcus-auditor-panic"] },
      authorPath: ["Notice the Study is about records, not just succession", "Connect Marcus to the deeper secret"],
      dependsOnClueCodes: ["safe-scratched-open", "hidden-compartment-disturbed", "marcus-auditor-panic"],
      dependsOnItemCodes: ["study-safe-key"],
      softContacts: ["marcus-reed", "victor-hale"],
    },
    {
      code: "sofia-act2-read-the-scene",
      roleCode: "sofia-vale",
      stage: "ACT_2",
      title: "Understand the murder scene",
      description: "Focus on the actual murder scene instead of the room's gossip.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["study-blood-angle", "study-door-ajar", "safe-rifled-after-death"] },
      authorPath: ["Leave social scandal behind", "Read the physical murder scene instead"],
      dependsOnClueCodes: ["study-blood-angle", "study-door-ajar", "safe-rifled-after-death"],
      softContacts: ["victor-hale", "marcus-reed"],
    },
    {
      code: "sofia-act2-protect-eleanor",
      roleCode: "sofia-vale",
      stage: "ACT_2",
      title: "Keep Eleanor from becoming the easy scandal",
      description: "Recover the hotel receipt if it starts moving around the house.",
      points: 1,
      rule: { type: "possess-item", itemCode: "hotel-receipt" },
      authorPath: ["Recover the receipt from whoever holds it", "Keep Eleanor from being cornered by scandal evidence"],
      dependsOnItemCodes: ["hotel-receipt"],
      softContacts: ["eleanor-hale"],
    },
    {
      code: "sofia-act2-submit-accusation",
      roleCode: "sofia-vale",
      stage: "ACT_2",
      title: "Pick a suspect you can live with",
      description: "Choose the accusation you can live with and submit it in Finale.",
      points: 1,
      rule: { type: "submit-accusation" },
      authorPath: ["Balance truth against protection", "Submit your accusation in Finale"],
      dependsOnClueCodes: ["study-blood-angle", "matching-spa-receipt", "safe-rifled-after-death"],
    },

    {
      code: "jack-act1-hold-tool",
      roleCode: "jack-mercer",
      stage: "ACT_1",
      title: "Keep your tool close",
      description: "Keep the fuse puller out of anyone else's hands through Act 1.",
      points: 1,
      rule: { type: "possess-item-until-stage-end", itemCode: "fuse-puller" },
      authorPath: ["Start with the fuse puller", "Keep it from becoming obvious sabotage evidence too early"],
      dependsOnItemCodes: ["fuse-puller"],
      softContacts: ["victor-hale"],
    },
    {
      code: "jack-act1-check-panel",
      roleCode: "jack-mercer",
      stage: "ACT_1",
      title: "Make sure the panel work reads as accidental",
      description: "Check how much the Basement reveals about the sabotage setup.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["basement-panel-fresh", "fuse-grease", "jack-generator-questions"] },
      authorPath: ["Visit the Basement", "Audit what traces your sabotage left behind", "Decide if you need to move or redirect evidence"],
      dependsOnClueCodes: ["basement-panel-fresh", "fuse-grease", "jack-generator-questions"],
      dependsOnItemCodes: ["fuse-puller"],
      softContacts: ["eleanor-hale"],
    },
    {
      code: "jack-act1-grab-value",
      roleCode: "jack-mercer",
      stage: "ACT_1",
      title: "Put your hands on something Victor will miss",
      description: "Get Victor's signet watch into circulation if an opening appears.",
      points: 1,
      rule: { type: "possess-item", itemCode: "hale-signet-watch" },
      authorPath: ["Exploit the distraction around Victor", "Move the watch into your possession before the murder or its aftermath tightens the house"],
      dependsOnItemCodes: ["hale-signet-watch"],
      softContacts: ["victor-hale"],
    },
    {
      code: "jack-act2-separate-blackout-from-murder",
      roleCode: "jack-mercer",
      stage: "ACT_2",
      title: "Separate your blackout from the killing",
      description: "Find evidence that separates the blackout from the actual killing.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["blackout-timing", "study-door-ajar", "victor-called-marcus-back"] },
      authorPath: ["Prove the blackout created the window", "Then separate your sabotage from the actual killing"],
      dependsOnClueCodes: ["blackout-timing", "study-door-ajar", "victor-called-marcus-back"],
      dependsOnItemCodes: ["fuse-puller"],
      softContacts: ["marcus-reed", "victor-hale"],
    },
    {
      code: "jack-act2-track-the-knife-story",
      roleCode: "jack-mercer",
      stage: "ACT_2",
      title: "Keep the dagger story muddy",
      description: "Prove that the dagger passed through multiple hands before the murder.",
      points: 1,
      rule: { type: "gain-any-clue", clueCodes: ["dagger-seen-with-daniel", "display-stand-empty", "dagger-return-rumor"] },
      authorPath: ["Show the dagger was social chaos before it was a murder weapon", "Keep suspicion broad enough to survive"],
      dependsOnClueCodes: ["dagger-seen-with-daniel", "display-stand-empty", "dagger-return-rumor"],
      dependsOnItemCodes: ["hale-heirloom-dagger"],
      softContacts: ["daniel-hale", "marcus-reed"],
    },
    {
      code: "jack-act2-submit-accusation",
      roleCode: "jack-mercer",
      stage: "ACT_2",
      title: "Blame the right sin",
      description: "Blame the sin that actually explains the killing and submit it in Finale.",
      points: 1,
      rule: { type: "submit-accusation" },
      authorPath: ["Tell the room which sin actually matters", "Submit your accusation in Finale"],
      dependsOnClueCodes: ["blackout-timing", "display-stand-empty", "safe-rifled-after-death"],
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
