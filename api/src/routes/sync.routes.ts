import { Router } from "express";
import * as syncController from "../controllers/sync.controller.js";
import { verifyUser } from "../middleware/user.validator.js";

export const syncRoutes = Router();

syncRoutes.post("/sync", verifyUser, syncController.syncData);
