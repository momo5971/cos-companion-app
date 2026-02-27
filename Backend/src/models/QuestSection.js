import mongoose from "mongoose";

const questSectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
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

export default mongoose.model("QuestSection", questSectionSchema);
