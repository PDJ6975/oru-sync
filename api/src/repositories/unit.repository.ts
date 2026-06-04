import { prisma } from "../db/prisma.js";

export const getUnit = async (id: number) => {
  return await prisma.unit.findUnique({
    where: {
      id,
    },
  });
};

export const createUnit = async (userId: number, name: string) => {
  return await prisma.unit.create({
    data: {
      name,
      userId,
    },
  });
};

export const getUserUnits = async (userId: number) => {
  return await prisma.unit.findMany({
    where: {
      userId,
    },
  });
};

export const getBaseUnits = async () => {
  return await prisma.unit.findMany({
    where: {
      userId: null,
    },
  });
};

export const deleteUserUnit = async (unitId: number) => {
  await prisma.unit.delete({
    where: {
      id: unitId,
    },
  });
};

export const editUserUnit = async (unitId: number, name: string) => {
  await prisma.unit.update({
    where: {
      id: unitId,
    },
    data: {
      name,
    },
  });
};
