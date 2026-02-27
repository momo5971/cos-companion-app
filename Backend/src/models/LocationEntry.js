import mongoose from "mongoose";
import CompendiumEntry from "./Compendium.js";

const locationEntrySchema = new mongoose.Schema(
  {
    locationType: {
      type: String,
      enum: [
        "world",
        "region",
        "city",
        "village",
        "settlement",
        "dungeon",
        "cave",
        "building",
        "temple",
        "landmark",
      ],
    },
    parentLocation: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default CompendiumEntry.discriminator("Location", locationEntrySchema);
