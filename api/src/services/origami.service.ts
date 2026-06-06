import * as origamiRepository from "../repositories/origami.repository.js";
import createError from "http-errors";

export const getActiveAssignment = async (userId: number) => {
  // Obtener asignación con fecha de completado a null (origami activo)
  let activeAssignment = await origamiRepository.getActiveAssignment(userId);

  // Si no tiene -> usuario nuevo -> asignar origami
  if (!activeAssignment) {
    activeAssignment = await assignOrigami(userId);
  }

  // Obtener nombre del origami vinculado al nombre de los recursos
  const origamiName = getOrigamiName(
    activeAssignment!.origami.name,
    activeAssignment!.revealedPhase,
  );

  // Obtener siguiente umbral -> Para mostrar animación de avance al llegar
  const nextThreshold = getNextThreshold(
    activeAssignment!.origami.phases,
    activeAssignment!.revealedPhase,
  );

  // Ver si hay más origamis disponibles para mostrar botón de cambio
  // cuando el progreso es 100 y hasNextOrigamiAvailable sea true
  const unassigned = await getUnassignedOrigamis(userId);
  const hasNextOrigamiAvailable = unassigned.length > 0;

  return {
    origamiName,
    progress: activeAssignment!.progress,
    nextThreshold,
    isCompleted: nextThreshold === null && activeAssignment!.progress >= 100,
    hasNextOrigami: hasNextOrigamiAvailable,
  };
};

const getNextThreshold = (totalPhases: number, revealedPhase: number) => {
  const nextPhase = revealedPhase + 1;

  if (nextPhase >= totalPhases) {
    return null;
  }

  // redondeo para que el umbral sea entero y no de problemas con el progreso
  return Math.round(nextPhase * (100 / (totalPhases - 1))); // -1 para representar el nº de saltos entre fases
};

const getOrigamiName = (name: string, phase: number) => {
  return name + "_fase" + phase;
};

export const assignOrigami = async (userId: number) => {
  // Filtrar por no asignados para permitir nueva asignación o asignación inicial
  const unassignedOrigamis = await getUnassignedOrigamis(userId);

  // Si quedan origamis disponibles, asignamos uno aleatorio
  if (unassignedOrigamis.length === 0) {
    throw new createError.Conflict("No more origamis available to assign");
  }

  const randomIndex = Math.floor(Math.random() * unassignedOrigamis.length);
  const origamiToAssign = unassignedOrigamis[randomIndex];

  const createdAssignment = await origamiRepository.createAssignment(
    userId,
    origamiToAssign.id,
  );

  return createdAssignment;
};

const getUnassignedOrigamis = async (userId: number) => {
  return await origamiRepository.getUnassignedOrigamis(userId);
};
