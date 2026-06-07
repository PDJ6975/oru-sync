import { isSameDay } from "date-fns";
import type { Compliance } from "../generated/prisma/client.js";

export const getComplianceForDay = (compliances: Compliance[], day: Date) =>
  compliances.find((compliance) => isSameDay(compliance.date, day));
