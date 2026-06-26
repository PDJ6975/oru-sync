import { NextFunction, Request, Response } from "express";
import * as habitService from "../services/habit.service.js";
import * as origamiService from "../services/origami.service.js";

export const syncData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    // 1. Obtener los datos pendientes de sincronizar y enviar para almacenamiento o borrado.
    const dataToSync = req.body;
    const syncedHabits = await habitService.syncData(dataToSync);
    // 2. Evaluar la consolidación de los hábitos.
    const habitsEvaluated =
      await habitService.evaluateConsolidation(syncedHabits);
    // 3. Evaluar el progreso de la asignación activa.
    const assignmentEvaluated = await origamiService.evaluateProgress(userId);
    // 4. Devolver respuesta
    res.status(200).json({
      habits: habitsEvaluated,
      assignment: assignmentEvaluated,
    });
  } catch (error) {
    next(error);
  }
};
