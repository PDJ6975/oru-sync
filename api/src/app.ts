import express, { type Request, type Response } from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { httpLogger } from "./middleware/httpLogger.js";
import { habitRoutes } from "./routes/habit.routes.js";
import { origamiRoutes } from "./routes/origami.routes.js";
import { statsRoutes } from "./routes/stat.routes.js";
import { timerRoutes } from "./routes/timer.routes.js";
import { unitRoutes } from "./routes/unit.routes.js";
import { userRoutes } from "./routes/user.routes.js";

const app = express();

app.use(httpLogger);
app.use(express.json());

app.use("/api/v1", userRoutes);
app.use("/api/v1", habitRoutes);
app.use("/api/v1", unitRoutes);
app.use("/api/v1", statsRoutes);
app.use("/api/v1", origamiRoutes);
app.use("/api/v1", timerRoutes);
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend is running!");
});
app.use(errorHandler);

export default app;
