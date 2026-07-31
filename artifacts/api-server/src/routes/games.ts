import { Router } from "express";
import { db } from "@workspace/db";
import { gamesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

/** Initial game catalog — seeded on first request if the table is empty */
const SEED_GAMES = [
  {
    id: "slot-machine",
    name: "AFRICA X1 Slot Machine",
    shortDescription: "Spin the 777 reels and chase the Mega Jackpot",
    description:
      "The AFRICA X1 Slot Machine is an exclusive 3-reel game for AFRICA NFT holders. " +
      "Match symbols to win Coins and Cheese Points. " +
      "Land three 7️⃣ symbols to trigger the Mega Jackpot. " +
      "Compete on the global leaderboard and unlock achievements.",
    entryFee: "1.0",
    feeCurrency: "XEN",
    rules: [
      "Connect your wallet and verify you hold at least 1 AFRICA X1 NFT.",
      "Pay the entry fee (1 XEN) to the AFRICA X1 Treasury Wallet.",
      "Once entry is confirmed on-chain, you may spin the reels.",
      "Each spin costs in-game Coins. Start balance is granted on entry.",
      "Match 2 symbols → small win. Match 3 symbols → big win.",
      "Three 7️⃣ symbols trigger the Mega Jackpot.",
      "Daily free spins reset every 24 hours (UTC).",
      "No real-money payouts — all winnings are in-game currency.",
    ].join("\n"),
    rewards: [
      "🏆 Mega Jackpot — Match three 7️⃣ for the top prize",
      "🧀 Cheese Points — Collect by spinning; used to unlock bonus spins",
      "🎖 Achievements — 8 milestones to unlock",
      "🥇 Leaderboard — Compete for the top position globally",
      "🎁 Daily Reward — Free Coins + Cheese every 24 hours",
    ].join("\n"),
    nftRequired: true,
    isActive: true,
  },
] as const;

async function seedIfEmpty() {
  const existing = await db.query.gamesTable.findFirst();
  if (!existing) {
    await db.insert(gamesTable).values(SEED_GAMES as any[]).onConflictDoNothing();
  }
}

// GET /games
router.get("/games", async (_req, res) => {
  await seedIfEmpty();
  const games = await db.query.gamesTable.findMany({
    where: eq(gamesTable.isActive, true),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });
  res.json(games);
});

// GET /games/:id
router.get("/games/:id", async (req, res) => {
  await seedIfEmpty();
  const { id } = req.params;
  const game = await db.query.gamesTable.findFirst({
    where: eq(gamesTable.id, id),
  });
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  res.json(game);
});

export default router;
