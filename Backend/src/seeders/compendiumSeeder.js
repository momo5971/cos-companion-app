import CompendiumEntry from "../models/Compendium.js";
import NPC from "../models/Npc.js";
import Item from "../models/Item.js";
import Monster from "../models/Monster.js";
import StatBlock from "../models/StatBlock.js";

export const seedCompendium = async (campaignId) => {
  try {
    await CompendiumEntry.deleteMany({});
    await StatBlock.deleteMany({});

    // Create Stat Blocks
    const strahdStats = await StatBlock.create({
      type: "Undead (Vampire)",
      initiativeBonus: 4,
      ac: 16,
      hp: 144,
      speed: "30 ft.",
      stats: { str: 18, dex: 18, con: 18, int: 20, wis: 15, cha: 18 },
      savingThrows: ["Dex +9", "Wis +7", "Cha +9"],
      skills: ["Perception +12", "Stealth +14"],
      damageResistances: [
        "Necrotic",
        "Bludgeoning, Piercing, and Slashing from Nonmagical Attacks",
      ],
      senses: "Darkvision 120 ft.",
      languages: "Common, Draconic, Elvish, Giant, Infernal",
      challengeRating: "15",
      traits: [
        {
          name: "Legendary Resistance",
          description:
            "If Strahd fails a saving throw, he can choose to succeed instead (3/day)",
        },
      ],
      actions: [
        {
          name: "Multiattack",
          description:
            "Strahd makes two attacks, only one of which can be a bite attack",
        },
      ],
      legendaryActions: [],
    });

    const zombieStats = await StatBlock.create({
      type: "Undead",
      initiativeBonus: -2,
      ac: 8,
      hp: 22,
      speed: "20 ft.",
      stats: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 },
      savingThrows: ["Wis +0"],
      damageImmunities: ["Poison"],
      conditionImmunities: ["Poisoned"],
      senses: "Darkvision 60 ft.",
      languages: "Understands languages it knew in life but can't speak",
      challengeRating: "1/4",
      traits: [
        {
          name: "Undead Fortitude",
          description:
            "If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.",
        },
      ],
      actions: [
        {
          name: "Slam",
          description:
            "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage.",
        },
      ],
    });

    const vampireSpawnStats = await StatBlock.create({
      type: "Undead",
      initiativeBonus: 3,
      ac: 15,
      hp: 82,
      speed: "30 ft.",
      stats: { str: 16, dex: 16, con: 16, int: 11, wis: 10, cha: 12 },
      savingThrows: ["Dex +6", "Wis +3"],
      skills: ["Perception +3", "Stealth +6"],
      damageResistances: [
        "Necrotic",
        "Bludgeoning, Piercing, and Slashing from Nonmagical Attacks",
      ],
      senses: "Darkvision 60 ft.",
      languages: "Common",
      challengeRating: "5",
      traits: [
        {
          name: "Regeneration",
          description:
            "The vampire regains 10 hit points at the start of its turn if it has at least 1 hit point and isn't in sunlight or running water.",
        },
      ],
      actions: [
        {
          name: "Claws",
          description:
            "Melee Weapon Attack: +6 to hit, reach 5 ft., one creature. Hit: 8 (2d4 + 3) slashing damage.",
        },
        {
          name: "Bite",
          description:
            "Melee Weapon Attack: +6 to hit, reach 5 ft., one willing creature, or a creature that is grappled by the vampire, incapacitated, or restrained. Hit: 6 (1d6 + 3) piercing damage plus 7 (2d6) necrotic damage.",
        },
      ],
    });

    // NPCs
    await NPC.create({
      campaignId,
      title: "Count Strahd von Zarovich",
      description: "The vampire lord of Barovia, ancient and powerful",
      tags: ["vampire", "villain", "boss"],
      location: "Castle Ravenloft",
      details:
        "Strahd is cursed to forever pursue Tatyana's reincarnation. He rules Barovia with an iron fist from his castle.",
      motivation: "Possess Ireena/Tatyana",
      personality: "Charming yet cruel, sophisticated yet monstrous",
      statBlock: strahdStats._id,
      imageUrl: "/images/Strahd-at-Dinner.png",
    });

    await NPC.create({
      campaignId,
      title: "Ireena Kolyana",
      description:
        "The adopted daughter of the late Burgomaster, bearing an uncanny resemblance to Tatyana",
      tags: ["ally", "important", "protected"],
      location: "Village of Barovia",
      details:
        "Ireena has been bitten twice by Strahd and fears for her life. She seeks protection and a way to escape his grasp.",
      motivation: "Survive and escape Strahd's attention",
      personality: "Brave, determined, but haunted by fear",
    });

    await NPC.create({
      campaignId,
      title: "Ismark Kolyanovich",
      description: "Ireena's brother, known as 'Ismark the Lesser'",
      tags: ["ally", "fighter"],
      location: "Village of Barovia",
      details:
        "Ismark is desperate to protect his sister and will do anything to help the party keep her safe.",
      motivation: "Protect Ireena at all costs",
      personality: "Loyal, protective, feels inadequate",
    });

    await NPC.create({
      campaignId,
      title: "Father Donavich",
      description: "The priest of the Village of Barovia church",
      tags: ["tragic", "priest"],
      location: "Village of Barovia",
      details:
        "Father Donavich's son Doru was turned into a vampire spawn and is trapped in the church basement. The priest prays constantly for salvation.",
      motivation: "Save his son's soul",
      personality: "Desperate, faithful, broken",
    });

    await NPC.create({
      campaignId,
      title: "Madam Eva",
      description: "The ancient Vistani seer who reads the Tarokka",
      tags: ["vistani", "fortune teller", "important"],
      location: "Tser Pool Encampment",
      details:
        "Madam Eva is far older than she appears and knows much about Strahd and the land of Barovia. She performs the Tarokka reading.",
      motivation: "Guide the heroes to their destiny",
      personality: "Mysterious, wise, cryptic",
    });

    await NPC.create({
      campaignId,
      title: "Rudolph van Richten",
      description: "A legendary vampire hunter in disguise",
      tags: ["ally", "hunter", "disguised"],
      location: "Various",
      details:
        "Van Richten has come to Barovia to destroy Strahd. He travels in disguise to avoid detection.",
      motivation: "Destroy Strahd von Zarovich",
      personality: "Cautious, experienced, haunted by past failures",
    });

    await NPC.create({
      campaignId,
      title: "Ezmerelda d'Avenir",
      description: "A young vampire hunter and protégé of Van Richten",
      tags: ["ally", "hunter", "vistani"],
      location: "Various",
      details:
        "Ezmerelda is searching for her mentor Van Richten. She is skilled, brave, and has a prosthetic leg.",
      motivation: "Find Van Richten and help destroy Strahd",
      personality: "Bold, resourceful, independent",
    });

    // Monsters
    await Monster.create({
      campaignId,
      title: "Zombie",
      description: "Shambling undead corpses that hunger for flesh",
      tags: ["undead", "common", "slow"],
      location: "Death House, Various",
      details:
        "Zombies are common throughout Barovia, rising from graves and battlefields.",
      statBlock: zombieStats._id,
    });

    await Monster.create({
      campaignId,
      title: "Vampire Spawn",
      description: "Lesser vampires created by Strahd or other vampires",
      tags: ["undead", "vampire", "dangerous"],
      location: "Castle Ravenloft, Various",
      details:
        "Vampire spawn serve their vampire masters and can be found throughout Barovia.",
      statBlock: vampireSpawnStats._id,
    });

    // Items
    await Item.create({
      campaignId,
      title: "Sunsword",
      description: "A legendary blade of pure sunlight",
      tags: ["weapon", "artifact", "legendary"],
      location: "Hidden",
      details:
        "The Sunsword is a sentient longsword that sheds bright sunlight. It deals radiant damage and is one of three artifacts needed to defeat Strahd.",
      rarity: "Legendary",
      attunement: true,
      properties: ["Finesse", "Versatile", "Sentient"],
    });

    await Item.create({
      campaignId,
      title: "Holy Symbol of Ravenkind",
      description: "A powerful holy relic that can hold vampires at bay",
      tags: ["artifact", "legendary", "holy"],
      location: "Hidden",
      details:
        "This platinum amulet bears the symbol of the Morninglord. It can be used to hold vampires at bay and has other powerful abilities.",
      rarity: "Legendary",
      attunement: true,
      properties: ["Holy", "Anti-Vampire"],
    });

    await Item.create({
      campaignId,
      title: "Tome of Strahd",
      description:
        "Strahd's personal journal detailing his descent into darkness",
      tags: ["book", "artifact", "legendary"],
      location: "Hidden",
      details:
        "This ancient tome contains Strahd's own account of his transformation into a vampire and his obsession with Tatyana.",
      rarity: "Legendary",
      attunement: false,
      properties: ["Lore", "Insight"],
    });

    await Item.create({
      campaignId,
      title: "Gulthias Staff",
      description: "A twisted staff made from the Gulthias Tree",
      tags: ["weapon", "staff", "evil"],
      location: "Various",
      details:
        "This gnarled staff is made from wood of the Gulthias Tree. It has necromantic powers.",
      rarity: "Rare",
      attunement: true,
      properties: ["Necromancy", "Vampiric"],
    });

    await Item.create({
      campaignId,
      title: "Luck Blade",
      description: "A magical sword that grants fortune to its wielder",
      tags: ["weapon", "sword", "rare"],
      location: "Hidden",
      details:
        "This sword grants its wielder good fortune and contains wishes.",
      rarity: "Very Rare",
      attunement: true,
      properties: ["Luck", "Wishes"],
    });

    await Item.create({
      campaignId,
      title: "Bag of Holding",
      description: "A magical bag with an extradimensional space inside",
      tags: ["utility", "storage", "uncommon"],
      location: "Various",
      details:
        "This bag can hold far more than its size would suggest, with an interior space much larger than its exterior.",
      rarity: "Uncommon",
      attunement: false,
      properties: ["Storage", "Extradimensional"],
    });

    await Item.create({
      campaignId,
      title: "Potion of Greater Healing",
      description: "A magical potion that restores health",
      tags: ["potion", "healing", "consumable"],
      location: "Various",
      details: "When you drink this potion, you regain 4d4 + 4 hit points.",
      rarity: "Uncommon",
      attunement: false,
      properties: ["Healing", "Consumable"],
    });

    await Item.create({
      campaignId,
      title: "Amulet of Proof Against Detection",
      description: "An amulet that shields the wearer from divination magic",
      tags: ["amulet", "protection", "uncommon"],
      location: "Various",
      details:
        "While wearing this amulet, you are hidden from divination magic. You can't be targeted by such magic or perceived through magical scrying sensors.",
      rarity: "Uncommon",
      attunement: true,
      properties: ["Protection", "Anti-Divination"],
    });

    await Item.create({
      campaignId,
      title: "Cloak of Protection",
      description: "A magical cloak that grants protection to its wearer",
      tags: ["cloak", "protection", "uncommon"],
      location: "Various",
      details:
        "You gain a +1 bonus to AC and saving throws while you wear this cloak.",
      rarity: "Uncommon",
      attunement: true,
      properties: ["Protection", "AC Bonus"],
    });

    await Item.create({
      campaignId,
      title: "Ring of Mind Shielding",
      description: "A ring that protects the wearer's mind",
      tags: ["ring", "protection", "uncommon"],
      location: "Various",
      details:
        "While wearing this ring, you are immune to magic that allows other creatures to read your thoughts, determine whether you are lying, know your alignment, or know your creature type.",
      rarity: "Uncommon",
      attunement: true,
      properties: ["Mind Protection", "Anti-Detection"],
    });

    await Item.create({
      campaignId,
      title: "Wand of Magic Missiles",
      description: "A wand that can cast magic missile",
      tags: ["wand", "offensive", "uncommon"],
      location: "Various",
      details:
        "This wand has 7 charges. While holding it, you can use an action to expend 1 or more of its charges to cast the magic missile spell.",
      rarity: "Uncommon",
      attunement: false,
      properties: ["Offensive", "Charges"],
    });

    console.log("Compendium seeded successfully with 20 entries");
  } catch (error) {
    console.error("Error seeding compendium:", error);
    throw error;
  }
};
