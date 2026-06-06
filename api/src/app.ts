import express, { Request, Response } from "express";
import { httpLogger } from "./middleware/httpLogger.js";
import { userRoutes } from "./routes/user.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { habitRoutes } from "./routes/habit.routes.js";
import { unitRoutes } from "./routes/unit.routes.js";
import { statsRoutes } from "./routes/stat.routes.js";
import { origamiRoutes } from "./routes/origami.routes.js";

const app = express();

app.use(httpLogger);
app.use(express.json());

app.use("/api/v1", userRoutes);
app.use("/api/v1", habitRoutes);
app.use("/api/v1", unitRoutes);
app.use("/api/v1", statsRoutes);
app.use("/api/v1", origamiRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running!");
});
app.use(errorHandler);

export default app;
