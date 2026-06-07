import type { TimerSession } from "../generated/prisma/client.js";
import * as timerRepository from "../repositories/timer.repository.js";
import * as habitService from "./habit.service.js";
import * as origamiService from "./origami.service.js";

export const createTimerSession = async (
  userId: number,
  startDate: Date,
  selectedMinutes: number,
  habitId?: number,
) => {
  await removeOlderSessions(userId);

  return await timerRepository.createTimerSession(
    userId,
    startDate,
    selectedMinutes,
    habitId,
  );
};

export const getActiveSession = async (userId: number) => {
  return await timerRepository.getActiveSession(userId);
};

const getNotCompletedSessions = async (userId: number) => {
  return await timerRepository.getNotCompletedSessions(userId);
};

const removeOlderSessions = async (userId: number) => {
  const activeSessions = await getNotCompletedSessions(userId);
  const today = new Date();
  for (const session of activeSessions) {
    const endDate = getEndDate(session.startDate, session.selectedMinutes);
    if (endDate < today) {
      await recordAndUpdateSession(userId, session);
    }
  }
  await origamiService.evaluateProgress(userId);
};

export const getEndDate = (startDate: Date, selectedMinutes: number) => {
  return new Date(startDate.getTime() + selectedMinutes * 60 * 1000);
};

export const finishTimerSession = async (userId: number) => {
  const activeSession = await getActiveSession(userId);

  await recordAndUpdateSession(userId, activeSession!);
  await origamiService.evaluateProgress(userId);
};

const recordAndUpdateSession = async (
  userId: number,
  session: TimerSession,
) => {
  if (session!.habitId) {
    await habitService.recordSessionTime(
      session!.habitId,
      session!.selectedMinutes,
    );
    await origamiService.applyBonusForSession(userId, session.selectedMinutes);
  }

  await timerRepository.updateTimerSession(session!.id, {
    isCompleted: true,
  });
};

export const getOrRecoverTimerSession = async (userId: number) => {
  const session = await getActiveSession(userId);

  if (session) {
    const endDate = getEndDate(session.startDate, session.selectedMinutes);
    // Si endDate es menor o igual que ahora, se debe completar
    if (endDate <= new Date()) {
      await finishTimerSession(userId);
    }
  }
  return await getActiveSession(userId);
};

export const cancelTimerSession = async (userId: number) => {
  const activeSession = await getActiveSession(userId);
  return await timerRepository.deleteTimerSession(activeSession!.id);
};
