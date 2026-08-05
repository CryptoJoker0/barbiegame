import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { NFT_CONFIG, X1_CHAIN_PARAMS } from '@/config/nft.config';

// ─── Types ────────────────────────────────────────────────────────────────────
export type WalletId = 'phantom' | 'backpack' | 'wewallet' | 'x1web' | 'x1mobile'; // wewallet/x1mobile kept for type compat but not shown in UI

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
  /** Returns the raw injected provider for signing transactions */
  getRawProvider: () => any | null;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const AUTO_CONNECT_KEY = 'barbie_wallet_id';
const X1_CHAIN_ID_HEX = X1_CHAIN_PARAMS.chainId; // e.g. "0x31ca5"

// ─── Window type augmentation ─────────────────────────────────────────────────
declare global {
  interface Window {
    ethereum?: any;
    phantom?: { ethereum?: any };
    backpack?: { ethereum?: any };
    we?: { ethereum?: any };
    weWallet?: any;
    okxwallet?: { ethereum?: any };
    providers?: any[];
  }
}

// ─── Provider detection ───────────────────────────────────────────────────────
/**
 * Returns the EIP-1193 provider for the requested wallet, or null if not
 * installed. Never falls back to another wallet's provider to avoid silent
 * misidentification.
 */
function getProvider(id: WalletId): any | null {
  switch (id) {
    case 'phantom':
      // Prefer Phantom's own namespace; fall back to window.ethereum only if
      // it was injected by Phantom itself (isPhantom flag).
      return window.phantom?.ethereum ?? (window.ethereum?.isPhantom ? window.ethereum : null);

    case 'backpack':
      return window.backpack?.ethereum ?? (window.ethereum?.isBackpack ? window.ethereum : null);

    case 'wewallet':
      return window.we?.ethereum ?? window.weWallet ?? (window.ethereum?.isWEWallet ? window.ethereum : null);

    case 'x1web':
      // X1 Web Wallet injects into window.ethereum if it is the active wallet.
      return window.ethereum ?? null;

    default:
      return null;
  }
}

// ─── Chain helpers ────────────────────────────────────────────────────────────
/**
 * Switches the wallet to X1 Blockchain, adding the chain params if the wallet
 * doesn't know about it yet. Handles all known wallet error codes.
 */
async function switchToX1(provider: any): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: X1_CHAIN_ID_HEX }],
    });
  } catch (switchErr: any) {
    const code = switchErr?.code;

    // 4902  = chain not added (EIP-3085 standard)
    // -32603 = internal JSON-RPC error (some wallets use this for "unknown chain")
    // -32000 = generic server error (Backpack and others for unknown chain)
    if (code === 4902 || code === -32603 || code === -32000) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [X1_CHAIN_PARAMS],
        });
      } catch (addErr: any) {
        if (addErr?.code === 4001) {
          throw new Error('Network switch cancelled. Please add X1 Blockchain to your wallet.');
        }
        throw addErr;
      }
    } else if (code === 4001) {
      throw new Error('Network switch cancelled by user.');
    } else {
      throw switchErr;
    }
  }
}

