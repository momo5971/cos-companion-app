import mongoose from "mongoose";

const statBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    initiativeBonus: {
      type: Number,
      required: true,
    },
    ac: {
      type: Number,
      required: true,
    },
    hp: {
      type: Number,
      required: true,
    },
    speed: {
      type: String,
      required: true,
    },
    stats: {
      str: {
        type: Number,
        required: true,
      },
      dex: {
        type: Number,
        required: true,
      },
      con: {
        type: Number,
        required: true,
      },
      int: {
        type: Number,
        required: true,
      },
      wis: {
        type: Number,
        required: true,
      },
      cha: {
        type: Number,
        required: true,
      },
    },
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
    senses: {
      type: String,
    },
    languages: {
      type: String,
    },
    challengeRating: {
      type: String,
    },
    traits: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    actions: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    legendaryActions: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    reactions: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    lairActions: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("StatBlock", statBlockSchema);
