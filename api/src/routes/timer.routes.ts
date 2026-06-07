import { Router } from "express";
import * as timerController from "../controllers/timer.controller.js";
import {
  validateCancelTimerSession,
  validateCreateTimerSession,
  validateFinishTimerSession,
} from "../middleware/timer.validation.js";
import { verifyUser } from "../middleware/user.validation.js";

export const timerRoutes = Router();

timerRoutes.post(
  "/timer/finish",
  verifyUser,
  validateFinishTimerSession,
  timerController.finishTimerSession,
);

timerRoutes.post(
  "/timer{/:habitId}",
  verifyUser,
  validateCreateTimerSession,
  timerController.createTimerSession,
);

timerRoutes.get("/timer", verifyUser, timerController.getOrRecoverTimerSession);

timerRoutes.delete(
  "/timer",
  verifyUser,
  validateCancelTimerSession,
  timerController.cancelTimerSession,
);
