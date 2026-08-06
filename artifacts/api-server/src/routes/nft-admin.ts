import { Router } from "express";
import { db } from "@workspace/db";
import { africaNftOwnership } from "@workspace/db";
import { sql, desc, ilike, or } from "drizzle-orm";

const router = Router();

// ── GET /admin/nft/stats ──────────────────────────────────────────────────────
router.get("/admin/nft/stats", async (_req, res) => {
  const [totals] = await db
    .select({
      totalWallets: sql<number>`COUNT(DISTINCT ${africaNftOwnership.walletAddress})`,
      totalNfts: sql<number>`SUM(${africaNftOwnership.nftCount})`,
    })
    .from(africaNftOwnership);

  const recentlyAdded = await db
    .select()
    .from(africaNftOwnership)
    .orderBy(desc(africaNftOwnership.createdAt))
    .limit(5);

  res.json({
    totalWallets: Number(totals.totalWallets) || 0,
    totalNfts: Number(totals.totalNfts) || 0,
    recentlyAdded,
  });
});

// ── GET /admin/nft/holders ────────────────────────────────────────────────────
router.get("/admin/nft/holders", async (req, res) => {
  const search = (req.query.search as string | undefined)?.trim() ?? "";
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  const where = search
    ? or(
        ilike(africaNftOwnership.walletAddress, `%${search}%`),
        ilike(africaNftOwnership.tokenId, `%${search}%`),
        ilike(africaNftOwnership.collection, `%${search}%`)
      )
    : undefined;

  const [countRow] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(africaNftOwnership)
    .where(where);

  const holders = await db
    .select()
    .from(africaNftOwnership)
    .where(where)
    .orderBy(desc(africaNftOwnership.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    holders,
    total: Number(countRow.count) || 0,
    page,
    limit,
  });
});

// ── POST /admin/nft/holders ───────────────────────────────────────────────────
router.post("/admin/nft/holders", async (req, res) => {
  const { walletAddress, tokenId, collection, nftCount } = req.body;

  if (!walletAddress || !tokenId) {
    return res.status(400).json({ error: "walletAddress and tokenId are required" });
  }

  const wallet = walletAddress.trim().toLowerCase();
  const token = tokenId.trim();
  const col = (collection ?? "AFRICA_NFT").trim();
  const count = Number(nftCount) || 1;
  const id = `${wallet}:${token}`;

  // Upsert — if the same wallet+token exists, update nftCount
  const [record] = await db
    .insert(africaNftOwnership)
    .values({ id, walletAddress: wallet, tokenId: token, collection: col, nftCount: count })
    .onConflictDoUpdate({
      target: africaNftOwnership.id,
      set: {
        nftCount: count,
        collection: col,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  res.status(201).json(record);
});

// ── PATCH /admin/nft/holders/:id ──────────────────────────────────────────────
router.patch("/admin/nft/holders/:id", async (req, res) => {
  const rawId = decodeURIComponent(req.params.id);
  const { tokenId, collection, nftCount } = req.body;

  const update: Record<string, any> = { updatedAt: sql`now()` };
  if (tokenId !== undefined) update.tokenId = tokenId.trim();
  if (collection !== undefined) update.collection = collection.trim();
  if (nftCount !== undefined) update.nftCount = Number(nftCount);

  if (Object.keys(update).length === 1) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  // If tokenId changes we need to rekey the record (id = wallet:tokenId)
  const existing = await db.query.africaNftOwnership.findFirst({
    where: (t, { eq }) => eq(t.id, rawId),
  });

  if (!existing) {
    return res.status(404).json({ error: "Record not found" });
  }

  const newTokenId = update.tokenId ?? existing.tokenId;
  const newId = `${existing.walletAddress}:${newTokenId}`;

  if (newId !== rawId) {
    // Delete old + insert new (id is PK, can't update it in place easily)
    await db.delete(africaNftOwnership).where(sql`${africaNftOwnership.id} = ${rawId}`);
    const [record] = await db
      .insert(africaNftOwnership)
      .values({ ...existing, id: newId, tokenId: newTokenId, collection: update.collection ?? existing.collection, nftCount: update.nftCount ?? existing.nftCount })
      .returning();
    return res.json(record);
  }

  const [record] = await db
    .update(africaNftOwnership)
    .set(update)
    .where(sql`${africaNftOwnership.id} = ${rawId}`)
    .returning();

  res.json(record);
});

// ── DELETE /admin/nft/holders/:id ────────────────────────────────────────────
router.delete("/admin/nft/holders/:id", async (req, res) => {
  const rawId = decodeURIComponent(req.params.id);
  await db.delete(africaNftOwnership).where(sql`${africaNftOwnership.id} = ${rawId}`);
  res.json({ success: true });
});

export default router;
