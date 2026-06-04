import * as unitRepository from "../repositories/unit.repository.js";

export const getUnit = async (id: number) => {
  return await unitRepository.getUnit(id);
};

export const createUnit = async (userId: number, name: string) => {
  return await unitRepository.createUnit(userId, name);
};

export const getUserUnits = async (userId: number) => {
  return await unitRepository.getUserUnits(userId);
};
export const getBaseUnits = async () => {
  return await unitRepository.getBaseUnits();
};

export const deleteUserUnit = async (unitId: number) => {
  await unitRepository.deleteUserUnit(unitId);
};

export const editUserUnit = async (unitId: number, name: string) => {
  await unitRepository.editUserUnit(unitId, name);
};
