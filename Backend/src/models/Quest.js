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
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestSection",
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocationMap",
    },
    status: {
      type: String,
      enum: ["available", "in-progress", "completed", "locked"],
      default: "available",
    },
    levelRequirement: {
      type: Number,
    },
    rewards: [
      {
        type: String,
      },
    ],
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestDoc",
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

export default mongoose.model("QuestDoc", questSchema, "quests");
