import { Router } from "express";
import { gameResultService } from "@quizio/socket/services/gameResultService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { quizzId, from, to, page } = req.query as any;
    const results = await gameResultService.list({
      quizzId,
      from,
      to,
      page: page ? parseInt(page) : 1,
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await gameResultService.getById(req.params.id);
    if (!result) {
      res.status(404).json({ error: "Game result not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/export", async (req, res) => {
  try {
    const result = await gameResultService.getById(req.params.id);
    if (!result) {
      res.status(404).json({ error: "Game result not found" });
      return;
    }

    const headers = [
      "Username",
      ...result.questions
        .map((q, i) => [`Q${i + 1} (correct/wrong)`, `Q${i + 1} points`])
        .flat(),
      "Total points",
      "Rank",
    ];

    const rows = result.players.map((player) => {
      const questionCols: string[] = [];
      result.questions.forEach((q) => {
        const pr = q.playerResults.find((r) => r.username === player.username);
        questionCols.push(pr?.correct ? "Correct" : "Incorrect");
        questionCols.push(String(pr?.points ?? 0));
      });
      return [
        player.username,
        ...questionCols,
        String(player.totalPoints),
        String(player.rank),
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const dateStr = new Date(result.playedAt).toISOString().split("T")[0];
    const filename = `${result.quizzSubject.replace(/[^a-z0-9]/gi, "_")}-${dateStr}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send("\uFEFF" + csv);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
