import { Prisma, UserStats } from "../generated/prisma/client.js";
import { HabitStatsComp, Stats, UserStatsComp } from "../types/stats.types.js";

type HabitStatsWithHabit = Prisma.HabitStatsGetPayload<{
  include: {
    habit: { select: { id: true; name: true; icon: true } };
  };
}>;

export const toDtoStats = (
  userStats: UserStats | UserStatsComp | null,
  habitStats: HabitStatsWithHabit[],
): Stats => {
  return {
    userStats: {
      complianceRate:
        userStats && userStats.totalScheduled > 0
          ? (userStats.habitsCompleted / userStats.totalScheduled) * 100
          : 0,
      currentStreak: userStats?.currentStreak ?? 0,
      bestStreak: userStats?.bestStreak ?? 0,
      habitsCompleted: userStats?.habitsCompleted ?? 0,
      perfectDays: userStats?.perfectDays ?? 0,
    },
    habitStats: habitStats
      .map((stat) => {
        const totalAccumulation = stat.totalAccumulation ?? 0;
        return {
          habitId: stat.habitId,
          habitName: stat.habit.name,
          habitIcon: stat.habit.icon,
          currentStreak: stat.currentStreak,
          bestStreak: stat.bestStreak,
          totalCompletions: stat.totalCompletions,
          totalAccumulation,
          dailyAverage:
            stat.totalCompletions > 0
              ? totalAccumulation / stat.totalCompletions
              : 0,
          score: stat.totalCompletions * (1 + stat.currentStreak / 10),
        };
      })
      .sort((a, b) => b.score - a.score), // Sort by score descending
  };
};
