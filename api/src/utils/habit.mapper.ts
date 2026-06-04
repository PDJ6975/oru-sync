import { HabitUpdateInput } from "../types/habit.types.js";

export const toHabitUpdateInput = (body: HabitUpdateInput) => {
  const habitInput: HabitUpdateInput = {};

  if ("icon" in body) habitInput.icon = body.icon;
  if ("name" in body) habitInput.name = body.name;
  if ("dailyGoal" in body) habitInput.dailyGoal = body.dailyGoal;
  if ("note" in body) habitInput.note = body.note;
  if ("unitId" in body) habitInput.unitId = body.unitId;
  if ("scheduledDays" in body) habitInput.scheduledDays = body.scheduledDays;

  return habitInput;
};
