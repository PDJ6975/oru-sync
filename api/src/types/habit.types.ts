import type {
  Compliance,
  Habit,
  ScheduledDay,
} from "../generated/prisma/client.js";
import type { HabitType, WeekDay } from "../generated/prisma/enums.js";
export const HABIT_FILTER_STATUS = ["active", "archived", "all"] as const;
export const HABIT_FILTER_SCHEDULE = ["all", "scheduled", "rest"] as const;
export type HabitFilterStatus = (typeof HABIT_FILTER_STATUS)[number];
export type HabitFilterSchedule = (typeof HABIT_FILTER_SCHEDULE)[number];

export type HabitCreationInput = {
  icon: string;
  name: string;
  type: HabitType;
  dailyGoal?: number;
  note?: string;
  unitId?: number;
  scheduledDays: WeekDay[];
};

export type HabitUpdateInput = {
  icon?: string;
  name?: string;
  dailyGoal?: number;
  note?: string;
  unitId?: number;
  scheduledDays?: WeekDay[];
};

export type SyncHabitInput = Habit & { deletedAt: Date; syncState: any };
export type SyncScheduledDayInput = ScheduledDay & {
  deletedAt: Date;
  syncState: any;
};
export type SyncComplianceInput = Compliance & {
  deletedAt: Date;
  syncState: any;
};

export type SyncDataInput = {
  habits: SyncHabitInput[];
  scheduledDays: SyncScheduledDayInput[];
  compliances: SyncComplianceInput[];
};
