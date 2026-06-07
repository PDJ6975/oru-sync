import { Router } from "express";
import * as statController from "../controllers/stats.controller.js";
import { validateStats } from "../middleware/stats.validation.js";
import { verifyUser } from "../middleware/user.validation.js";

export const statsRoutes = Router();

statsRoutes.get("/stats", verifyUser, validateStats, statController.getStats);
