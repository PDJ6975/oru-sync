import { WeekDay } from "../generated/prisma/enums.js";
import { getISODay } from "date-fns";

const WEEKDAYS = [
  WeekDay.MONDAY,
  WeekDay.TUESDAY,
  WeekDay.WEDNESDAY,
  WeekDay.THURSDAY,
  WeekDay.FRIDAY,
  WeekDay.SATURDAY,
  WeekDay.SUNDAY,
];

export const toWeekDay = (date: Date): WeekDay => {
  const isoDay = getISODay(date); // 1 (Monday) to 7 (Sunday)
  return WEEKDAYS[isoDay - 1];
};
