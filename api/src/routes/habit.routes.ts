import { Router } from "express";
import * as habitController from "../controllers/habit.controller.js";
import { verifyUser } from "../middleware/user.validation.js";
import {
  validateCreateHabit,
  validateUnitForHabit,
} from "../middleware/habit.validation.js";

export const habitRoutes = Router();

habitRoutes.get("/habits", verifyUser, habitController.getUserHabits);
habitRoutes.post(
  "/habits",
  verifyUser,
  validateCreateHabit,
  validateUnitForHabit,
  habitController.createHabit,
);
