// Computable stats types
export interface UserStatsComp {
  currentStreak: number;
  bestStreak: number;
  habitsCompleted: number;
  perfectDays: number;
  totalScheduled: number;
}

export interface HabitStatsComp {
  habitName: string;
  habitIcon: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  totalAccumulation: number;
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
  habitId: number;
  habitName: string;
  habitIcon: string;
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
