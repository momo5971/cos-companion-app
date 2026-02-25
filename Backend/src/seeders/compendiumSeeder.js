import CompendiumEntry from "../models/Compendium.js";
import NPC from "../models/Npc.js";
import Item from "../models/Item.js";
import StatBlock from "../models/StatBlock.js";

export const seedCompendium = async () => {
  try {
    await CompendiumEntry.deleteMany({});
    await StatBlock.deleteMany({});

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

    await NPC.create({
      title: "Count Strahd von Zarovich",
      description: "The vampire lord of Barovia, ancient and powerful",
      tags: ["vampire", "villain", "boss"],
      details: "Strahd is cursed to forever pursue Tatyana's reincarnation",
      motivation: "Possess Ireena/Tatyana",
      personality: "Charming yet cruel, sophisticated yet monstrous",
      statBlock: strahdStats._id,
    });

    // Create Items
    await Item.create({
      title: "Sunsword",
      description: "A legendary blade of pure sunlight",
      tags: ["weapon", "artifact", "legendary"],
      details:
        "The Sunsword deals radiant damage and is one of three artifacts needed to defeat Strahd",
      rarity: "Legendary",
      attunement: true,
      properties: ["Finesse", "Versatile", "Sentient"],
    });

    console.log("Compendium seeded successfully");
  } catch (error) {
    console.error("Error seeding compendium:", error);
    throw error;
  }
};
