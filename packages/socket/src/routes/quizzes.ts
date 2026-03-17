import { Router } from "express";
import { quizService } from "@quizio/socket/services/quizService";
import { quizSchema } from "@quizio/common/validators/quiz";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, sort } = req.query as { search?: string; sort?: string };
    const quizzes = await quizService.list(search, sort);
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const quiz = await quizService.getById(req.params.id);
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = quizSchema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: result.error.issues });
      return;
    }
    const user = (req as any).user;
    const quiz = await quizService.create(result.data, user.userId);
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const result = quizSchema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: result.error.issues });
      return;
    }
    const quiz = await quizService.update(req.params.id, result.data);
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await quizService.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/export", async (req, res) => {
  try {
    const quiz = await quizService.getById(req.params.id);
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${quiz.subject.replace(/[^a-z0-9]/gi, "_")}.json"`,
    );
    res.json({ subject: quiz.subject, questions: quiz.questions });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/import", async (req, res) => {
  try {
    const result = quizSchema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ error: "Invalid quiz format", details: result.error.issues });
      return;
    }
    const user = (req as any).user;
    const quiz = await quizService.create(result.data, user.userId);
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
