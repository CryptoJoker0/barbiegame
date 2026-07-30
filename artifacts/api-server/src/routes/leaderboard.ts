import { Router } from "express";
import { db } from "@workspace/db";
import { playersTable } from "@workspace/db";
import { desc, asc, sql } from "drizzle-orm";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const sortBy = (req.query.sortBy as string) || "highScore";

  const allowedSort: Record<string, any> = {
    highScore: desc(playersTable.highScore),
    totalWinnings: desc(playersTable.totalWinnings),
    totalSpins: desc(playersTable.totalSpins),
  };

  const orderBy = allowedSort[sortBy] ?? desc(playersTable.highScore);

  const players = await db
    .select({
      address: playersTable.address,
      nickname: playersTable.nickname,
      highScore: playersTable.highScore,
      totalWinnings: playersTable.totalWinnings,
      totalSpins: playersTable.totalSpins,
      totalWins: playersTable.totalWins,
      cheeseCollected: playersTable.cheeseCollected,
      bestStreak: playersTable.bestStreak,
    })
    .from(playersTable)
    .orderBy(orderBy)
    .limit(limit);

  res.json(players);
});

export default router;
