import { Router } from "express";
import { db } from "@workspace/db";
import {
  gameConfigTable, playersTable, spinsTable, announcementsTable,
} from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router = Router();

// ── GET /admin/config ─────────────────────────────────────────────────────────
router.get("/admin/config", async (_req, res) => {
  let config = await db.query.gameConfigTable.findFirst();
  if (!config) {
    const [c] = await db.insert(gameConfigTable).values({}).returning();
    config = c;
  }
  res.json(config);
});

// ── PUT /admin/config ─────────────────────────────────────────────────────────
router.put("/admin/config", async (req, res) => {
  const {
    spinCost, jackpotAmount, dailyRewardCoins, dailyRewardCheese,
    bonusSpinCheeseCost, maxDailySpins, maintenanceMode, announcementBanner,
  } = req.body;

  const update: Record<string, any> = { updatedAt: sql`now()` };
  if (spinCost !== undefined) update.spinCost = spinCost;
  if (jackpotAmount !== undefined) update.jackpotAmount = jackpotAmount;
  if (dailyRewardCoins !== undefined) update.dailyRewardCoins = dailyRewardCoins;
  if (dailyRewardCheese !== undefined) update.dailyRewardCheese = dailyRewardCheese;
  if (bonusSpinCheeseCost !== undefined) update.bonusSpinCheeseCost = bonusSpinCheeseCost;
  if (maxDailySpins !== undefined) update.maxDailySpins = maxDailySpins;
  if (maintenanceMode !== undefined) update.maintenanceMode = maintenanceMode;
  if (announcementBanner !== undefined) update.announcementBanner = announcementBanner;

  // Upsert — if no config exists, create one
  let config = await db.query.gameConfigTable.findFirst();
  if (!config) {
    const [c] = await db.insert(gameConfigTable).values({}).returning();
    config = c;
  }

  const [updated] = await db
    .update(gameConfigTable)
    .set(update)
    .returning();

  res.json(updated);
});

// ── GET /admin/stats ──────────────────────────────────────────────────────────
router.get("/admin/stats", async (_req, res) => {
  const [stats] = await db
    .select({
      totalPlayers: sql<number>`COUNT(DISTINCT ${playersTable.address})`,
      totalSpins: sql<number>`SUM(${playersTable.totalSpins})`,
      totalWinnings: sql<number>`SUM(${playersTable.totalWinnings})`,
      avgWinRate: sql<number>`AVG(CASE WHEN ${playersTable.totalSpins} > 0 THEN ${playersTable.totalWins}::float / ${playersTable.totalSpins} ELSE 0 END)`,
    })
    .from(playersTable);

  const [jackpotCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(spinsTable)
    .where(sql`${spinsTable.isJackpot} = true`);

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [activePlayers] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${spinsTable.playerAddress})` })
    .from(spinsTable)
    .where(sql`${spinsTable.createdAt} > ${twentyFourHoursAgo}`);

  res.json({
    totalPlayers: Number(stats.totalPlayers) || 0,
    totalSpins: Number(stats.totalSpins) || 0,
    totalWinnings: Number(stats.totalWinnings) || 0,
    totalJackpots: Number(jackpotCount.count) || 0,
    activePlayers24h: Number(activePlayers.count) || 0,
    avgWinRate: Number(stats.avgWinRate) || 0,
  });
});

// ── POST /admin/leaderboard/reset ─────────────────────────────────────────────
router.post("/admin/leaderboard/reset", async (_req, res) => {
  await db
    .update(playersTable)
    .set({ highScore: 0, totalWinnings: 0, totalSpins: 0, totalWins: 0, cheeseCollected: 0, bestStreak: 0 });

  res.json({ success: true, message: "Leaderboard reset" });
});

export default router;
