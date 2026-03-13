import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    mapImage: {
      type: String,
    },
    maps: [
      {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    type: {
      type: String,
      enum: [
        "world",
        "region",
        "city",
        "village",
        "settlement",
        "dungeon",
        "cave",
        "building",
        "temple",
        "landmark",
      ],
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    parentLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    nodes: [
      {
        id: String,
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["encounter", "npc", "treasure", "objective", "secret", "info"],
          default: "info",
        },
        defaultDescription: {
          type: String,
        },
        readAloud: {
          type: String,
        },
        dmNote: {
          type: String,
        },
        linkedLocationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Location",
          default: null,
        },
        mapId: {
          type: String,
          default: null,
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

export default mongoose.model("LocationMap", locationSchema, "locations");
