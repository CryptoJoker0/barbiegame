import { Router } from "express";
import { db } from "@workspace/db";
import { gamesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

/** Initial game catalog — upserted on every cold start */
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
    imageUrl: "/barbie-game/assets/game-777.jpg",
    entryFee: "4.0",
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
  {
    id: "barbie-prediction",
    name: "BARBIE_X1 Prediction Game",
    shortDescription: "Predict X1 price movements and Win Big!",
    description:
      "BARBIE_X1 Prediction Game is a price-prediction challenge powered by the X1 Blockchain. " +
      "Call whether X1 token price will go UP or DOWN before each round closes. " +
      "Get it right and earn Coins & Cheese Points. Beat the house — Beat me if you can!",
    imageUrl: "/barbie-game/assets/game-prediction.jpg",
    entryFee: "4.0",
    feeCurrency: "XEN",
    rules: [
      "Connect your wallet and verify you hold at least 1 AFRICA X1 NFT.",
      "Pay the entry fee (4 XEN) to the AFRICA X1 Treasury Wallet.",
      "Each round lasts 60 seconds — predict UP or DOWN before time runs out.",
      "Market sentiment indicator gives you a directional hint.",
      "Correct prediction → earn reward. Wrong → try next round.",
      "Rounds reset automatically — you can play unlimited rounds per session.",
      "No real-money payouts — all winnings are in-game currency.",
    ].join("\n"),
    rewards: [
      "🏆 Big Win — Consecutive correct predictions multiply your reward",
      "💰 Coins — Earned for every correct call",
      "🧀 Cheese Points — Bonus on streaks of 3+ correct predictions",
      "🎁 Daily Reward — Free entry bonus every 24 hours",
      "🥇 Leaderboard — Rank by total correct predictions",
    ].join("\n"),
    nftRequired: true,
    isActive: true,
  },
  {
    id: "barbie-english",
    name: "BARBIE AND FRIENDS",
    shortDescription: "Test your English skills — Vocabulary, Grammar, Spelling & Reading!",
    description:
      "BARBIE AND FRIENDS English Challenge is a fun educational game for kids aged 6 and up. " +
      "Choose from four game modes — Vocabulary, Grammar, Spelling, and Reading — " +
      "across three difficulty levels. Answer questions, earn stars, and climb the leaderboard!",
    imageUrl: "/barbie-game/assets/game-english.png",
    entryFee: "0.0",
    feeCurrency: "XEN",
    rules: [
      "No wallet or NFT required — free for everyone!",
      "Choose a game mode: Vocabulary, Grammar, Spelling, or Reading.",
      "Select your difficulty: Easy (Ages 6–8), Medium (Ages 9–11), or Hard (Ages 12+).",
      "Answer 10 questions per round — choose the correct option before time runs out.",
      "Earn 100+ points for each correct answer; bonus points for fast answers.",
      "Lose a life for each wrong answer — run out of lives and the game ends.",
      "Scores are saved to the local leaderboard.",
    ].join("\n"),
    rewards: [
      "⭐ Stars — Earn points for every correct answer",
      "⏱ Speed Bonus — Answer quickly for extra points",
      "🏆 Leaderboard — Track your top scores locally",
      "🎉 Confetti — Complete all 10 questions correctly for a celebration!",
      "🧠 Learning — Build English skills while having fun",
    ].join("\n"),
    nftRequired: false,
    isActive: true,
  },
  {
    id: "barbie-wott",
    name: "BARBIE_WOTT",
    shortDescription: "Roll, Strategize, Outsmart — Win Big on the Mystic Board!",
    description:
      "BARBIE_WOTT is a mystic board game exclusive to AFRICA NFT holders. " +
      "Roll the dice, land on special tiles — Roll Again, Double Reward, Extra Turn, Safe Zone — " +
      "and outsmart your opponents to claim the WOTT crown. Mystic & Cool.",
    imageUrl: "/barbie-game/assets/game-wott.jpg",
    entryFee: "4.0",
    feeCurrency: "XEN",
    rules: [
      "Connect your wallet and verify you hold at least 1 AFRICA X1 NFT.",
      "Pay the entry fee (4 XEN) to the AFRICA X1 Treasury Wallet.",
      "Roll the dice each turn to advance on the board.",
      "Special tiles: Roll Again, Double Reward, Extra Turn, Safe Zone, Bonus.",
      "Reach the WOTT crown tile to win the round.",
      "Strategy matters — plan your moves to land on bonus tiles.",
      "No real-money payouts — all winnings are in-game currency.",
    ].join("\n"),
    rewards: [
      "👑 WOTT Crown — First to reach the crown wins the round",
      "⭐ Double Reward — Land the tile to instantly double your Coins",
      "🎲 Extra Turn — Roll again without waiting",
      "💰 Coins — Earned each round you complete",
      "🏆 Leaderboard — Track wins across all WOTT sessions",
    ].join("\n"),
    nftRequired: true,
    isActive: true,
  },
];

let seeded = false;

async function seedGames() {
  if (seeded) return;
  seeded = true;
  try {
    // Upsert all seed games so image URLs and descriptions stay current
    for (const game of SEED_GAMES) {
      await db
        .insert(gamesTable)
        .values(game as any)
        .onConflictDoUpdate({
          target: gamesTable.id,
          set: {
            name: game.name,
            shortDescription: game.shortDescription,
            description: game.description,
            imageUrl: game.imageUrl,
            entryFee: game.entryFee,
            feeCurrency: game.feeCurrency,
            rules: game.rules,
            rewards: game.rewards,
            nftRequired: game.nftRequired,
            isActive: game.isActive,
          },
        });
    }
  } catch (err) {
    seeded = false; // allow retry on next request
    console.error("Game seed failed:", err);
  }
}

// GET /games
router.get("/games", async (_req, res) => {
  await seedGames();
  const games = await db.query.gamesTable.findMany({
    where: eq(gamesTable.isActive, true),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });
  res.json(games);
});

// GET /games/:id
router.get("/games/:id", async (req, res) => {
  await seedGames();
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
