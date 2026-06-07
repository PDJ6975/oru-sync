import { Router } from "express";
import * as unitController from "../controllers/unit.controller.js";
import {
  validateCreateUnit,
  validateDeleteUnit,
  validateEditUnit,
} from "../middleware/unit.validator.js";
import { verifyUser } from "../middleware/user.validation.js";

export const unitRoutes = Router();

unitRoutes.get("/units/me", verifyUser, unitController.getUserUnits);
unitRoutes.get("/units/base", verifyUser, unitController.getBaseUnits);
unitRoutes.post(
  "/units",
  verifyUser,
  validateCreateUnit,
  unitController.createUnit,
);
unitRoutes.delete(
  "/units/:unitId",
  verifyUser,
  validateDeleteUnit,
  unitController.deleteUserUnit,
);
unitRoutes.patch(
  "/units/:unitId",
  verifyUser,
  validateEditUnit,
  unitController.editUserUnit,
);
