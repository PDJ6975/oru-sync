import { startOfDay } from "date-fns";
import { bootEnv } from "../config/bootConfig.js";
import type { Habit } from "../generated/prisma/client.js";
import * as habitRepository from "../repositories/habit.repository.js";
import type {
  HabitFilterSchedule,
  HabitFilterStatus,
  SyncDataInput,
} from "../types/habit.types.js";
import { getComplianceForDay } from "../utils/today.compliances.js";
import { toWeekDay } from "../utils/weekday.js";

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

export const getHabitById = async (habitId: string) => {
  return await habitRepository.getHabitById(habitId);
};

export const countHabitsByUnitId = async (unitId: number) => {
  return await habitRepository.countHabitsByUnitId(unitId);
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

export const getHabitsWithCompletedCompliances = async (habitId: string) => {
  return await habitRepository.getHabitsWithCompletedCompliances(habitId);
};

/**
 * Reevalúa la consolidación del hábito según su total de cumplimientos
 */
export const evaluateConsolidation = async (habits: Habit[]) => {
  const habitsEvaluated: Habit[] = [];
  for (const habit of habits) {
    let habitEvaluated = (await habitRepository.getRawHabitById(habit.id))!;
    const habitWithCompliances =
      await habitRepository.getHabitsWithCompletedCompliances(habit.id);
    const completedCount = habitWithCompliances!.compliances.length;
    const threshold = bootEnv.CONSOLIDATION_THRESHOLD_DAYS;

    if (!habitWithCompliances!.isConsolidated && completedCount >= threshold) {
      habitEvaluated = await habitRepository.consolidateHabit(habit.id);
      // si baja del umbral (p. ej. se desmarca un día) se deshace la consolidación
    } else if (
      habitWithCompliances!.isConsolidated &&
      completedCount < threshold
    ) {
      habitEvaluated = await habitRepository.deconsolidateHabit(habit.id);
    }
    habitsEvaluated.push(habitEvaluated);
  }
  return habitsEvaluated.map((habit) => ({
    id: habit.id,
    isConsolidated: habit.isConsolidated,
  }));
};

export const recordSessionTime = async (
  habitId: string,
  sessionTime: number,
) => {
  const today = startOfDay(new Date());
  const habit = await habitRepository.getHabitWithDayComplianceAndUnit(
    habitId,
    today,
  );

  const todayCompliance = getComplianceForDay(habit!.compliances, today);

  if (habit!.unit?.name === "h") sessionTime = sessionTime / 60; // Convertir minutos a horas si la unidad es horas
  const newAmount = todayCompliance
    ? todayCompliance.recordedAmount! + sessionTime
    : sessionTime;

  const isCompleted = newAmount >= habit!.dailyGoal!;

  const compliance = await habitRepository.upsertCompliance(
    habitId,
    today,
    isCompleted,
    newAmount,
  );

  return compliance;
};

export const syncData = async (dataToSync: SyncDataInput) => {
  const { habits, scheduledDays, compliances } = dataToSync;
  const syncedHabits: Habit[] = [];

  // 1. Crear o actualizar registros
  await Promise.all(
    habits
      .filter((habit) => !habit.deletedAt)
      .map(async (habit) => {
        const syncedHabit = await habitRepository.upsertSyncHabit(habit);
        syncedHabits.push(syncedHabit);
      }),
  );

  await Promise.all(
    scheduledDays
      .filter((scheduledDay) => !scheduledDay.deletedAt)
      .map(
        async (scheduledDay) =>
          await habitRepository.upsertSyncScheduledDay(scheduledDay),
      ),
  );

  await Promise.all(
    compliances
      .filter((compliance) => !compliance.deletedAt)
      .map(
        async (compliance) =>
          await habitRepository.upsertSyncCompliance(compliance),
      ),
  );
  // 2. Borrar registros (deleteMany evita error de cascade)

  await habitRepository.deleteSyncHabits(
    habits.filter((habit) => habit.deletedAt),
  );

  await habitRepository.deleteSyncScheduledDays(
    scheduledDays.filter((scheduledDay) => scheduledDay.deletedAt),
  );
  await habitRepository.deleteSyncCompliances(
    compliances.filter((compliance) => compliance.deletedAt),
  );

  return syncedHabits;
};
