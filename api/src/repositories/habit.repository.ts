import { prisma } from "../db/prisma.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { HabitInput } from "../types/habit.types.js";

export const getUserHabits = async (userId: number) => {
  return await prisma.habit.findMany({
    where: {
      userId,
    },
    include: {
      scheduledDays: true,
    },
  });
};

export const createHabit = async (
  userId: number,
  habitData: Omit<HabitInput, "scheduledDays">,
  scheduledDays: WeekDay[],
) => {
  return await prisma.habit.create({
    data: {
      ...habitData,
      userId,
      scheduledDays: {
        create: scheduledDays.map((day) => ({ day })),
      },
    },
  });
};
