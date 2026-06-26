import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { HabitType } from "../../src/generated/prisma/enums.js";
import * as habitService from "../../src/services/habit.service.js";
import * as timerService from "../../src/services/timer.service.js";
import {
  createTestUser,
  disconnect,
  getBaseUnit,
  resetDb,
  type TestUser,
} from "../helpers/db.js";
import {
  seedHabit,
  seedTimerSession,
  todayCompliance,
} from "../helpers/factories.js";

describe("integración temporizador -> hábitos", () => {
  let user: TestUser;

  beforeEach(async () => {
    await resetDb();
    user = await createTestUser();
  });

  afterAll(disconnect);

  it("PA-003 - acumula varias sesiones en el registro diario y completa el hábito", async () => {
    const min = await getBaseUnit("min");
    const habit = await seedHabit(user.userId, {
      type: HabitType.QUANTITY,
      dailyGoal: 10,
      unitId: min.id,
    });

    const finishSession = async (minutes: number) => {
      await seedTimerSession(user.userId, {
        habitId: habit.id,
        selectedMinutes: minutes,
      });
      await timerService.finishTimerSession(user.userId);
      return todayCompliance((await habitService.getHabitById(habit.id))!);
    };

    // Primera sesión de 5 min: registro parcial, sin completar.
    const partial = await finishSession(5);
    expect(partial?.recordedAmount).toBe(5);
    expect(partial?.isCompleted).toBe(false);

    // Segunda sesión de 5 min: se acumula a 10 y completa el hábito.
    const completed = await finishSession(5);
    expect(completed?.recordedAmount).toBe(10);
    expect(completed?.isCompleted).toBe(true);
  });
});
