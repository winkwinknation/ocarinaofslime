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
    L('Mailbox', 'Sheet music is useless without an instrument. (Slurpia has been waving an ocarina at you this whole time.)'),
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
    ],
    plains1: [
      L('Gossip Stone', 'They say the horse is just three slimes in a horse costume. The horse denies this. All three of her.'),
    ],
    plains2: [
      L('Gossip Stone', "They say the fish in that pond aren't fish. They never elaborate. Nobody asks."),
    ],
    dungeon1: [
      L('Gossip Stone', "They say the dungeon's interior decorator quit halfway through. The webs are load-bearing now."),
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

  // ---------- System / misc ----------
  signVillage: [
    L('Sign', '⬆ NORTH: Sloshy Plains, Great Gunk Tree, adventure, danger\n⬇ SOUTH: your bed (tempting)'),
  ],
  heyListen: '🧚 HEY! LISTEN!',
}
