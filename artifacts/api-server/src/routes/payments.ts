import { Router } from "express";
import { ethers } from "ethers";
import { db } from "@workspace/db";
import { entryPaymentsTable, gamesTable } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";

const router = Router();

const RPC_URL = process.env.NFT_RPC_URL ?? "https://rpc.mainnet.x1.xyz";

// ── POST /payments/entry ──────────────────────────────────────────────────────
// Record and verify an on-chain entry fee payment.
router.post("/payments/entry", async (req, res) => {
  const { walletAddress, gameId, amount, txHash, treasuryWallet } = req.body;

  if (!walletAddress || !gameId || !amount || !txHash || !treasuryWallet) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const addr = (walletAddress as string).toLowerCase();
  const treasury = (treasuryWallet as string).toLowerCase();

  // Check game exists
  const game = await db.query.gamesTable.findFirst({
    where: eq(gamesTable.id, gameId),
  });
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  // Duplicate prevention
  const existing = await db.query.entryPaymentsTable.findFirst({
    where: eq(entryPaymentsTable.txHash, txHash),
  });
  if (existing) {
    res.json({ id: existing.id, status: existing.status, duplicate: true });
    return;
  }

  // Try to verify on-chain
  let status: "confirmed" | "pending" | "failed" = "pending";
  let confirmedAt: Date | null = null;

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (receipt && receipt.status === 1) {
      // Verify tx details
      const tx = await provider.getTransaction(txHash);
      const expectedWei = ethers.utils.parseEther(game.entryFee);
      const actualTo = tx.to?.toLowerCase() ?? "";
      const actualValue = tx.value;

      if (
        actualTo === treasury &&
        actualValue.gte(expectedWei) &&
        tx.from?.toLowerCase() === addr
      ) {
        status = "confirmed";
        confirmedAt = new Date(receipt.blockNumber ? Date.now() : Date.now());
      } else {
        status = "failed";
      }
    }
  } catch {
    // RPC unavailable — record as pending; can be reconciled later
    status = "pending";
  }

  const [payment] = await db
    .insert(entryPaymentsTable)
    .values({
      walletAddress: addr,
      gameId,
      amount: amount.toString(),
      txHash,
      treasuryWallet: treasury,
      status,
      confirmedAt: confirmedAt ?? undefined,
    })
    .returning();

  res.json({ id: payment.id, status: payment.status });
});

// ── GET /payments/verify/:address/:gameId ─────────────────────────────────────
// Check whether a wallet has a confirmed entry payment for a game (last 24h).
router.get("/payments/verify/:address/:gameId", async (req, res) => {
  const { address, gameId } = req.params;
  const addr = address.toLowerCase();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const payment = await db.query.entryPaymentsTable.findFirst({
    where: and(
      eq(entryPaymentsTable.walletAddress, addr),
      eq(entryPaymentsTable.gameId, gameId),
      eq(entryPaymentsTable.status, "confirmed"),
    ),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  const valid =
    payment !== undefined && payment.createdAt >= since;

  res.json({ valid, payment: valid ? payment : null });
});

export default router;
