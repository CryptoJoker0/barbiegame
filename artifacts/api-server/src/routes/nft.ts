import { Router } from "express";
import { ethers } from "ethers";

const router = Router();

// Reads VITE_NFT_CONTRACT_ADDRESS as fallback so both client and server
// share one env var when only the VITE_ prefixed var is set.
const NFT_CONTRACT =
  process.env.NFT_CONTRACT_ADDRESS ??
  process.env.VITE_NFT_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000";
const RPC_URL = process.env.NFT_RPC_URL ?? "https://x1rpc.infrafc.org";

const NFT_ABI = ["function balanceOf(address owner) view returns (uint256)"];

// GET /nft/verify/:address
router.get("/nft/verify/:address", async (req, res) => {
  const { address } = req.params;

  if (NFT_CONTRACT === "0x0000000000000000000000000000000000000000") {
    res.status(503).json({ error: "NFT_CONTRACT_ADDRESS not configured on server" });
    return;
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT, NFT_ABI, provider);
    const balance: ethers.BigNumber = await contract.balanceOf(address);
    res.json({ address, hasNft: balance.gt(0), balance: balance.toNumber() });
  } catch (err: any) {
    res.status(502).json({ error: "NFT verification failed", details: err.message });
  }
});

export default router;
