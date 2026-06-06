import { prisma } from "../db/prisma.js";
import { HabitStatsWrite, UserStatsComp } from "../types/stats.types.js";

export const getUserStatsForYear = async (userId: number, year: number) => {
  return await prisma.userStats.findUnique({
    where: { userId_year: { userId, year } },
  });
};

export const getHabitStatsForYear = async (userId: number, year: number) => {
  return await prisma.habitStats.findMany({
    where: { habit: { userId }, year },
    include: { habit: { select: { id: true, name: true, icon: true } } },
  });
};

// Todas las filas del usuario (cualquier año) para precargar los acumuladores
export const getHabitStatsByUser = async (userId: number) => {
  return await prisma.habitStats.findMany({ where: { habit: { userId } } });
};

export const getUserStatsByUser = async (userId: number) => {
  return await prisma.userStats.findMany({ where: { userId } });
};

export const upsertHabitStats = async (
  habitId: number,
  year: number,
  stats: HabitStatsWrite,
) => {
  await prisma.habitStats.upsert({
    where: { habitId_year: { habitId, year } },
    update: stats,
    create: { habitId, year, ...stats },
  });
};

export const upsertUserStats = async (
  userId: number,
  year: number,
  stats: UserStatsComp,
) => {
  await prisma.userStats.upsert({
    where: { userId_year: { userId, year } },
    update: stats,
    create: { userId, year, ...stats },
  });
};
