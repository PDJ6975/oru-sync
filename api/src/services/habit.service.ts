import { startOfDay } from "date-fns";
import { bootEnv } from "../config/bootConfig.js";
import { HabitType } from "../generated/prisma/client.js";
import * as habitRepository from "../repositories/habit.repository.js";
import type {
  HabitCreationInput,
  HabitFilterSchedule,
  HabitFilterStatus,
  HabitUpdateInput,
} from "../types/habit.types.js";
import { getComplianceForDay } from "../utils/today.compliances.js";
import { toWeekDay } from "../utils/weekday.js";
import * as origamiService from "./origami.service.js";

export const getUserHabits = async (
  userId: number,
  status: HabitFilterStatus,
  filter: HabitFilterSchedule,
) => {
  const today = toWeekDay(startOfDay(new Date()));
  return await habitRepository.getUserHabits(userId, status, filter, today);
};

export const loadHabitsForTimer = async (userId: number) => {
  const today = toWeekDay(startOfDay(new Date()));
  return habitRepository.getHabitsForTimer(userId, today);
};

export const getHabitById = async (habitId: number) => {
  return await habitRepository.getHabitById(habitId);
};

export const countHabitsByUnitId = async (unitId: number) => {
  return await habitRepository.countHabitsByUnitId(unitId);
};

export const createHabit = async (
  userId: number,
  habitInput: HabitCreationInput,
) => {
  const { scheduledDays, ...habitData } = habitInput;

  const newHabit = await habitRepository.createHabit(
    userId,
    habitData,
    scheduledDays,
  );
  await origamiService.evaluateProgress(userId);
  return newHabit;
};

export const updateHabit = async (
  userId: number,
  habitId: number,
  habitInput: HabitUpdateInput,
) => {
  const { scheduledDays, ...habitData } = habitInput;

  const updatedHabit = await habitRepository.updateHabit(
    habitId,
    habitData,
    scheduledDays,
  );
  await origamiService.evaluateProgress(userId);
  return updatedHabit;
};

export const deleteHabit = async (userId: number, habitId: number) => {
  const deletedHabit = await habitRepository.deleteHabit(habitId);
  await origamiService.evaluateProgress(userId);
  return deletedHabit;
};

export const consolidateHabit = async (habitId: number) => {
  return await habitRepository.consolidateHabit(habitId);
};

export const archiveHabit = async (userId: number, habitId: number) => {
  const archivedHabit = await habitRepository.archiveHabit(habitId);
  await origamiService.evaluateProgress(userId);
  return archivedHabit;
};

export const getEarliestHabitDate = async (userId: number) => {
  const earliestDate = await habitRepository.getEarliestHabitDate(userId);
  return earliestDate ? startOfDay(earliestDate.createdAt) : null;
};

export const getUserHabitsWithCompliancesInRange = async (
  userId: number,
  from: Date,
  to: Date,
) => {
  return await habitRepository.getUserHabitsWithCompliances(userId, from, to);
};

export const getHabitsWithCompletedCompliances = async (habitId: number) => {
  return await habitRepository.getHabitsWithCompletedCompliances(habitId);
};

export const toggleHabit = async (
  userId: number,
  habitId: number,
  amount: number,
) => {
  const today = startOfDay(new Date());
  const habit =
    await habitRepository.getHabitsWithCompletedCompliances(habitId);

  const todayCompliance = getComplianceForDay(habit!.compliances, today);

  if (habit!.type === HabitType.BOOLEAN) {
    if (!todayCompliance) {
      await habitRepository.createCompliance(habitId, today, true);
    } else {
      await habitRepository.deleteCompliance(habitId, today);
    }
  } else if (habit!.type === HabitType.QUANTITY) {
    if (amount > 0) {
      const isCompleted = amount >= habit!.dailyGoal!;
      await habitRepository.upsertCompliance(
        habitId,
        today,
        isCompleted,
        amount,
      );
    } else {
      // Sin cantidad se elimina el compliance del día
      await habitRepository.deleteCompliance(habitId, today); // si no existe no hace nada
    }
  }

  // Reevaluar la consolidación según el total de cumplimientos
  const updatedHabit =
    await habitRepository.getHabitsWithCompletedCompliances(habitId);
  const completedCount = updatedHabit!.compliances.length;
  const threshold = bootEnv.CONSOLIDATION_THRESHOLD_DAYS;
  let reevaluatedHabit;

  if (!habit!.isConsolidated && completedCount >= threshold) {
    reevaluatedHabit = await habitRepository.consolidateHabit(habitId);
    // si se consolida por 66a vez y se deshace la consolidación
  } else if (habit!.isConsolidated && completedCount < threshold) {
    reevaluatedHabit = await habitRepository.deconsolidateHabit(habitId);
  }

  // Evaluar el estado del progreso
  await origamiService.evaluateProgress(userId);

  return reevaluatedHabit
    ? getHabitById(reevaluatedHabit.id)
    : getHabitById(updatedHabit!.id);
};

export const recordSessionTime = async (
  habitId: number,
  sessionTime: number,
) => {
  const today = startOfDay(new Date());
  const habit =
    await habitRepository.getHabitsWithCompletedCompliancesAndUnit(habitId);

  const todayCompliance = getComplianceForDay(habit!.compliances, today);

  if (habit!.unit?.name === "h") sessionTime = sessionTime / 60; // Convertir minutos a horas si la unidad es horas
  const newAmount = todayCompliance
    ? todayCompliance.recordedAmount! + sessionTime
    : sessionTime;

  const isCompleted = newAmount >= habit!.dailyGoal!;

  await habitRepository.upsertCompliance(
    habitId,
    today,
    isCompleted,
    newAmount,
  );
};
