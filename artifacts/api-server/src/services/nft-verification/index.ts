export type { NftVerifier, NftVerificationResult } from "./types.js";

import { DatabaseNftVerifier } from "./database-verifier.js";
import { BlockchainNftVerifier } from "./blockchain-verifier.js";
import type { NftVerifier } from "./types.js";

/**
 * Returns the active NFT verifier.
 *
 * Controlled by NFT_VERIFIER_PROVIDER env var:
 *   "database"   (default) — uses the africa_nft_ownership table
 *   "blockchain"           — uses the deployed ERC-721 contract
 */
export function createNftVerifier(): NftVerifier {
  const provider = process.env["NFT_VERIFIER_PROVIDER"] ?? "database";

  if (provider === "blockchain") {
    return new BlockchainNftVerifier();
  }

  return new DatabaseNftVerifier();
}

/** Singleton used by route handlers. */
export const nftVerifier = createNftVerifier();
