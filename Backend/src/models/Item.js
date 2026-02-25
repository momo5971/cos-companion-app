import mongoose from "mongoose";
import CompendiumEntry from "./Compendium.js";

const itemSchema = new mongoose.Schema(
  {
    rarity: {
      type: String,
      enum: [
        "Common",
        "Uncommon",
        "Rare",
        "Very Rare",
        "Legendary",
        "Artifact",
      ],
    },
    attunement: Boolean,
    properties: [String],
  },
  {
    timestamps: true,
  },
);

export default CompendiumEntry.discriminator("Item", itemSchema);
