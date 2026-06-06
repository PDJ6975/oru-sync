import { NextFunction, Request, Response } from "express";
import * as statService from "../services/stats.service.js";

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const year = Number(req.query.year);
    const userId = res.locals.userId;

    const stats = await statService.getStats(userId, year);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
