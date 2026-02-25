import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    mapImage: {
      type: String,
    },
    type: {
      type: String,
      enum: ["city", "dungeon", "wilderness", "landmark"],
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    nodes: [
      {
        id: String,
        name: {
          type: String,
          required: true,
        },
        defaultDescription: {
          type: String,
        },
        position: {
          x: {
            type: Number,
          },
          y: {
            type: Number,
          },
        },
        questDescriptions: {
          type: Map,
          of: String,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Location", locationSchema);
