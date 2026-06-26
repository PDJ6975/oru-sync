import type { NextFunction, Request, Response } from "express";
import * as habitService from "../services/habit.service.js";

export const getHabitsForTimer = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const habits = await habitService.loadHabitsForTimer(userId);
    res.status(200).json(habits);
  } catch (error) {
    next(error);
  }
};
