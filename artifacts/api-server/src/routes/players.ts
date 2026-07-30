import { Router } from "express";
import { db } from "@workspace/db";
import { playersTable, spinsTable, achievementsTable, dailyClaimsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

// GET /players/:address
router.get("/players/:address", async (req, res) => {
  const { address } = req.params;
  const player = await db.query.playersTable.findFirst({
    where: eq(playersTable.address, address.toLowerCase()),
  });
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  res.json(player);
});

// PUT /players/:address — upsert player
router.put("/players/:address", async (req, res) => {
  const { address } = req.params;
  const addr = address.toLowerCase();
  const { nickname } = req.body;

  const [player] = await db
    .insert(playersTable)
    .values({ address: addr, nickname })
    .onConflictDoUpdate({
      target: playersTable.address,
      set: { nickname, updatedAt: sql`now()` },
    })
    .returning();

  res.json(player);
});

// GET /players/:address/stats
router.get("/players/:address/stats", async (req, res) => {
  const { address } = req.params;
  const addr = address.toLowerCase();

  const player = await db.query.playersTable.findFirst({
    where: eq(playersTable.address, addr),
  });

  if (!player) {
    res.json({
      totalSpins: 0,
      totalWins: 0,
      highScore: 0,
      totalWinnings: 0,
      cheeseCollected: 0,
      bestStreak: 0,
    });
    return;
  }

  res.json({
    totalSpins: player.totalSpins,
    totalWins: player.totalWins,
    highScore: player.highScore,
    totalWinnings: player.totalWinnings,
    cheeseCollected: player.cheeseCollected,
    bestStreak: player.bestStreak,
  });
});

export default router;
