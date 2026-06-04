import { prisma } from "../db/prisma.js";

export const getUnit = async (id: number) => {
  return await prisma.unit.findUnique({
    where: {
      id,
    },
  });
};
