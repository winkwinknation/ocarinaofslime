// ALL the writing lives here so the phase-9 punch-up pass has one target.
import type { DialogueLine } from '../state/store'

const L = (name: string, text: string): DialogueLine => ({ name, text })

export const dlg = {
  // ---------- Slurpia (gives ocarina, teaches her song) ----------
  slurpiaFirst: [
    L('Slurpia', "Glink! You're awake! And vertical! Big day for you."),
    L('Slurpia', 'Listen, the Great Gunk Tree is sick. Like, REALLY sick. He coughed up a bird yesterday. Birds go IN trees, Glink.'),
    L('Slurpia', "The prophecy says a hero will save him. It describes you... weirdly specifically. 'Damp. Green. Owns a hat.'"),
    L('Slurpia', "Take my spare ocarina. It's shaped like a potato because it IS slightly a potato. Don't think about it."),
    L('Slurpia', 'Press Z (or the 🎵 button) to play it! Music is basically magic here. Our economy runs on it.'),
  ],
  slurpiaTeach: [
    L('Slurpia', "Oh! And let me teach you MY song. It's a certified village banger. DJ Gunk Tree used to drop it every solstice."),
  ],
  slurpiaAfter: [
    L('Slurpia', 'Go save the tree, hero! The plains are north, past Smido. Good luck with Smido. He is the worst.'),
  ],

  // ---------- Smido (gate) ----------
  smidoBlocked: [
    L('Smido', "HALT. Nobody passes to Sloshy Plains without a sword AND a shield. It's the LAW. I checked."),
    L('Smido', "You have neither. You have a hat. The hat is not equipment, Glink. We've been over this."),
    L('Smido', 'There\'s a "free sword" in that chest over there, and Gloop sells shields. This village hands you everything, honestly.'),
  ],
  smidoSwordOnly: [
    L('Smido', 'A sword! Okay. That is 50% of the requirements. I am legally able to be 50% impressed.'),
    L('Smido', 'Shield. Gloop\'s shop. Go. The hat STILL doesn\'t count.'),
  ],
  smidoOpen: [
    L('Smido', 'Sword... shield... ugh. FINE. The requirements are met. I hate when the requirements are met.'),
    L('Smido', "Go on then. Save the tree or whatever. I'll just be here. Guarding. It's a whole thing."),
    L('Smido', '...Be careful out there, you damp little idiot.'),
  ],
  smidoAfter: [
    L('Smido', 'Yes, the gate is still open. No, I will not be doing anything about the monsters. Different department.'),
  ],

  // ---------- Shopkeeper Gloop ----------
  shopIntro: [
    L('Gloop', "Welcome to GLOOP'S GOODS, the village's #1 shop! Also the only shop. The ranking system is rigged."),
    L('Gloop', "Today's special: the MOSTLY DEKU SHIELD. It's 'mostly' deku. Don't ask what the rest is. 40 gloopees."),
  ],
  shopBroke: (g: number) => [
    L('Gloop', `That's a purchase attempt with ${g} gloopees. The shield costs 40. I admire the confidence though.`),
    L('Gloop', 'Pro tip: grass contains money here. Yes, our ecosystem is broken. Smash some pots too, nobody minds.'),
  ],
  shopBought: [
    L('Gloop', 'SOLD! One Mostly Deku Shield. No refunds, no warranty, no further questions.'),
    L('Gloop', "It blocks... some things. Emotionally, it blocks everything. Wear it with pride."),
  ],
  shopAfter: [
    L('Gloop', "You already bought my entire inventory. This is now just a hut with a counter. ...Lovely day though, isn't it?"),
  ],

  // ---------- Mopey (sad slime, heart container quest) ----------
  mopeySad: [
    L('Mopey', '*sigh*'),
    L('Mopey', "Oh. Hi Glink. Don't mind me. I'm just so... so sad. The vibes left me. The vibes are GONE, Glink."),
    L('Mopey', 'If only someone would play me a groovy tune. But who has music these days. Nobody. *sigh*'),
  ],
  mopeyCheered: [
    L('Mopey', 'THE VIBES! THE VIBES ARE BACK!! I can feel my whole goo AND I LOVE IT!'),
    L('Mopey', "Take this! It's my emergency heart container. I was saving it for a sad day, but the sad days are OVER!"),
  ],
  mopeyAfter: [
    L('Mopey', "Still vibing. Can't stop. Won't stop. Thank you, music friend."),
  ],

  // ---------- The Philosopher (teaches Song of Slime) ----------
  philosopherFirst: [
    L('The Philosopher', 'Ah, young Glink. Tell me: if a slime moves through a field, does the field not also... move through the slime?'),
    L('The Philosopher', 'No. It does not. That was a test. You failed by listening.'),
    L('The Philosopher', 'I shall teach you the most powerful song I know: the Song of Slime. It does nothing. THAT is its power.'),
  ],
  philosopherAfter: [
    L('The Philosopher', 'Have you played the Song of Slime yet? Did nothing happen? Excellent. The system works.'),
  ],

  // ---------- Brad (hype slime) ----------
  brad: [
    L('Brad', 'DUDE. Have you heard?? They\'re remaking OCARINA OF TIME. The actual one. The real game.'),
    L('Brad', "I know what you're thinking: 'Brad, aren't WE in a budget parody of exactly that?' And the answer is yes! Isn't it AWESOME?"),
    L('Brad', 'Anyway if anyone named Rae is watching: this is the pre-game warmup. Stretch those thumbs.'),
  ],
  brad2: [
    L('Brad', "I've been practicing my hype for the real remake by being hyped about literally everything. WOOO! GRASS!"),
  ],

  // ---------- Old Lady Mildew (elder lore) ----------
  mildew: [
    L('Old Lady Mildew', 'In my day, the Gunk Tree was so healthy his bark had abs. ABS, Glink.'),
    L('Old Lady Mildew', "Now he's all wheezy and his roots smell like expired yogurt. Someone's gotta fix him before the whole village goes bad."),
    L('Old Lady Mildew', "The sickness came from INSIDE the tree. That's also how he eats, so honestly it was only a matter of time."),
  ],

  // ---------- Mailbox / Raelda's letter ----------
  mailNoOcarina: [
    L('Mailbox', "There's a fancy letter inside, sealed with a royal slime crest. It seems to contain... sheet music?"),
    L('Mailbox', 'You hum it experimentally. Nothing happens. You are not the instrument, Glink. (Slurpia has been waving an ocarina at you this whole time.)'),
  ],
  letter: [
    L("Raelda's Letter", 'To the hero Glink (the prophecy said "damp one" but that felt rude),'),
    L("Raelda's Letter", 'I am Princess Raelda. The Gunk Tree\'s sickness is dark magic — a sealed gunk door lies within him, and only my family\'s lullaby opens it.'),
    L("Raelda's Letter", 'I would come help personally, but I am extremely busy being mysterious for the sequel. You understand.'),
    L("Raelda's Letter", 'P.S. The fairy is a lot. We know. We sent her anyway. — R. 👑'),
  ],

  // ---------- Gossip stones ----------
  gossip: {
    village1: [
      L('Gossip Stone', "They say this entire remake was made in a cave, with a box of scraps, by one slime with a keyboard."),
    ],
    village2: [
      L('Gossip Stone', "They say if you say 'Slimetendo' three times in a mirror, a lawyer appears. A LEGALLY DISTINCT lawyer."),
      L('Gossip Stone', 'They also say: ▲ Ⓐ ▲ Ⓐ ▼ ▼ on an ocarina does something... to heads. The stone giggles.'),
    ],
    plains1: [
      L('Gossip Stone', 'They say the horse is just three slimes in a horse costume. The horse denies this. All three of her.'),
      L('Gossip Stone', 'P.S. from the moon: ▲ ◄ ► ▼ Ⓐ Ⓐ. Gravity is more of a guideline anyway.'),
    ],
    plains2: [
      L('Gossip Stone', "They say the fish in that pond aren't fish. They never elaborate. Nobody asks."),
    ],
    dungeon1: [
      L('Gossip Stone', "They say the dungeon's interior decorator quit halfway through. The webs are load-bearing now."),
      L('Gossip Stone', 'Also overheard: ◄ ◄ Ⓐ ◄ ◄ Ⓐ. Whoever plays it ruins the economy. Worth it.'),
    ],
    dungeon2: [
      L('Gossip Stone', 'They say Queen Goohma has a giant glowing weak point. They say hitting it causes massive damage. Revolutionary stuff.'),
    ],
  } as Record<string, DialogueLine[]>,

  gossipAllFound:
    '🏆 ACHIEVEMENT: Heard all 6 gossip stones! Your reward is gossip. You already received it.',

  // ---------- Chests ----------
  swordChest: {
    title: 'You got the DEKU STICK OF JUSTICE!',
    subtitle: "It's literally a stick. Justice not included. Swing with SPACE / Ⓐ!",
  },
  shieldGet: {
    title: 'You got the MOSTLY DEKU SHIELD!',
    subtitle: 'It rides on your back, doing... something. Probably.',
  },
  ocarinaGet: {
    title: 'You got the POTATO OCARINA!',
    subtitle: 'Genuine slime craftsmanship. Press Z / 🎵 to play. Do not bake.',
  },
  bonusChest: {
    title: 'You got a SINGLE GLOOPEE!',
    subtitle: 'The chest ceremony cost more than the contents. Classic.',
  },

  // ---------- Old Mackerel (fisherman, teaches Song of Squelch) ----------
  mackerelFirst: [
    L('Old Mackerel', "Ah, a fellow angler. I can tell by your... hm. I can tell by nothing. You've never fished."),
    L('Old Mackerel', "This pond holds LEGENDS, kid. The Gunkfish. The Boot. Something called a 'Fish-Shaped Object' that the lab refuses to discuss."),
    L('Old Mackerel', "Here's a pro secret: fish bite instantly when it rains slime. Let me teach you the weather. Yes, TEACH you the WEATHER."),
  ],
  mackerelAfter: [
    L('Old Mackerel', 'Cast at the pond edge over there. Big one gets you something special. I can feel it in my goo.'),
    L('Old Mackerel', "Remember: Song of Squelch = instant bites. I am legally required to say I don't control the fish."),
  ],
  mackerelNoOcarina: [
    L('Old Mackerel', "I'd teach you my secret fishing song, but you've got no instrument. Come back when you're musical."),
  ],

  // ---------- Horse-shaped sign (teaches Sloshpona's Song) ----------
  horseSignNoOcarina: [
    L('Horse-Shaped Sign', 'This sign is shaped like a horse. There is sheet music carved into it. You cannot play sheet music with your hands, Glink.'),
  ],
  horseSign: [
    L('Horse-Shaped Sign', 'This sign is shaped like a horse. Carved into it: "SLOSHPONA — she comes when called. Probably. No refunds. — the management"'),
    L('Horse-Shaped Sign', "Below that, scratched in with what appears to be a hoof: sheet music titled 'Sloshpona's Song'."),
  ],
  horseSignAfter: [
    L('Horse-Shaped Sign', 'The sign has nothing more to teach you. It is, after all, a sign.'),
  ],

  // ---------- Sketchy Slime (cheat hint vendor) ----------
  sketchyIntro: [
    L('Sketchy Slime', 'psst. hey. HEY, kid. over here. you look like someone who wants... forbidden knowledge.'),
    L('Sketchy Slime', "i sell GameShark-But-Legally-Distinct hints. secret songs. REAL cheats. the devs don't want you to know. (the dev wrote me. it's complicated.)"),
    L('Sketchy Slime', 'twenty gloopees per secret. no refunds. no receipts. no eye contact.'),
  ],
  sketchyBroke: [
    L('Sketchy Slime', "that's not twenty gloopees. i counted. counting is the one thing i'm legit about."),
  ],
  sketchySoldOut: [
    L('Sketchy Slime', "...you've bought everything. my whole catalog. you know all my secrets and i feel so exposed."),
    L('Sketchy Slime', 'check the CHEAT-O-PEDIA in your pause menu. now please. let me lurk in peace.'),
  ],
  sketchyReveal: (name: string, notes: string) => [
    L('Sketchy Slime', `*looks both ways* okay. listen close. "${name}". the notes are:`),
    L('Sketchy Slime', `${notes}`),
    L('Sketchy Slime', "it's in your CHEAT-O-PEDIA now (pause menu). you didn't hear it from me. you heard it from me."),
  ],

  // ---------- Dungeon ----------
  dungeonEntry: [
    L('Gravy', "HEY! LISTEN! We're INSIDE the Gunk Tree now. It smells like a gym sock's origin story."),
    L('Gravy', 'The sickness is deeper in. Past the angry ones. And the door. And the webs. ...This tree has a LAYOUT, okay?'),
  ],
  combatCleared: '🚪 Somewhere, a vine gate un-vines itself.',
  gunkDoorHint: [
    L('Sealed Gunk Door', 'A massive door of hardened gunk. It is... asleep? It snores in chords.'),
    L('Sealed Gunk Door', "There's royal sheet music scrawled beside it: 'Only the family lullaby soothes it open. — R.'"),
  ],
  gunkDoorOpen: '🎵 The door yawns, stretches, and politely un-exists.',
  webDrop: '🕸 The web was load-bearing. WAS.',
  chute: [
    L('Gunk Chute', "A fleshy chute labeled 'EXIT (emergencies & cowardice)'. Ride it back to the entrance?"),
  ],
  bossDoor: [
    L('Ominous Door', "Behind this door: the source of the sickness. Something enormous. Something with ONE big eye. Something... moist."),
    L('Gravy', "HEY! LISTEN! Boss fight! Whack the eye when it's open! That's the whole strategy! I believe in you, like, 60%!"),
  ],

  // ---------- Boss ----------
  bossIntro: [
    L('???', 'BLURBLE BLURBLE BLORP.'),
    L('Queen Goohma', 'TRANSLATION: WHO DARES ENTER MY GUNK? I, QUEEN GOOHMA, PARASITE MONARCH, EYEBALL SUPREME—'),
    L('Gravy', "HEY! LISTEN! She's monologuing! Get ready!"),
    L('Queen Goohma', '—RUDE. I WAS NOT DONE. ANYWAY: PERISH.'),
  ],
  bossStun: '👁 THE EYE IS OPEN! WHACK IT!!',
  bossPhase2: 'Queen Goohma is 33% less moist. She is FURIOUS about it.',
  bossPhase3: 'Queen Goohma is dangerously dry. One more eye-whack ought to do it!',
  bossDefeat: [
    L('Queen Goohma', 'BLORP... blorp... how... defeated... by a DAMP CHILD...'),
    L('Queen Goohma', 'tell my 4,000 babies... they were... mid.'),
    L('Gravy', 'HEY! LISTEN! YOU DID IT!! The Gunk Tree is saved! Probably! Trees are slow!'),
  ],

  // ---------- System / misc ----------
  signVillage: [
    L('Sign', '⬆ NORTH: Sloshy Plains, Great Gunk Tree, adventure, danger\n⬇ SOUTH: your bed (tempting)'),
  ],
  heyListen: '🧚 HEY! LISTEN!',
}
