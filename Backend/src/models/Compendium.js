import mongoose from "mongoose";

const compendiumEntrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
    },
    details: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "category",
    strictPopulate: false,
  },
);

export default mongoose.model("CompendiumEntry", compendiumEntrySchema);
