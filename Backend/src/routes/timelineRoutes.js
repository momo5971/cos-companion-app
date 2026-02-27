import express from "express";

import { getAllTimelineEvents } from "../controllers/timelineController.js";

const router = express.Router();

router.get("/", getAllTimelineEvents);

export default router;
