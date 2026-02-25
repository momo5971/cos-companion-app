import mongoose from "mongoose";
import CompendiumEntry from "./Compendium.js";

const monsterSchema = new mongoose.Schema(
  {
    statBlock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StatBlock",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default CompendiumEntry.discriminator("Monster", monsterSchema);
