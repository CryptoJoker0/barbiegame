/**
 * BARBIEFUN-GAME — NFT Configuration
 *
 * Update the values below to configure the AFRICA NFT contract.
 * No other code changes are needed after updating this file.
 */
export const NFT_CONFIG = {
  /** AFRICA NFT ERC-721 contract address on X1 Blockchain */
  contractAddress: '0x0000000000000000000000000000000000000000',

  /** X1 Blockchain Chain ID */
  chainId: 204005,

  /** X1 Blockchain RPC URL */
  rpcUrl: 'https://x1rpc.infrafc.org',

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
  rpcUrls: [NFT_CONFIG.rpcUrl],
  blockExplorerUrls: ['https://explorer.x1blockchain.net'],
} as const;

export const ADMIN_WALLET =
  import.meta.env.VITE_ADMIN_WALLET_ADDRESS?.toLowerCase() ?? '';
