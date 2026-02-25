import mongoose from "mongoose";
import CompendiumEntry from "./Compendium.js";

const npcSchema = new mongoose.Schema(
  {
    motivation: {
      type: String,
    },
    personality: {
      type: String,
    },
    statBlock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StatBlock",
    },
  },
  {
    timestamps: true,
  },
);

export default CompendiumEntry.discriminator("NPC", npcSchema);
