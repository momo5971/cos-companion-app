import mongoose from "mongoose";

export const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastPlayed: {
      type: Date,
      default: Date.now,
    },
    sessionNumber: {
      type: Number,
      default: 1,
    },
    // Quest tracking
    currentQuest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestDoc",
    },
    completedQuests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestDoc",
      },
    ],
    activeQuests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestDoc",
      },
    ],
    // Location tracking
    activeLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocationMap",
    },
    // Decision nodes completion tracking
    completedDecisionNodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DecisionNode",
      },
    ],
    // Location nodes completion tracking
    completedLocationNodes: [
      {
        locationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "LocationMap",
        },
        nodeName: String,
      },
    ],
    // Notes
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Campaign", campaignSchema);
