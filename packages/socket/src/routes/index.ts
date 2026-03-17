import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import authRouter from "./auth";
import quizzesRouter from "./quizzes";
import uploadsRouter from "./uploads";
import settingsRouter from "./settings";
import gameResultsRouter from "./gameResults";

const router = Router();

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.use("/auth", authRouter);
router.use("/quizzes", authMiddleware, quizzesRouter);
router.use("/uploads", authMiddleware, uploadsRouter);
router.use("/settings", authMiddleware, settingsRouter);
router.use("/game-results", authMiddleware, gameResultsRouter);

export default router;
