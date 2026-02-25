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
    type: {
      type: String,
      enum: ["city", "dungeon", "wilderness", "landmark"],
      required: true,
    },
    nodes: [
      {
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
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Location", locationSchema);
