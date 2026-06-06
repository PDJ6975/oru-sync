import { startOfDay } from "date-fns";
import * as habitRepository from "../repositories/habit.repository.js";
import {
  HabitFilterSchedule,
  HabitFilterStatus,
  HabitCreationInput,
  HabitUpdateInput,
} from "../types/habit.types.js";
import { toWeekDay } from "../utils/weekday.js";

export const getUserHabits = async (
  userId: number,
  status: HabitFilterStatus,
  filter: HabitFilterSchedule,
) => {
  const today = toWeekDay(startOfDay(new Date()));
  return await habitRepository.getUserHabits(userId, status, filter, today);
};

export const getUserHabitsWithCompliances = async (userId: number) => {};

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

  return await habitRepository.createHabit(userId, habitData, scheduledDays);
};

export const updateHabit = async (
  habitId: number,
  habitInput: HabitUpdateInput,
) => {
  const { scheduledDays, ...habitData } = habitInput;

  return await habitRepository.updateHabit(habitId, habitData, scheduledDays);
};

export const deleteHabit = async (habitId: number) => {
  return await habitRepository.deleteHabit(habitId);
};

export const consolidateHabit = async (habitId: number) => {
  return await habitRepository.consolidateHabit(habitId);
};

export const archiveHabit = async (habitId: number) => {
  return await habitRepository.archiveHabit(habitId);
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
