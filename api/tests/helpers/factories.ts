import { isSameDay, startOfDay, subDays } from "date-fns";
import { prisma } from "../../src/db/prisma.js";
import {
  HabitStatus,
  HabitType,
  WeekDay,
} from "../../src/generated/prisma/enums.js";
import { toWeekDay } from "../../src/utils/weekday.js";

export const ALL_DAYS = Object.values(WeekDay);
export const today = () => startOfDay(new Date());
export const todayWeekDay = () => toWeekDay(today());
export const daysExceptToday = () =>
  ALL_DAYS.filter((day) => day !== todayWeekDay());

export type HabitSeed = {
  type?: HabitType;
  status?: HabitStatus;
  dailyGoal?: number | null;
  unitId?: number | null;
  isConsolidated?: boolean;
  scheduledDays?: WeekDay[];
  createdAt?: Date;
};

export const seedHabit = (userId: number, opts: HabitSeed = {}) =>
  prisma.habit.create({
    data: {
      icon: "🧪",
      name: "Test",
      type: opts.type ?? HabitType.BOOLEAN,
      status: opts.status ?? HabitStatus.ACTIVE,
      dailyGoal: opts.dailyGoal ?? null,
      unitId: opts.unitId ?? null,
      isConsolidated: opts.isConsolidated ?? false,
      userId,
      ...(opts.createdAt ? { createdAt: opts.createdAt } : {}),
      scheduledDays: {
        create: (opts.scheduledDays ?? ALL_DAYS).map((day) => ({ day })),
      },
    },
  });

export const seedCompliance = (
  habitId: number,
  date: Date,
  isCompleted: boolean,
  recordedAmount?: number,
) =>
  prisma.compliance.create({
    data: { habitId, date, isCompleted, recordedAmount },
  });

export const seedCompletedDays = (habitId: number, count: number) =>
  prisma.compliance.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      habitId,
      date: startOfDay(subDays(new Date(), i + 1)),
      isCompleted: true,
    })),
  });

export const todayCompliance = (habit: {
  compliances: {
    date: Date | string;
    isCompleted: boolean;
    recordedAmount: number | null;
  }[];
}) => habit.compliances.find((c) => isSameDay(new Date(c.date), new Date()));
