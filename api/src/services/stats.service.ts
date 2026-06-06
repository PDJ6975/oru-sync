import * as userService from "./user.service.js";
import * as habitService from "./habit.service.js";
import { addDays, startOfDay } from "date-fns";
import * as statsRepository from "../repositories/stats.repository.js";
import { toDtoStats } from "../utils/stats.mapper.js";
import { toWeekDay } from "../utils/weekday.js";
import { Habit, Prisma } from "../generated/prisma/client.js";
import { HabitStatsComp, UserStatsComp } from "../types/stats.types.js";

const getStatsForYear = async (userId: number, year: number) => {
  const [userStats, habitStats] = await Promise.all([
    statsRepository.getUserStatsForYear(userId, year),
    statsRepository.getHabitStatsForYear(userId, year),
  ]);
  return toDtoStats(userStats, habitStats);
};

const orchestrateStats = async (userId: number, from: Date, to: Date) => {
  // 1. Recalculate stats from 'from' to 'to' in memory
  const { habitStatsAcc, userStatsAcc } = await recalculateStats(
    userId,
    from,
    to,
    false,
  );

  // 2. Save the computed stats in the database
  await Promise.all([
    await upsertHabitStats(habitStatsAcc),
    await upsertUserStats(userId, userStatsAcc),
  ]);
};

const recalculateStats = async (
  userId: number,
  from: Date,
  to: Date,
  overlay: boolean,
) => {
  const habits = await habitService.getUserHabitsWithCompliancesInRange(
    userId,
    from,
    to,
  );

  // Initialize in memory accumulators for the stats
  const habitStatsAcc = new Map<string, HabitStatsComp>(); // { [habitId, year]: {currentStreak, bestStreak, totalCompletions, totalAccumulation} }
  const userStatsAcc = new Map<number, UserStatsComp>(); // {[year]: {currentStreak, bestStreak, habitsCompleted, perfectDays, totalScheduled}}

  // Loop each day from 'from' to 'to'
  for (let day = from; day <= to; day = addDays(day, 1)) {
    // Basic data for the computation
    const year = day.getFullYear();
    const weekDay = toWeekDay(day);
    // Data for the computation of userStats of that day
    let dayScheduled = 0;
    let dayCompleted = 0;

    // Loop each habit for the day
    for (const habit of habits) {
      const isActive = habit.archivedAt
        ? habit.createdAt <= day && day <= habit.archivedAt
        : habit.createdAt <= day;
      const isScheduled = habit.scheduledDays.some((sd) => sd.day === weekDay);

      // If the habit wasn't active or wasn't scheduled for that day, it doesn't affect that day's stats
      if (!isActive || !isScheduled) continue;

      // If the habit was active and scheduled, it affects that day's stats
      dayScheduled++;

      // We retrieve the HabitStats for that habit for that year; if it doesn't exist, we create it
      const habitStatsAccData = getOrInitHabitStatsAcc(
        habitStatsAcc,
        habit,
        year,
      );

      const compliance = getComplianceForDay(habit, day);

      if (compliance) {
        compliance.recordedAmount
          ? (habitStatsAccData.totalAccumulation += compliance.recordedAmount)
          : (habitStatsAccData.totalAccumulation += 0);
      }

      if (compliance && compliance.isCompleted) {
        habitStatsAccData.totalCompletions++;
        habitStatsAccData.currentStreak++;
        habitStatsAccData.bestStreak = Math.max(
          habitStatsAccData.bestStreak,
          habitStatsAccData.currentStreak,
        );
        dayCompleted++;
      } else {
        habitStatsAccData.currentStreak = 0;
      }
    }

    // Compute userStats looping days using dayScheduled and dayCompleted
    const userStatsAccData = getOrInitUserStatsAcc(userStatsAcc, year);
    userStatsAccData.habitsCompleted += dayCompleted;
    userStatsAccData.totalScheduled += dayScheduled;
    // Rest days don't break the streak
    if (dayScheduled > 0 && dayScheduled === dayCompleted) {
      userStatsAccData.perfectDays++;
      userStatsAccData.currentStreak++;
      userStatsAccData.bestStreak = Math.max(
        userStatsAccData.bestStreak,
        userStatsAccData.currentStreak,
      );
    } else if (dayScheduled > 0) {
      userStatsAccData.currentStreak = 0;
    }
  }

  if (overlay) {
    return toDtoStats(userStatsAcc, habitStatsAcc);
  }

  return { habitStatsAcc, userStatsAcc };
};

const upsertHabitStats = async (habitStatsAcc: Map<string, HabitStatsComp>) => {
  for (const [key, habitStatsData] of habitStatsAcc.entries()) {
    const [habitId, year] = key.split("-").map(Number);
    await statsRepository.upsertHabitStats(habitId, year, habitStatsData);
  }
};

const upsertUserStats = async (
  userId: number,
  userStatsAcc: Map<number, UserStatsComp>,
) => {
  for (const [year, userStatsData] of userStatsAcc.entries()) {
    await statsRepository.upsertUserStats(userId, year, userStatsData);
  }
};

const getComplianceForDay = (
  habit: Prisma.HabitGetPayload<{ include: { compliances: true } }>,
  day: Date,
) => {
  return habit.compliances.find(
    (compliance) => compliance.date.getTime() === day.getTime(),
  );
};

const getOrInitUserStatsAcc = (
  acc: Map<number, UserStatsComp>,
  year: number,
): UserStatsComp => {
  if (!acc.has(year)) {
    acc.set(year, {
      currentStreak: 0,
      bestStreak: 0,
      habitsCompleted: 0,
      perfectDays: 0,
      totalScheduled: 0,
    });
  }
  return acc.get(year)!;
};

const getOrInitHabitStatsAcc = (
  acc: Map<string, HabitStatsComp>,
  habit: Habit,
  year: number,
): HabitStatsComp => {
  const key = `${habit.id}-${year}`;
  if (!acc.has(key)) {
    acc.set(key, {
      habitName: habit.name,
      habitIcon: habit.icon,
      currentStreak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      totalAccumulation: 0,
    });
  }
  return acc.get(key)!;
};

export const getStats = async (userId: number, year: number) => {
  const user = await userService.getUserById(userId);
  const lastComputedDay = user!.lastComputedDay;
  const today = startOfDay(new Date());
  const yesterday = addDays(today, -1);

  // Si el usuario tiene lastComputed days, el from será desde el día siguiente.
  // Si el usuario es nuevo, el from será desde la fecha del primer hábito creado, o null si no tiene hábitos (en cuyo caso las stats serán vacías).

  const from = lastComputedDay
    ? addDays(lastComputedDay, 1)
    : await habitService.getEarliestHabitDate(userId);

  // 1. Calcular estadísticas desde from hasta ayer

  if (from && from <= yesterday) {
    await orchestrateStats(userId, from, yesterday);
    await userService.updateLastComputedDay(userId, yesterday);
  }

  // 2. Devolver las estadísticas

  // Si el año es el actual, se debe añadir un overlay en tiempo de ejecución con las estadísticas del día de hoy.

  let stats = await getStatsForYear(userId, year);

  if (year == today.getFullYear()) {
    stats = await recalculateStats(userId, today, today, true);
  }

  return stats;
};
