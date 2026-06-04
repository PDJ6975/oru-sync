import { HabitType, WeekDay } from "../generated/prisma/enums.js";

export type HabitInput = {
  icon: string;
  name: string;
  type: HabitType;
  dailyGoal?: number;
  note?: string;
  unitId?: number;
  scheduledDays: WeekDay[];
};
