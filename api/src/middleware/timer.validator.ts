import type { NextFunction, Request, Response } from "express";
import { body, param } from "express-validator";
import createError from "http-errors";
import { HabitStatus, HabitType } from "../generated/prisma/enums.js";
import * as habitService from "../services/habit.service.js";
import * as timerService from "../services/timer.service.js";
import { toWeekDay } from "../utils/weekday.js";
import { validateRequest } from "./validateRequest.js";

const habitIdValidation = param("habitId")
  .optional()
  .isString()
  .withMessage("Habit ID must be a string")
  .trim()
  .isLength({ min: 1 })
  .withMessage("Habit ID cannot be empty")
  .isLength({ max: 36 })
  .withMessage("Habit ID must be at most 36 characters")
  .isUUID()
  .withMessage("Habit ID must be a valid UUID");

const startDateValidation = body("startDate")
  .isISO8601()
  .toDate()
  .withMessage("Start date must be a valid ISO 8601 date.")
  .custom((value) => new Date(value) <= new Date())
  .withMessage("Start date cannot be in the future.");

const selectedMinutesValidation = body("selectedMinutes")
  .isInt({ min: 1 })
  .withMessage("Selected minutes must be a positive integer.");

const validatHabitForTimer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const habitId = String(req.params.habitId);
    const today = toWeekDay(new Date());
    if (habitId) {
      // No reutilizar validateHabitOwner porque el timer lo pasa opcional.
      const habit = await habitService.getHabitById(habitId);
      if (!habit) {
        throw new createError.NotFound("Habit not found");
      }
      if (habit.userId !== userId) {
        throw new createError.Forbidden(
          "You do not have permission to create a timer session for this habit",
        );
      }
      if (habit!.type === HabitType.BOOLEAN) {
        throw new createError.BadRequest(
          "Cannot create a timer session for a boolean habit",
        );
      }
      if (habit!.status === HabitStatus.ARCHIVED) {
        throw new createError.BadRequest(
          "Cannot create a timer session for an archived habit",
        );
      }
      if (!habit!.scheduledDays.some((sd) => sd.day === today)) {
        throw new createError.BadRequest(
          "Cannot create a timer session for a habit that is not scheduled for today",
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const validateNotRunningSession = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const activeSession = await timerService.getActiveSession(userId);

    if (activeSession) {
      const endDate = timerService.getEndDate(
        activeSession!.startDate,
        activeSession!.selectedMinutes,
      );
      if (endDate > new Date()) {
        throw new createError.BadRequest(
          "Cannot create a new timer session while another session is active",
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateThereIsAnActiveSession = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const activeSession = await timerService.getActiveSession(userId);

    if (!activeSession) {
      throw new createError.BadRequest("There is no active timer session");
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const validateCreateTimerSession = [
  habitIdValidation,
  startDateValidation,
  selectedMinutesValidation,
  validateRequest,
  validatHabitForTimer,
  validateNotRunningSession,
];

export const validateFinishTimerSession = [validateThereIsAnActiveSession];

export const validateCancelTimerSession = [validateThereIsAnActiveSession];
