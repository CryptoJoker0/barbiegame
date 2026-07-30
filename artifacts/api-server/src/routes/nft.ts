import { Router } from "express";
import { ethers } from "ethers";

const router = Router();

const NFT_CONTRACT = process.env.NFT_CONTRACT_ADDRESS ?? "0x0000000000000000000000000000000000000000";
const RPC_URL = process.env.NFT_RPC_URL ?? "https://x1rpc.infrafc.org";

const NFT_ABI = ["function balanceOf(address owner) view returns (uint256)"];

// GET /nft/verify/:address
router.get("/nft/verify/:address", async (req, res) => {
  const { address } = req.params;

  // Demo mode — contract not yet set
  if (NFT_CONTRACT === "0x0000000000000000000000000000000000000000") {
    res.json({ address, hasNft: true, balance: 1, demo: true });
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
