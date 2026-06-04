import * as habitRepository from "../repositories/habit.repository.js";
import { HabitInput } from "../types/habit.types.js";

export const getUserHabits = async (userId: number) => {
  return await habitRepository.getUserHabits(userId);
};

export const createHabit = async (userId: number, habitInput: HabitInput) => {
  const { scheduledDays, ...habitData } = habitInput;
  return await habitRepository.createHabit(userId, habitData, scheduledDays);
};
