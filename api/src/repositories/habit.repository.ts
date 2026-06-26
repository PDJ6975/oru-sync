import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "../db/prisma.js";
import type {
  Compliance,
  Habit,
  ScheduledDay,
} from "../generated/prisma/client.js";
import {
  HabitStatus,
  HabitType,
  type WeekDay,
} from "../generated/prisma/enums.js";
import type {
  HabitFilterSchedule,
  HabitFilterStatus,
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
      compliances: true,
      unit: {
        select: { name: true, id: true },
      },
    },
  });
};

export const getHabitsForTimer = async (userId: number, today: WeekDay) => {
  return await prisma.habit.findMany({
    where: {
      userId,
      status: HabitStatus.ACTIVE,
      type: HabitType.QUANTITY,
      unit: {
        name: { in: ["h", "min"] },
      },
      scheduledDays: {
        some: {
          day: today,
        },
      },
    },
  });
};

export const getRawHabitById = async (habitId: string) => {
  return await prisma.habit.findUnique({
    where: { id: habitId },
  });
};

export const getHabitById = async (habitId: string) => {
  return await prisma.habit.findUnique({
    where: { id: habitId },
    include: {
      scheduledDays: true,
      compliances: true,
      unit: {
        select: { name: true, id: true },
      },
    },
  });
};

export const countHabitsByUnitId = async (unitId: number) => {
  return await prisma.habit.count({
    where: { unitId },
  });
};

export const consolidateHabit = async (habitId: string) => {
  return await prisma.habit.update({
    where: { id: habitId },
    data: {
      isConsolidated: true,
    },
  });
};

export const deconsolidateHabit = async (habitId: string) => {
  return await prisma.habit.update({
    where: { id: habitId },
    data: {
      isConsolidated: false,
    },
  });
};

export const getEarliestHabitDate = async (userId: number) => {
  return await prisma.habit.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
};

export const getUserHabitsWithCompliances = async (
  userId: number,
  from: Date,
  to: Date,
) => {
  return await prisma.habit.findMany({
    where: {
      userId,
    },
    include: {
      scheduledDays: true,
      unit: {
        select: { name: true },
      },
      compliances: {
        where: {
          date: {
            gte: startOfDay(from),
            lte: endOfDay(to),
          },
        },
      },
    },
  });
};

export const getHabitsWithCompletedCompliances = async (habitId: string) => {
  return await prisma.habit.findUnique({
    where: { id: habitId },
    include: {
      compliances: {
        where: {
          isCompleted: true,
        },
      },
    },
  });
};

export const getHabitWithDayComplianceAndUnit = async (
  habitId: string,
  day: Date,
) => {
  return await prisma.habit.findUnique({
    where: { id: habitId },
    include: {
      compliances: {
        where: {
          date: {
            gte: startOfDay(day),
            lte: endOfDay(day),
          },
        },
      },
      unit: true,
    },
  });
};

export const upsertCompliance = async (
  habitId: string,
  date: Date,
  isCompleted: boolean,
  recordedAmount: number,
) => {
  return await prisma.compliance.upsert({
    where: {
      habitId_date: {
        habitId,
        date,
      },
    },
    update: {
      isCompleted,
      recordedAmount,
    },
    create: {
      habitId,
      date,
      isCompleted,
      recordedAmount,
    },
  });
};

export const deleteCompliance = async (habitId: string, day?: Date) => {
  return await prisma.compliance.deleteMany({
    // deleteMany para evitar error si no hay compliance esa fecha (puede pasar con Quantity)
    where: { habitId, date: day },
  });
};

export const getAllUserHabits = async (userId: number) => {
  return await prisma.habit.findMany({
    where: { userId },
    include: {
      scheduledDays: true,
      compliances: true,
    },
  });
};

export const upsertSyncHabit = async (habit: Habit) => {
  return await prisma.habit.upsert({
    where: { id: habit.id },
    create: habit,
    update: habit,
  });
};

export const upsertSyncScheduledDay = async (scheduledDay: ScheduledDay) => {
  await prisma.scheduledDay.upsert({
    where: {
      habitId_day: { habitId: scheduledDay.habitId, day: scheduledDay.day },
    },
    create: scheduledDay,
    update: scheduledDay,
  });
};

export const upsertSyncCompliance = async (compliance: Compliance) => {
  await prisma.compliance.upsert({
    where: {
      habitId_date: { habitId: compliance.habitId, date: compliance.date },
    },
    create: compliance,
    update: compliance,
  });
};

export const deleteSyncHabits = async (habits: Habit[]) => {
  await prisma.habit.deleteMany({
    where: { id: { in: habits.map((habit) => habit.id) } },
  });
};

export const deleteSyncScheduledDays = async (
  scheduledDays: ScheduledDay[],
) => {
  await prisma.scheduledDay.deleteMany({
    where: { id: { in: scheduledDays.map((scheduledDay) => scheduledDay.id) } },
  });
};

export const deleteSyncCompliances = async (compliances: Compliance[]) => {
  await prisma.compliance.deleteMany({
    where: { id: { in: compliances.map((compliance) => compliance.id) } },
  });
};
