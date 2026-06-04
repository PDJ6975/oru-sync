import * as unitRepository from "../repositories/unit.repository.js";

export const getUnit = async (id: number) => {
  return await unitRepository.getUnit(id);
};
