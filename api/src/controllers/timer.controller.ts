import type { NextFunction, Request, Response } from "express";
import * as timerService from "../services/timer.service.js";

export const createTimerSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const habitId = req.params.habitId ? String(req.params.habitId) : undefined;
    const { startDate, selectedMinutes } = req.body;
    const timerSession = await timerService.createTimerSession(
      userId,
      startDate,
      selectedMinutes,
      habitId,
    );
    res.status(201).json(timerSession);
  } catch (error) {
    next(error);
  }
};

export const finishTimerSession = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const { habit, compliance, assignment } =
      await timerService.finishTimerSession(userId);
    res.status(200).json({ habit, compliance, assignment });
  } catch (error) {
    next(error);
  }
};

export const getOrRecoverTimerSession = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const recoveredSession =
      await timerService.getOrRecoverTimerSession(userId);
    return res.status(200).json(recoveredSession);
  } catch (error) {
    next(error);
  }
};

export const cancelTimerSession = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    await timerService.cancelTimerSession(userId);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
