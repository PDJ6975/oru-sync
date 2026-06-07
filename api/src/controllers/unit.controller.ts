import type { NextFunction, Request, Response } from "express";
import * as unitService from "../services/unit.service.js";

export const createUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const { name } = req.body;
    const unit = await unitService.createUnit(userId, name);
    res.status(201).json(unit);
  } catch (error) {
    next(error);
  }
};

export const getUserUnits = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const units = await unitService.getUserUnits(userId);
    res.status(200).json(units);
  } catch (error) {
    next(error);
  }
};

export const getBaseUnits = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const units = await unitService.getBaseUnits();
    res.status(200).json(units);
  } catch (error) {
    next(error);
  }
};

export const deleteUserUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const unitId = Number(req.params.unitId);
    await unitService.deleteUserUnit(unitId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const editUserUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const unitId = Number(req.params.unitId);
    const { name } = req.body;
    await unitService.editUserUnit(unitId, name);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
