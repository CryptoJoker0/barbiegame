/**
 * Pluggable NFT verification interface.
 *
 * Two providers exist:
 *   - "database"   (default) — queries the africa_nft_ownership table.
 *   - "blockchain" (future)  — calls balanceOf on the deployed ERC-721 contract.
 *
 * Switch providers by setting  NFT_VERIFIER_PROVIDER=blockchain  in the
 * environment.  The UI and game logic never need to change.
 */
export interface NftVerificationResult {
  hasNft: boolean;
  nftCount: number;
  verificationMethod: "database" | "blockchain";
}

export interface NftVerifier {
  verify(walletAddress: string): Promise<NftVerificationResult>;
}
