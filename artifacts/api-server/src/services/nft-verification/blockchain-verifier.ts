import { ethers } from "ethers";
import type { NftVerifier, NftVerificationResult } from "./types.js";

const NFT_ABI = ["function balanceOf(address owner) view returns (uint256)"];

/**
 * Verifies NFT ownership by calling balanceOf on the deployed ERC-721 contract.
 *
 * Activate this provider by setting:
 *   NFT_VERIFIER_PROVIDER=blockchain
 *   NFT_CONTRACT_ADDRESS=0x<address>
 *   NFT_RPC_URL=https://rpc.mainnet.x1.xyz   (optional, has default)
 */
export class BlockchainNftVerifier implements NftVerifier {
  private contractAddress: string;
  private rpcUrl: string;

  constructor() {
    this.contractAddress =
      process.env["NFT_CONTRACT_ADDRESS"] ??
      process.env["VITE_NFT_CONTRACT_ADDRESS"] ??
      "0x0000000000000000000000000000000000000000";

    this.rpcUrl =
      process.env["NFT_RPC_URL"] ?? "https://rpc.mainnet.x1.xyz";
  }

  async verify(walletAddress: string): Promise<NftVerificationResult> {
    if (
      this.contractAddress ===
      "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error(
        "BlockchainNftVerifier: NFT_CONTRACT_ADDRESS is not configured.",
      );
    }

    const provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
    const contract = new ethers.Contract(
      this.contractAddress,
      NFT_ABI,
      provider,
    );

    const balance: ethers.BigNumber = await contract.balanceOf(walletAddress);
    const nftCount = balance.toNumber();

    return {
      hasNft: nftCount > 0,
      nftCount,
      verificationMethod: "blockchain",
    };
  }
}
