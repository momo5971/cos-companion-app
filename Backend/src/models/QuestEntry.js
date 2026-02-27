import mongoose from "mongoose";
import CompendiumEntry from "./Compendium.js";

const questEntrySchema = new mongoose.Schema(
  {
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quest",
    },
    questStatus: {
      type: String,
      enum: ["available", "in-progress", "completed", "locked"],
      default: "available",
    },
    questObjectives: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default CompendiumEntry.discriminator("Quest", questEntrySchema);
