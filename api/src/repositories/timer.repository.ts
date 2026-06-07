import { prisma } from "../db/prisma.js";

export const createTimerSession = async (
  userId: number,
  startDate: Date,
  selectedMinutes: number,
  habitId?: number,
) => {
  return await prisma.timerSession.create({
    data: {
      userId,
      startDate,
      selectedMinutes,
      habitId,
    },
  });
};

export const getActiveSession = async (userId: number) => {
  return await prisma.timerSession.findFirst({
    where: {
      userId,
      isCompleted: false,
    },
  });
};

export const getNotCompletedSessions = async (userId: number) => {
  return await prisma.timerSession.findMany({
    where: {
      userId,
      isCompleted: false,
    },
  });
};

export const updateTimerSession = async (
  sessionId: number,
  data: { isCompleted?: boolean },
) => {
  return await prisma.timerSession.update({
    where: { id: sessionId },
    data: {
      isCompleted: data.isCompleted,
    },
  });
};

export const deleteTimerSession = async (sessionId: number) => {
  return await prisma.timerSession.delete({
    where: { id: sessionId },
  });
};