// ─── NFT check ────────────────────────────────────────────────────────────────
async function checkNftOwnership(address: string, provider: any): Promise<boolean> {
  // Zero-address contract means NFT check is not yet configured — treat as
  // not-owned so the UI correctly shows the "you need an NFT" message.
  if (NFT_CONFIG.contractAddress === '0x0000000000000000000000000000000000000000') {
    return false;
  }
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

  /**
   * Monotonically increasing generation counter.
   * Incremented on every connect attempt, account change, and disconnect.
   * Every async NFT check captures the generation at start and discards its
   * result if the generation has advanced by the time it resolves, preventing
   * stale async results from overwriting current authorization state.
   */
  const nftGenRef = useRef(0);

  // ── Disconnect ──────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    nftGenRef.current += 1;          // invalidate any in-flight NFT checks
    setWalletAddress(null);
    setWalletId(null);
    setHasNft(false);
    setIsConnecting(false);
    setIsCheckingNft(false);
    setError(null);
    providerRef.current = null;
    try { localStorage.removeItem(AUTO_CONNECT_KEY); } catch { /* ignore */ }
  }, []);

  // ── Core connect logic ─────────────────────────────────────────────────────
  /**
   * @param id        Which wallet to connect.
   * @param silent    If true, performs a fully read-only restore (eth_accounts +
   *                  eth_chainId only, no prompts, no network switching, no tab
   *                  navigation). Used for auto-reconnect on mount.
   */
  const connect = useCallback(async (id: WalletId, silent = false) => {
    // ── Special cases: redirect-only wallets ──
    if (id === 'x1mobile') {
      if (silent) return; // never navigate during silent restore
      window.open('https://testflight.apple.com/join/sxpTfavs', '_blank');
      return;
    }
    if (id === 'x1web') {
      const p = getProvider('x1web');
      if (!p) {
        if (silent) return; // never open tabs during silent restore
        window.open('https://wallet.x1blockchain.net', '_blank');
        return;
      }
    }

    const provider = getProvider(id);
    if (!provider) {
      if (silent) return; // wallet not installed — silently skip autoConnect
      const installUrls: Record<WalletId, string> = {
        phantom:  'https://phantom.app',
        backpack: 'https://backpack.app',
        wewallet: 'https://wewallet.io',
        x1web:    'https://wallet.x1blockchain.net',
        x1mobile: 'https://testflight.apple.com/join/sxpTfavs',
      };
      window.open(installUrls[id], '_blank');
      return;
    }

    // Capture generation before any async work so we can detect stale results.
    nftGenRef.current += 1;
    const myGen = nftGenRef.current;

    setIsConnecting(true);
    setError(null);

    try {
      // Read-only account query — eth_accounts never shows a popup
      const accounts: string[] = await provider.request({ method: 'eth_accounts' });

      if (!accounts.length) {
        if (silent) return; // not yet authorised — nothing to restore
        // Explicit connect: prompt for permission
        const prompted: string[] = await provider.request({ method: 'eth_requestAccounts' });
        if (!prompted.length) {
          throw new Error('No account selected. Please unlock your wallet and try again.');
        }
        accounts.push(...prompted);
      }

      const address = accounts[0];

      if (silent) {
        // ── Silent restore: read-only checks only ──
        // Verify the wallet is already on X1 without switching chains.
        const currentChain: string = await provider.request({ method: 'eth_chainId' });
        if (currentChain.toLowerCase() !== X1_CHAIN_ID_HEX.toLowerCase()) {
          // Wrong chain — don't restore; user must reconnect manually.
          try { localStorage.removeItem(AUTO_CONNECT_KEY); } catch { /* ignore */ }
          return;
        }
      } else {
        // ── Explicit connect: switch to X1 if needed (may show wallet prompt) ──
        await switchToX1(provider);
      }

      // Check NFT ownership
      setIsCheckingNft(true);
      const nft = await checkNftOwnership(address, provider);

      // ── Post-check account verification (before any commit) ──────────────────
      // The accountsChanged listener is not yet registered at this point, so an
      // account switch that occurred while the NFT RPC was in flight would not
      // have advanced nftGenRef. Re-read the current accounts and reject if the
      // address changed, ensuring we never commit authorization for account A
      // while account B is active in the wallet.
      if (nftGenRef.current !== myGen) return; // disconnect/chainChanged raced us
      const liveAccounts: string[] = await provider.request({ method: 'eth_accounts' });
      if (nftGenRef.current !== myGen) return; // check again after the await
      const liveAddress = liveAccounts[0]?.toLowerCase() ?? '';
      if (liveAddress !== address.toLowerCase()) {
        // Account changed during NFT verification — silently abort
        if (silent) { try { localStorage.removeItem(AUTO_CONNECT_KEY); } catch { /* ignore */ } }
        return;
      }

      // Commit state (address confirmed still matches)
      providerRef.current = provider;
      setWalletAddress(address);
      setWalletId(id);
      setHasNft(nft);
      if (!silent && !nft) setError('You need an AFRICA X1 NFT to enter the game.');

      // Persist wallet choice for auto-reconnect on next page load
      try { localStorage.setItem(AUTO_CONNECT_KEY, id); } catch { /* ignore */ }

    } catch (err: any) {
      if (err?.code === 4001 || err?.message?.includes('cancelled')) {
        if (!silent) setError('Connection cancelled.');
      } else {
        if (!silent) setError(err?.message ?? 'Wallet connection failed.');
      }
      // Discard persisted wallet on silent restore errors so we don't loop
      if (silent) { try { localStorage.removeItem(AUTO_CONNECT_KEY); } catch { /* ignore */ } }
      // Clean up on failure
      providerRef.current = null;
    } finally {
      // Only clear loading flags if this generation is still the current one
      if (nftGenRef.current === myGen) {
        setIsConnecting(false);
        setIsCheckingNft(false);
      }
    }
  }, []);

  // ── Auto-connect on mount ──────────────────────────────────────────────────
  // Silently reconnects to the last-used wallet using eth_accounts (no popup).
  useEffect(() => {
    let cancelled = false;
    const savedId = (() => {
      try { return localStorage.getItem(AUTO_CONNECT_KEY) as WalletId | null; }
      catch { return null; }
    })();
    if (!savedId) return;

    // Give the wallet extension a moment to inject its provider
    const timer = setTimeout(() => {
      if (!cancelled) connect(savedId, /* silent */ true);
    }, 200);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [connect]);

  // ── accountsChanged listener ───────────────────────────────────────────────
  // Re-registers whenever walletAddress changes (i.e. after connect/disconnect).
  // Security: immediately clears NFT authorization on every account switch,
  // then re-verifies the new account. Uses nftGenRef to discard results from
  // checks that were superseded by a later account change or disconnect.
  useEffect(() => {
    const p = providerRef.current;
    if (!p) return;

    const handler = (accounts: string[]) => {
      if (!accounts.length) {
        disconnect();
        return;
      }

      const newAddress = accounts[0];

      // Advance the generation — any in-flight check for the previous account
      // will see a mismatched token and discard its result.
      nftGenRef.current += 1;
      const myGen = nftGenRef.current;

      // Immediately revoke NFT access; the new account starts unauthorized
      // until its own ownership check completes successfully.
      setHasNft(false);
      setIsCheckingNft(true);
      setError(null);
      setWalletAddress(newAddress);

      // Re-verify NFT ownership for the new account asynchronously.
      checkNftOwnership(newAddress, p)
        .then(nft => {
          // Discard if another account change or disconnect has since occurred
          if (nftGenRef.current !== myGen) return;
          setHasNft(nft);
          if (!nft) setError('You need an AFRICA X1 NFT to enter the game.');
        })
        .catch(() => {
          if (nftGenRef.current !== myGen) return;
          setHasNft(false);
          setError('Could not verify NFT ownership for the new account.');
        })
        .finally(() => {
          if (nftGenRef.current === myGen) setIsCheckingNft(false);
        });
    };

    p.on?.('accountsChanged', handler);
    return () => p.removeListener?.('accountsChanged', handler);
  }, [walletAddress, disconnect]);

  // ── chainChanged listener ──────────────────────────────────────────────────
  // Disconnects (and prompts re-connect) if the user switches away from X1.
  useEffect(() => {
    const p = providerRef.current;
    if (!p) return;

    const handler = (newChainId: string) => {
      // Normalize both to lowercase hex for comparison
      const normalised = newChainId.toLowerCase();
      if (normalised !== X1_CHAIN_ID_HEX.toLowerCase()) {
        disconnect();
        setError(`Please switch your wallet back to X1 Blockchain (chain ${NFT_CONFIG.chainId}) to continue.`);
      }
    };

    p.on?.('chainChanged', handler);
    return () => p.removeListener?.('chainChanged', handler);
  }, [walletAddress, disconnect]);

  return (
    <WalletContext.Provider value={{
      walletAddress,
      walletId,
      isConnected: !!walletAddress,
      hasNft,
      isCheckingNft,
      isConnecting,
      connect: (id: WalletId) => connect(id, false),
      disconnect,
      error,
      clearError: () => setError(null),
      getRawProvider: () => providerRef.current,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
