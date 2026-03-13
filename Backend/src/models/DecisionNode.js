import mongoose from "mongoose";

const decisionNodeSchema = new mongoose.Schema(
  {
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestDoc",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
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
    previousNodes: [
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
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    readAloud: {
      type: String,
    },
    dmNote: {
      type: String,
    },
    stringId: {
      type: String,
      index: true,
    },
    section: {
      type: String,
      default: "Unsorted",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("DecisionNode", decisionNodeSchema);
