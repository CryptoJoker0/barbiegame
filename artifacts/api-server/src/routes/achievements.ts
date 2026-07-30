import { Router } from "express";
import { db } from "@workspace/db";
import { achievementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const VALID_KEYS = new Set([
  "FIRST_SPIN", "FIRST_WIN", "JACKPOT_HUNTER", "CHEESE_LOVER",
  "HOT_STREAK", "VETERAN", "HIGH_ROLLER", "DAILY_DEVOTEE",
]);

const router = Router();

// GET /achievements/:address
router.get("/achievements/:address", async (req, res) => {
  const { address } = req.params;
  const addr = address.toLowerCase();

  const achievements = await db.query.achievementsTable.findMany({
    where: eq(achievementsTable.playerAddress, addr),
  });

  res.json(
    achievements.map(a => ({
      achievementKey: a.achievementKey,
      unlockedAt: a.unlockedAt,
    }))
  );
});

// POST /achievements/:address — unlock achievement
router.post("/achievements/:address", async (req, res) => {
  const { address } = req.params;
  const { achievementKey } = req.body;
  const addr = address.toLowerCase();

  if (!achievementKey || !VALID_KEYS.has(achievementKey)) {
    res.status(400).json({ error: "Invalid achievement key" });
    return;
  }

  const id = `${addr}:${achievementKey}`;

  const [ach] = await db
    .insert(achievementsTable)
    .values({ id, playerAddress: addr, achievementKey })
    .onConflictDoNothing()
    .returning();

  res.json({ achievementKey, unlockedAt: ach?.unlockedAt ?? null, alreadyUnlocked: !ach });
});

export default router;
