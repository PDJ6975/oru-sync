import { prisma } from "../db/prisma.js";
import { WeekDay } from "../generated/prisma/enums.js";
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
  const where: any = { userId };

  if (status === "active") {
    where.status = "ACTIVE";
  }

  if (status === "archived") {
    where.status = "ARCHIVED";
  }

  if (filter === "scheduled") {
    where.scheduledDays = {
      some: {
        day,
      },
    };
  }

  if (filter === "rest") {
    where.scheduledDays = {
      none: {
        day,
      },
    };
  }

  return await prisma.habit.findMany({
    where,
    include: {
      scheduledDays: true,
    },
  });
};

export const getHabitById = async (habitId: number) => {
  return await prisma.habit.findUnique({
    where: { id: habitId },
    include: {
      scheduledDays: true,
    },
  });
};

export const createHabit = async (
  userId: number,
  habitData: Omit<HabitCreationInput, "scheduledDays">,
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

export const updateHabit = async (
  habitId: number,
  habitData: HabitUpdateInput,
  scheduledDays?: WeekDay[],
) => {
  return await prisma.habit.update({
    where: { id: habitId },
    data: {
      ...habitData,
      scheduledDays: scheduledDays
        ? {
            deleteMany: {}, // delete existing scheduled days
            create: scheduledDays.map((day) => ({ day })), // add new scheduled days
          }
        : {},
    },
  });
};

export const deleteHabit = async (habitId: number) => {
  return await prisma.habit.delete({
    where: { id: habitId },
  });
};

export const consolidateHabit = async (habitId: number) => {
  return await prisma.habit.update({
    where: { id: habitId },
    data: {
      isConsolidated: true,
    },
  });
};

export const archiveHabit = async (habitId: number) => {
  return await prisma.habit.update({
    where: { id: habitId },
    data: {
      status: "ARCHIVED",
    },
  });
};
