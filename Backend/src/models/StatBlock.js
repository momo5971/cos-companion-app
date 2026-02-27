import mongoose from "mongoose";

const statBlockSchema = new mongoose.Schema(
  {
    // Size, Type, and Alignment
    size: {
      type: String,
      enum: ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"],
      default: "Medium",
    },
    type: {
      type: String,
      required: true,
    },
    alignment: {
      type: String,
      default: "Unaligned",
    },
    // Combat Highlights
    ac: {
      type: Number,
      required: true,
    },
    acDescription: {
      type: String,
      default: "",
    },
    hp: {
      type: Number,
      required: true,
    },
    hitDice: {
      type: String,
      default: "",
    },
    speed: {
      type: String,
      required: true,
    },
    initiativeBonus: {
      type: Number,
      default: 0,
    },
    // Ability Scores
    stats: {
      str: {
        type: Number,
        required: true,
        default: 10,
      },
      dex: {
        type: Number,
        required: true,
        default: 10,
      },
      con: {
        type: Number,
        required: true,
        default: 10,
      },
      int: {
        type: Number,
        required: true,
        default: 10,
      },
      wis: {
        type: Number,
        required: true,
        default: 10,
      },
      cha: {
        type: Number,
        required: true,
        default: 10,
      },
    },
    // Saving Throws and Skills
    savingThrows: [
      {
        type: String,
      },
    ],
    skills: [
      {
        type: String,
      },
    ],
    // Damage Adjustments
    damageVulnerabilities: [
      {
        type: String,
      },
    ],
    damageResistances: [
      {
        type: String,
      },
    ],
    damageImmunities: [
      {
        type: String,
      },
    ],
    conditionImmunities: [
      {
        type: String,
      },
    ],
    // Senses and Languages
    senses: {
      type: String,
      default: "Passive Perception 10",
    },
    languages: {
      type: String,
      default: "—",
    },
    // Challenge Rating
    challengeRating: {
      type: String,
      default: "0",
    },
    proficiencyBonus: {
      type: Number,
      default: 2,
    },
    // Traits (passive abilities)
    traits: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
          default: "",
        },
      },
    ],
    // Actions
    actions: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
          default: "",
        },
      },
    ],
    // Bonus Actions
    bonusActions: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
          default: "",
        },
      },
    ],
    // Reactions
    reactions: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
          default: "",
        },
      },
    ],
    // Legendary Actions
    legendaryActions: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
          default: "",
        },
      },
    ],
    legendaryActionsPerRound: {
      type: Number,
      default: 3,
    },
    // Lair Actions
    lairActions: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("StatBlock", statBlockSchema);
