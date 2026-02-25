import mongoose from "mongoose";

export const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    currentQuest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quest",
    },
    completedQuests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quest",
      },
    ],
    activeLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    notes: {
      type: String,
    },
    sessionNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Campaign", campaignSchema);
