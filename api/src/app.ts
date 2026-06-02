import express, { Request, Response } from "express";
import { httpLogger } from "./middleware/httpLogger.js";

const app = express();

app.use(httpLogger);
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running!");
});

export default app;
