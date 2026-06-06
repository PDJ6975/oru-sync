import { Router } from "express";
import { verifyUser } from "../middleware/user.validation.js";
import * as origamiController from "../controllers/origami.controller.js";

export const origamiRoutes = Router();

origamiRoutes.get("/origami", verifyUser, origamiController.getOrigami);
