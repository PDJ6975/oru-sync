import { Router } from "express";
import * as statController from "../controllers/stats.controller.js";
import { validateStats } from "../middleware/stats.validator.js";
import { verifyUser } from "../middleware/user.validator.js";

export const statsRoutes = Router();

statsRoutes.get("/stats", verifyUser, validateStats, statController.getStats);
