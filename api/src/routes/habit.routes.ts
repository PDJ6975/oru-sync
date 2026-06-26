import { Router } from "express";
import * as habitController from "../controllers/habit.controller.js";
import { verifyUser } from "../middleware/user.validator.js";

export const habitRoutes = Router();

habitRoutes.get(
  "/habits/timer/load",
  verifyUser,
  habitController.getHabitsForTimer,
);
