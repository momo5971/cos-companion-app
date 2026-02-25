import express from "express";
import {
  createQuest,
  getAllQuests,
  getQuestById,
  updateQuest,
  deleteQuest,
  updateQuestStatus,
} from "../controllers/questController.js";

const router = express.Router();

router.get("/", getAllQuests);
router.get("/:id", getQuestById);
router.post("/", createQuest);
router.put("/:id", updateQuest);
router.delete("/:id", deleteQuest);
router.patch("/:id/status", updateQuestStatus);

export default router;
