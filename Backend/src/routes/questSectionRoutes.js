import express from "express";
import {
  createQuestSection,
  getAllQuestSections,
  getQuestSectionById,
  updateQuestSection,
  deleteQuestSection,
} from "../controllers/questSectionController.js";

const router = express.Router();

router.get("/", getAllQuestSections);
router.get("/:id", getQuestSectionById);
router.post("/", createQuestSection);
router.put("/:id", updateQuestSection);
router.delete("/:id", deleteQuestSection);

export default router;
