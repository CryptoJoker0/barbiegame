/**
 * BARBIEFUN-GAME — NFT Configuration
 *
 * Update the values below to configure the AFRICA NFT contract.
 * No other code changes are needed after updating this file.
 */
export const NFT_CONFIG = {
  /** AFRICA NFT ERC-721 contract address on X1 Blockchain.
   *  Set VITE_NFT_CONTRACT_ADDRESS env var to override at build time. */
  contractAddress: (
    import.meta.env.VITE_NFT_CONTRACT_ADDRESS ||
    '0x0000000000000000000000000000000000000000'
  ) as string,

  /** X1 Blockchain Chain ID */
  chainId: 204005,

  /** X1 Blockchain primary RPC URL (user-specified mainnet endpoint) */
  rpcUrl: 'https://rpc.mainnet.x1.xyz',

  /** Fallback RPC URLs tried in order if the primary is unavailable */
  rpcFallbackUrls: [
    'https://rpc.mainnet.x1.xyz',
    'https://x1rpc.infrafc.org',
    'https://rpc.x1blockchain.net',
  ] as string[],

  /** Human-readable network name */
  networkName: 'X1 Blockchain',

  /** NFT collection name (for display purposes) */
  collectionName: 'AFRICA NFT',

  /** Minimum NFT balance required to play */
  minBalance: 1,
} as const;

/** X1 Blockchain network params for wallet_addEthereumChain */
export const X1_CHAIN_PARAMS = {
  chainId: `0x${NFT_CONFIG.chainId.toString(16)}`,
  chainName: NFT_CONFIG.networkName,
  nativeCurrency: { name: 'XEN', symbol: 'XEN', decimals: 18 },
  // wallet_addEthereumChain accepts multiple RPC URLs; the wallet picks the first one it can reach
  rpcUrls: NFT_CONFIG.rpcFallbackUrls as unknown as string[],
  blockExplorerUrls: ['https://explorer.x1blockchain.net'],
};

export const ADMIN_WALLET =
  import.meta.env.VITE_ADMIN_WALLET_ADDRESS?.toLowerCase() ?? '';
