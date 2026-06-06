import { logger } from "../src/config/logger.js";
import { prisma } from "../src/db/prisma.js";

async function main() {
  const baseUnits = [
    "uds",
    "min",
    "h",
    "km",
    "m",
    "kg",
    "g",
    "l",
    "cal",
    "págs",
  ];

  for (const name of baseUnits) {
    const existingUnit = await prisma.unit.findFirst({
      where: {
        name,
        userId: null,
      },
    });

    if (!existingUnit) {
      await prisma.unit.create({
        data: {
          name,
          userId: null,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    logger.error(error, "Error seeding database");
    await prisma.$disconnect();
    process.exit(1);
  });
