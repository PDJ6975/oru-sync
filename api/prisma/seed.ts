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

  const origamiCatalog = [
    { name: "mariposa", phases: 5 },
    { name: "bailarina", phases: 6 },
    { name: "flor", phases: 6 },
    { name: "luna", phases: 6 },
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

  for (const { name, phases } of origamiCatalog) {
    const existingOrigami = await prisma.origami.findFirst({
      where: {
        name,
      },
    });

    if (!existingOrigami) {
      await prisma.origami.create({
        data: {
          name,
          phases,
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
