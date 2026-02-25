import mongoose from "mongoose";

const decisionNodeSchema = new mongoose.Schema(
  {
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quest",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    nodeType: {
      type: String,
      enum: ["decision", "outcome", "event"],
      default: "decision",
    },
    position: {
      x: {
        type: Number,
        default: 0,
      },
      y: {
        type: Number,
        default: 0,
      },
    },
    nextNodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DecisionNode",
      },
    ],
    consequences: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("DecisionNode", decisionNodeSchema);
