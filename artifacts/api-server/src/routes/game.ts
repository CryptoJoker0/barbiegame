import { Router } from "express";
import { db } from "@workspace/db";
import {
  playersTable, spinsTable, gameConfigTable, dailyClaimsTable,
} from "@workspace/db";
import { eq, gte, sql } from "drizzle-orm";

const router = Router();

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getOrCreateConfig() {
  let config = await db.query.gameConfigTable.findFirst();
  if (!config) {
    const [c] = await db.insert(gameConfigTable).values({}).returning();
    config = c;
  }
  return config;
}

// ── GET /game/config ──────────────────────────────────────────────────────────
router.get("/game/config", async (_req, res) => {
  const config = await getOrCreateConfig();
  res.json({
    spinCost: config.spinCost,
    jackpotAmount: config.jackpotAmount,
    dailyRewardCoins: config.dailyRewardCoins,
    dailyRewardCheese: config.dailyRewardCheese,
    bonusSpinCheeseCost: config.bonusSpinCheeseCost,
    maxDailySpins: config.maxDailySpins,
    maintenanceMode: config.maintenanceMode,
    announcementBanner: config.announcementBanner,
  });
});

// ── POST /game/spin ──────────────────────────────────────────────────────────
router.post("/game/spin", async (req, res) => {
  const { playerAddress, symbols, winAmount, cheeseEarned, isJackpot, clientSeed } = req.body;

  if (!playerAddress || !symbols || symbols.length !== 3) {
    res.status(400).json({ error: "Invalid spin data" });
    return;
  }

  const addr = playerAddress.toLowerCase();

  // Anti-cheat: cap winAmount sanity check
  if (typeof winAmount !== "number" || winAmount > 10000 || winAmount < 0) {
    res.status(400).json({ error: "Invalid win amount" });
    return;
  }

  const [spin] = await db.insert(spinsTable).values({
    playerAddress: addr,
    symbols,
    winAmount,
    cheeseEarned: cheeseEarned ?? 0,
    isJackpot: isJackpot ?? false,
    clientSeed,
  }).returning();

  // Update player stats
  await db.insert(playersTable)
    .values({
      address: addr,
      totalSpins: 1,
      totalWins: winAmount > 0 ? 1 : 0,
      totalWinnings: winAmount,
      highScore: winAmount,
      cheeseCollected: cheeseEarned ?? 0,
    })
    .onConflictDoUpdate({
      target: playersTable.address,
      set: {
        totalSpins: sql`${playersTable.totalSpins} + 1`,
        totalWins: winAmount > 0 ? sql`${playersTable.totalWins} + 1` : playersTable.totalWins,
        totalWinnings: sql`${playersTable.totalWinnings} + ${winAmount}`,
        highScore: sql`GREATEST(${playersTable.highScore}, ${winAmount})`,
        cheeseCollected: sql`${playersTable.cheeseCollected} + ${cheeseEarned ?? 0}`,
        updatedAt: sql`now()`,
      },
    });

  res.json({ spinId: spin.id, recorded: true });
});

// ── GET /game/daily-reward/:address ───────────────────────────────────────────
router.get("/game/daily-reward/:address", async (req, res) => {
  const { address } = req.params;
  const addr = address.toLowerCase();

  // Check if claimed today (UTC day)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const todayClaim = await db.query.dailyClaimsTable.findFirst({
    where: (t, { and, gte: gte_ }) => and(
      eq(t.playerAddress, addr),
      gte_(t.claimedAt, todayStart),
    ),
  });

  res.json({ canClaim: !todayClaim, lastClaimedAt: todayClaim?.claimedAt ?? null });
});

// ── POST /game/daily-reward/:address ─────────────────────────────────────────
router.post("/game/daily-reward/:address", async (req, res) => {
  const { address } = req.params;
  const addr = address.toLowerCase();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const existing = await db.query.dailyClaimsTable.findFirst({
    where: (t, { and, gte: gte_ }) => and(
      eq(t.playerAddress, addr),
      gte_(t.claimedAt, todayStart),
    ),
  });

  if (existing) {
    res.status(400).json({ error: "Already claimed today" });
    return;
  }

  const config = await getOrCreateConfig();
  const coinsAwarded = config.dailyRewardCoins;
  const cheeseAwarded = config.dailyRewardCheese;

  const [claim] = await db.insert(dailyClaimsTable).values({
    playerAddress: addr,
    coinsAwarded,
    cheeseAwarded,
  }).returning();

  res.json({ coinsAwarded, cheeseAwarded, claimedAt: claim.claimedAt });
});

export default router;
