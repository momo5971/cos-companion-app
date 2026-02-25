import express from "express";
import {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  searchEntries,
  getEntriesByCategory,
} from "../controllers/compendiumController.js";

const router = express.Router();

router.get("/", getAllEntries);
router.get("/search", searchEntries);
router.get("/category/:category", getEntriesByCategory);
router.get("/:id", getEntryById);
router.post("/", createEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

export default router;
