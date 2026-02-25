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
  },
  {
    timestamps: true,
    discriminatorKey: "category",
  },
);

export default mongoose.model("CompendiumEntry", compendiumEntrySchema);
