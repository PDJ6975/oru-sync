import type { NextFunction, Request, Response } from "express";
import { body, param } from "express-validator";
import createError from "http-errors";
import { bootEnv } from "../config/bootConfig.js";
import * as habitService from "../services/habit.service.js";
import * as unitService from "../services/unit.service.js";
import { validateRequest } from "./validateRequest.js";

const nameValidation = body("name")
  .isString()
  .withMessage("Name must be a string")
  .trim()
  .isLength({ min: 1 })
  .withMessage("Name cannot be empty")
  .isLength({ max: 6 })
  .withMessage("Name must be at most 6 characters")
  .toLowerCase();

const validateUserLimit = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userUnits = await unitService.getUserUnits(res.locals.userId);
    if (userUnits.length >= bootEnv.MAX_UNITS_PER_USER) {
      throw new createError.Conflict(
        "You have reached the maximum number of units allowed.",
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUniqueUnitName = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const unitId = req.params.unitId ? Number(req.params.unitId) : null;
    const { name } = req.body;
    const baseUnits = await unitService.getBaseUnits();
    const userUnits = await unitService.getUserUnits(userId);
    if (baseUnits.some((unit) => unit.name === name)) {
      throw new createError.Conflict(
        "A base unit with this name already exists.",
      );
    }

    if (userUnits.some((unit) => unit.name === name && unit.id !== unitId)) {
      throw new createError.Conflict("You already have a unit with this name.");
    }
    next();
  } catch (error) {
    next(error);
  }
};

const validateUnitOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const unitId = Number(req.params.unitId);
    const userId = res.locals.userId;

    const unit = await unitService.getUnit(unitId);

    if (!unit) {
      throw new createError.NotFound(`Unit not found with id: ${unitId}`);
    }

    if (unit.userId !== userId) {
      throw new createError.Forbidden("You are not the owner of this unit");
    }

    next();
  } catch (error) {
    next(error);
  }
};

const validateUnitUse = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const unitId = Number(req.params.unitId);
    const habits = await habitService.countHabitsByUnitId(unitId);

    if (habits > 0) {
      throw new createError.Conflict(
        "You cannot delete a unit that has associated habits. Delete or update the habits first.",
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

const validateUnitIdParam = param("unitId")
  .isInt({ gt: 0 })
  .withMessage("Unit ID must be a positive integer");

export const validateCreateUnit = [
  nameValidation,
  validateRequest,
  validateUserLimit,
  validateUniqueUnitName,
];

export const validateDeleteUnit = [
  validateUnitIdParam,
  validateRequest,
  validateUnitOwner,
  validateUnitUse,
];

export const validateEditUnit = [
  validateUnitIdParam,
  nameValidation,
  validateRequest,
  validateUnitOwner,
  validateUniqueUnitName,
];
