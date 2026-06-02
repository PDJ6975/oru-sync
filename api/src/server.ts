import app from "./app.js";
import { bootEnv } from "./config/bootConfig.js";
import { logger } from "./config/logger.js";
import { connectPrisma } from "./db/prisma.js";

const PORT = bootEnv.PORT;

connectPrisma()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to Prisma", err);
  });
