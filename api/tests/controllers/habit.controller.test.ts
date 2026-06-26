import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { HabitType } from "../../src/generated/prisma/enums.js";
import {
  createTestUser,
  disconnect,
  getBaseUnit,
  resetDb,
  type TestUser,
} from "../helpers/db.js";
import { seedHabit } from "../helpers/factories.js";
import { authedRequest } from "../helpers/http.js";

describe("habit controller (E2E)", () => {
  let user: TestUser;
  let client: ReturnType<typeof authedRequest>;

  const seedQuantityHabit = async (overrides = {}) => {
    const uds = await getBaseUnit("uds");
    return seedHabit(user.userId, {
      type: HabitType.QUANTITY,
      dailyGoal: 5,
      unitId: uds.id,
      ...overrides,
    });
  };

  beforeEach(async () => {
    await resetDb();
    user = await createTestUser();
    client = authedRequest(user.token);
  });

  afterAll(disconnect);

  it("GET /habits/timer/load lista los hábitos del temporizador", async () => {
    const min = await getBaseUnit("min");
    await seedQuantityHabit({ unitId: min.id });

    const res = await client.get("/api/v1/habits/timer/load");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
