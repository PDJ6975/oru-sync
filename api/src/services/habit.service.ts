import { WeekDay } from "../generated/prisma/enums.js";
import * as habitRepository from "../repositories/habit.repository.js";
import {
  HabitFilterSchedule,
  HabitFilterStatus,
  HabitCreationInput,
  HabitUpdateInput,
} from "../types/habit.types.js";

export const getUserHabits = async (
  userId: number,
  status: HabitFilterStatus,
  filter: HabitFilterSchedule,
  day: WeekDay,
) => {
  return await habitRepository.getUserHabits(userId, status, filter, day);
};

export const getHabitById = async (habitId: number) => {
  return await habitRepository.getHabitById(habitId);
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
