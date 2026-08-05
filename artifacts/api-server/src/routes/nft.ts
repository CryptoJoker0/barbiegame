import { Router } from "express";
import { nftVerifier } from "../services/nft-verification/index.js";

const router = Router();

/**
 * GET /nft/verify/:address
 *
 * Verifies whether a wallet owns at least one AFRICA NFT.
 * The active verification provider is controlled by NFT_VERIFIER_PROVIDER:
 *   "database"   (default) — looks up the africa_nft_ownership table
 *   "blockchain"           — calls balanceOf on the deployed ERC-721 contract
 */
router.get("/nft/verify/:address", async (req, res) => {
  const { address } = req.params;

  if (!address || typeof address !== "string") {
    res.status(400).json({ error: "Invalid wallet address" });
    return;
  }

  try {
    const result = await nftVerifier.verify(address);
    res.json({
      address: address.toLowerCase(),
      hasNft: result.hasNft,
      nftCount: result.nftCount,
      verificationMethod: result.verificationMethod,
    });
  } catch (err: any) {
    res.status(502).json({
      error: "NFT verification failed",
      details: err.message,
    });
  }
});

export default router;
