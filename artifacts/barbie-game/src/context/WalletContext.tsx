import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { NFT_CONFIG, X1_CHAIN_PARAMS } from '@/config/nft.config';

// ─── Types ────────────────────────────────────────────────────────────────────
export type WalletId = 'phantom' | 'backpack' | 'metamask' | 'x1web' | 'x1mobile';

interface WalletContextValue {
  walletAddress: string | null;
  walletId: WalletId | null;
  isConnected: boolean;
  hasNft: boolean;
  isCheckingNft: boolean;
  isConnecting: boolean;
  connect: (walletId: WalletId) => Promise<void>;
  disconnect: () => void;
  error: string | null;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    ethereum?: any;
    phantom?: { ethereum?: any };
    backpack?: { ethereum?: any };
  }
}

function getProvider(id: WalletId): any | null {
  switch (id) {
    case 'phantom':
      return window.phantom?.ethereum ?? (window.ethereum?.isPhantom ? window.ethereum : null);
    case 'backpack':
      return window.backpack?.ethereum ?? (window.ethereum?.isBackpack ? window.ethereum : null);
    case 'metamask':
      return window.ethereum?.isMetaMask ? window.ethereum : null;
    case 'x1web':
      return window.ethereum ?? null;
    default:
      return null;
  }
}

async function switchToX1(provider: any) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: X1_CHAIN_PARAMS.chainId }],
    });
  } catch (err: any) {
    if (err.code === 4902 || err.code === -32603) {
      await provider.request({ method: 'wallet_addEthereumChain', params: [X1_CHAIN_PARAMS] });
    } else {
      throw err;
    }
  }
}

async function checkNftOwnership(address: string, provider: any): Promise<boolean> {
  const web3 = new ethers.providers.Web3Provider(provider);
  const contract = new ethers.Contract(
    NFT_CONFIG.contractAddress,
    ['function balanceOf(address owner) view returns (uint256)'],
    web3,
  );
  const balance = await contract.balanceOf(address);
  return balance.gt(0);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<WalletId | null>(null);
  const [hasNft, setHasNft] = useState(false);
  const [isCheckingNft, setIsCheckingNft] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<any>(null);

  const disconnect = useCallback(() => {
    setWalletAddress(null);
    setWalletId(null);
    setHasNft(false);
    setIsConnecting(false);
    setIsCheckingNft(false);
    setError(null);
    providerRef.current = null;
  }, []);

  const connect = useCallback(async (id: WalletId) => {
    if (id === 'x1mobile') {
      window.open('https://testflight.apple.com/join/sxpTfavs', '_blank');
      return;
    }
    if (id === 'x1web') {
      // Try injected provider first, else open web wallet
      const provider = getProvider('x1web');
      if (!provider) {
        window.open('https://wallet.x1blockchain.net', '_blank');
        return;
      }
    }

    const provider = getProvider(id);
    if (!provider) {
      const installUrls: Record<WalletId, string> = {
        phantom: 'https://phantom.app',
        backpack: 'https://backpack.app',
        metamask: 'https://metamask.io',
        x1web: 'https://wallet.x1blockchain.net',
        x1mobile: 'https://testflight.apple.com/join/sxpTfavs',
      };
      window.open(installUrls[id], '_blank');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
      if (!accounts.length) throw new Error('No account selected.');
      const address = accounts[0];

      await switchToX1(provider);

      setIsCheckingNft(true);
      const nft = await checkNftOwnership(address, provider);

      providerRef.current = provider;
      setWalletAddress(address);
      setWalletId(id);
      setHasNft(nft);
      if (!nft) setError('You need an AFRICA NFT to enter the game.');
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Connection cancelled.');
      } else {
        setError(err.message ?? 'Wallet connection failed.');
      }
    } finally {
      setIsConnecting(false);
      setIsCheckingNft(false);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    const p = providerRef.current;
    if (!p) return;
    const handler = (accounts: string[]) => {
      if (!accounts.length) disconnect();
      else setWalletAddress(accounts[0]);
    };
    p.on?.('accountsChanged', handler);
    return () => p.removeListener?.('accountsChanged', handler);
  }, [walletAddress, disconnect]);

  return (
    <WalletContext.Provider value={{
      walletAddress,
      walletId,
      isConnected: !!walletAddress,
      hasNft,
      isCheckingNft,
      isConnecting,
      connect,
      disconnect,
      error,
      clearError: () => setError(null),
    }}>
      {children}
    </WalletContext.Provider>
  );
}
