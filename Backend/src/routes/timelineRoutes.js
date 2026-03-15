import express from "express";

import {
  getAllTimelineEvents,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
} from "../controllers/timelineController.js";

const router = express.Router();

router.get("/", getAllTimelineEvents);
router.post("/", createTimelineEvent);
router.put("/:id", updateTimelineEvent);
router.delete("/:id", deleteTimelineEvent);

export default router;
