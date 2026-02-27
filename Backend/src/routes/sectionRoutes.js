import express from "express";
import {
  getSectionsByQuest,
  createSection,
  updateSection,
  deleteSection,
} from "../controllers/sectionController.js";

const router = express.Router();

router.get("/quest/:questId", getSectionsByQuest);
router.post("/", createSection);
router.put("/:id", updateSection);
router.delete("/:id", deleteSection);

export default router;
