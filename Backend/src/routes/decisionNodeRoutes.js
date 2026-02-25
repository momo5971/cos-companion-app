import express from "express";
import {
  getDecisionNodesByQuest,
  getDecisionNodeById,
  createDecisionNode,
  updateDecisionNode,
  deleteDecisionNode,
  updateDecisionNodeStatus 
} from "../controllers/decisionNodeController.js";

const router = express.Router();

router.get("/quest/:questId", getDecisionNodesByQuest);
router.get("/:id", getDecisionNodeById);
router.post("/", createDecisionNode);
router.patch("/:id/status", updateDecisionNodeStatus);
router.put("/:id", updateDecisionNode);
router.delete("/:id", deleteDecisionNode);

export default router;
