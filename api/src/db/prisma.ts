import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { bootEnv } from "../config/bootConfig.js";
import { logger } from "../config/logger.js";

const connectionString = `${bootEnv.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });

export async function connectPrisma() {
  logger.info("Connecting to PostgreSQL");
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`; // verify db conexion is working fine, connect do not call db
  logger.info("Connected to PostgreSQL");
}
