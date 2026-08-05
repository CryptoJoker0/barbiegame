import { db } from "@workspace/db";
import { africaNftOwnership } from "@workspace/db/schema";
import { sql } from "drizzle-orm";
import type { NftVerifier, NftVerificationResult } from "./types.js";

/**
 * Verifies NFT ownership by querying the africa_nft_ownership table.
 * Sums nft_count for all rows matching the wallet address.
 */
export class DatabaseNftVerifier implements NftVerifier {
  async verify(walletAddress: string): Promise<NftVerificationResult> {
    const address = walletAddress.toLowerCase();

    const rows = await db
      .select({ total: sql<number>`coalesce(sum(${africaNftOwnership.nftCount}), 0)` })
      .from(africaNftOwnership)
      .where(sql`lower(${africaNftOwnership.walletAddress}) = ${address}`);

    const nftCount = Number(rows[0]?.total ?? 0);

    return {
      hasNft: nftCount > 0,
      nftCount,
      verificationMethod: "database",
    };
  }
}
