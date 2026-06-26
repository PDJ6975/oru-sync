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

export type AssignmentSeed = {
  origamiName?: string;
  progress?: number;
  revealedPhase?: number;
  completedAt?: Date | null;
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
  habitId: string,
  date: Date,
  isCompleted: boolean,
  recordedAmount?: number,
) =>
  prisma.compliance.create({
    data: { habitId, date, isCompleted, recordedAmount },
  });

export const seedCompletedDays = (habitId: string, count: number) =>
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

export const seedUnit = (userId: number, name: string) =>
  prisma.unit.create({ data: { name, userId } });

export type TimerSeed = {
  startDate?: Date;
  selectedMinutes?: number;
  isCompleted?: boolean;
  habitId?: string | null;
};

export const seedTimerSession = (userId: number, opts: TimerSeed = {}) =>
  prisma.timerSession.create({
    data: {
      userId,
      startDate: opts.startDate ?? new Date(),
      selectedMinutes: opts.selectedMinutes ?? 25,
      isCompleted: opts.isCompleted ?? false,
      habitId: opts.habitId ?? null,
    },
  });

export const getOrigami = (name: string) =>
  prisma.origami.findFirstOrThrow({ where: { name } });

export const seedAssignment = async (
  userId: number,
  opts: AssignmentSeed = {},
) => {
  const origami = await getOrigami(opts.origamiName ?? "mariposa");
  return prisma.assignment.create({
    data: {
      userId,
      origamiId: origami.id,
      progress: opts.progress ?? 0,
      revealedPhase: opts.revealedPhase ?? 0,
      completedAt: opts.completedAt ?? null,
    },
    include: { origami: true },
  });
};
