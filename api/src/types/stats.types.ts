import type { HabitStatus, HabitType } from "../generated/prisma/enums.js";

export interface UserStatsComp {
  currentStreak: number;
  bestStreak: number;
  habitsCompleted: number;
  perfectDays: number;
  totalScheduled: number;
}

export interface HabitStatsComp {
  habitId: string;
  habitName: string;
  habitIcon: string;
  habitType: HabitType;
  habitStatus: HabitStatus;
  habitUnit: string | null;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  totalAccumulation: number;
  recordedDays: number;
}

// Solo las columnas persistibles de HabitStats
export interface HabitStatsWrite {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  totalAccumulation: number;
  recordedDays: number;
}

// Readable DTOs for stats
export interface UserStatsDto {
  complianceRate: number;
  currentStreak: number;
  bestStreak: number;
  habitsCompleted: number;
  perfectDays: number;
}

export interface HabitStatsDto {
  habitId: string;
  habitName: string;
  habitIcon: string;
  habitType: HabitType;
  habitStatus: HabitStatus;
  habitUnit: string | null;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  totalAccumulation: number;
  dailyAverage: number;
}

export interface Stats {
  userStats: UserStatsDto;
  habitStats: HabitStatsDto[];
}
