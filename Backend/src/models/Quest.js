import mongoose from "mongoose";

const questSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "in-progress", "completed", "locked"],
      default: "locked",
    },
    act: {
      type: String,
      enum: ["Act I", "Act II", "Act III", "Act IV", "Act V"],
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    rewards: [
      {
        type: String,
      },
    ],
    levelRequirement: {
      type: Number,
    },
    connections: [
      {
        entryId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        entryType: {
          type: String,
          enum: ["Location", "NPC", "Item", "Monster", "Lore"],
          required: true,
        },
      },
    ],
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Quest", questSchema);
