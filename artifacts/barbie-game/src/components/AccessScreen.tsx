import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import barbieLogo from '@/assets/barbie-logo.png';

// ─── X1 Blockchain Network Config ─────────────────────────────────────────────
const X1_CHAIN_ID = 204005; // X1 Mainnet — update if testnet (202212)
const X1_CHAIN = {
  chainId: `0x${X1_CHAIN_ID.toString(16)}`,
  chainName: 'X1 Blockchain',
  nativeCurrency: { name: 'XEN', symbol: 'XEN', decimals: 18 },
  rpcUrls: ['https://x1rpc.infrafc.org'],
  blockExplorerUrls: ['https://explorer.x1blockchain.net'],
};

// ─── AFRICA NFT Contract ───────────────────────────────────────────────────────
// Replace with the actual AFRICA NFT contract address on X1
const AFRICA_NFT_CONTRACT = '0x0000000000000000000000000000000000000000';

// ─── Type declarations ─────────────────────────────────────────────────────────
declare global {
  interface Window {
    ethereum?: any;
    phantom?: { ethereum?: any };
    backpack?: { ethereum?: any };
  }
}

type WalletId = 'phantom' | 'backpack' | 'x1web' | 'x1mobile';
type Status = 'idle' | 'connecting' | 'switching' | 'checking' | 'granted' | 'denied' | 'error';

interface Wallet {
  id: WalletId;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: 'connect' | 'open' | 'download';
  url?: string;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const PhantomIcon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-10 h-10">
    <rect width="128" height="128" rx="26" fill="#AB9FF2"/>
    <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8544 41.3056 14.4224 64.0944C13.9744 87.9732 33.8516 108 57.9492 108H63.2752C85.1332 108 113.6 89.2118 117.984 67.9756C118.484 65.4044 116.48 64.9142 110.584 64.9142Z" fill="white"/>
    <ellipse cx="47.5" cy="66.5" rx="6.5" ry="7.5" fill="#AB9FF2"/>
    <ellipse cx="73.5" cy="66.5" rx="6.5" ry="7.5" fill="#AB9FF2"/>
  </svg>
);

const BackpackIcon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-10 h-10">
    <rect width="128" height="128" rx="26" fill="#E33E3F"/>
    <path d="M64 18C48.536 18 36 30.536 36 46V52H30C25.582 52 22 55.582 22 60V98C22 102.418 25.582 106 30 106H98C102.418 106 106 102.418 106 98V60C106 55.582 102.418 52 98 52H92V46C92 30.536 79.464 18 64 18ZM64 28C74.166 28 82.5 36.086 82.5 46V52H45.5V46C45.5 36.086 53.834 28 64 28ZM58 72H70V84H58V72Z" fill="white"/>
  </svg>
);

const X1WebIcon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-10 h-10">
    <rect width="128" height="128" rx="26" fill="#0F0F23"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#ff1493" fontSize="44" fontWeight="900" fontFamily="monospace">X1</text>
    <rect x="24" y="85" width="80" height="3" rx="1.5" fill="#ff1493"/>
  </svg>
);

const TestFlightIcon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-10 h-10">
    <rect width="128" height="128" rx="26" fill="#0071E3"/>
    <path d="M64 22L96 90H32L64 22Z" fill="white" opacity="0.9"/>
    <circle cx="64" cy="88" r="14" fill="white"/>
    <circle cx="64" cy="88" r="7" fill="#0071E3"/>
  </svg>
);

// ─── Wallet Definitions ───────────────────────────────────────────────────────
const WALLETS: Wallet[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'EVM wallet — browser extension',
    icon: <PhantomIcon />,
    action: 'connect',
  },
  {
    id: 'backpack',
    name: 'Backpack',
    description: 'EVM wallet — browser extension',
    icon: <BackpackIcon />,
    action: 'connect',
  },
  {
    id: 'x1web',
    name: 'X1 Web Wallet',
    description: 'Official X1 Blockchain web wallet',
    icon: <X1WebIcon />,
    action: 'open',
    url: 'https://wallet.x1blockchain.net',
  },
  {
    id: 'x1mobile',
    name: 'X1 Mobile App',
    description: 'iOS app via TestFlight',
    icon: <TestFlightIcon />,
    action: 'download',
    url: 'https://testflight.apple.com/join/sxpTfavs',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isPhantomInstalled() {
  return !!(window.phantom?.ethereum || (window.ethereum?.isPhantom && window.ethereum));
}

function isBackpackInstalled() {
  return !!(window.backpack?.ethereum || window.ethereum?.isBackpack);
}

function getProvider(walletId: WalletId): any | null {
  switch (walletId) {
    case 'phantom':
      return window.phantom?.ethereum || (window.ethereum?.isPhantom ? window.ethereum : null);
    case 'backpack':
      return window.backpack?.ethereum || (window.ethereum?.isBackpack ? window.ethereum : null);
    case 'x1web':
      // X1 Web Wallet injects window.ethereum when extension is active
      return window.ethereum || null;
    default:
      return null;
  }
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface AccessScreenProps {
  onAccessGranted: (address: string, walletId: WalletId) => void;
}

export default function AccessScreen({ onAccessGranted }: AccessScreenProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [activeWallet, setActiveWallet] = useState<WalletId | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Track which wallets are installed
  const [phantomInstalled, setPhantomInstalled] = useState(false);
  const [backpackInstalled, setBackpackInstalled] = useState(false);

  useEffect(() => {
    setPhantomInstalled(isPhantomInstalled());
    setBackpackInstalled(isBackpackInstalled());
  }, []);

  const resetState = () => {
    setStatus('idle');
    setActiveWallet(null);
    setWalletAddress(null);
    setErrorMessage(null);
  };

  async function switchToX1(provider: any) {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: X1_CHAIN.chainId }],
      });
    } catch (err: any) {
      // Chain not added yet — add it
      if (err.code === 4902 || err.code === -32603) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [X1_CHAIN],
        });
      } else {
        throw err;
      }
    }
  }

  async function verifyNFT(address: string, provider: any) {
    setStatus('checking');

    // Demo / unconfigured mode
    if (AFRICA_NFT_CONTRACT === '0x0000000000000000000000000000000000000000') {
      setTimeout(() => {
        setStatus('granted');
        setTimeout(() => onAccessGranted(address, activeWallet!), 2000);
      }, 1200);
      return;
    }

    try {
      const web3Provider = new ethers.providers.Web3Provider(provider);
      const contract = new ethers.Contract(
        AFRICA_NFT_CONTRACT,
        ['function balanceOf(address owner) view returns (uint256)'],
        web3Provider,
      );
      const balance = await contract.balanceOf(address);

      if (balance.gt(0)) {
        setStatus('granted');
        setTimeout(() => onAccessGranted(address, activeWallet!), 2000);
      } else {
        setStatus('denied');
        setErrorMessage('You need an AFRICA NFT to enter the lucky kingdom.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Failed to verify NFT ownership on X1 Blockchain.');
    }
  }

  async function connectWallet(walletId: WalletId) {
    const provider = getProvider(walletId);

    if (!provider) {
      // Wallet not installed — redirect to install
      const wallet = WALLETS.find(w => w.id === walletId)!;
      const installUrls: Record<WalletId, string> = {
        phantom: 'https://phantom.app',
        backpack: 'https://backpack.app',
        x1web: 'https://wallet.x1blockchain.net',
        x1mobile: 'https://testflight.apple.com/join/sxpTfavs',
      };
      window.open(installUrls[walletId], '_blank');
      return;
    }

    setActiveWallet(walletId);
    setStatus('connecting');
    setErrorMessage(null);

    try {
      // 1. Request accounts
      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
      if (!accounts.length) throw new Error('No account selected.');
      const address = accounts[0];
      setWalletAddress(address);

      // 2. Switch to X1 network
      setStatus('switching');
      await switchToX1(provider);

      // 3. Verify NFT ownership
      await verifyNFT(address, provider);

    } catch (err: any) {
      if (err.code === 4001) {
        setStatus('error');
        setErrorMessage('Connection cancelled by user.');
      } else {
        setStatus('error');
        setErrorMessage(err.message || 'Wallet connection failed.');
      }
    }
  }

  function handleWalletClick(wallet: Wallet) {
    if (wallet.action === 'open' || wallet.action === 'download') {
      window.open(wallet.url!, '_blank');
      return;
    }
    connectWallet(wallet.id);
  }

  function walletIsInstalled(walletId: WalletId) {
    if (walletId === 'phantom') return phantomInstalled;
    if (walletId === 'backpack') return backpackInstalled;
    return false;
  }

  const isConnecting = ['connecting', 'switching', 'checking'].includes(status);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0d0013] relative overflow-hidden p-4">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,20,147,0.18)_0%,transparent_70%)] pointer-events-none" />

      {/* Floating symbols */}
      <div className="absolute top-8 left-8 text-5xl opacity-10 animate-pulse select-none">👑</div>
      <div className="absolute top-8 right-8 text-5xl opacity-10 animate-pulse select-none" style={{animationDelay:'0.7s'}}>7️⃣</div>
      <div className="absolute bottom-12 left-12 text-5xl opacity-10 animate-pulse select-none" style={{animationDelay:'1.2s'}}>🧀</div>
      <div className="absolute bottom-12 right-12 text-5xl opacity-10 animate-pulse select-none" style={{animationDelay:'0.4s'}}>🎀</div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg gap-6">
        {/* Logo */}
        <img
          src={barbieLogo}
          alt="BARBIE FUN GAME"
          className="w-full max-w-[420px] drop-shadow-[0_0_30px_rgba(255,20,147,0.9)]"
        />

        {/* Tagline */}
        <p className="text-lg md:text-xl text-center font-bold text-white max-w-sm leading-relaxed"
          style={{ textShadow: '0 0 12px rgba(255,20,147,0.8)' }}>
          Only AFRICA NFT holders can enter the lucky kingdom
        </p>

        {/* X1 badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff1493]/40 bg-[#ff1493]/10 text-sm text-[#ff69b4] font-mono font-bold tracking-widest">
          <span className="w-2 h-2 rounded-full bg-[#ff1493] animate-pulse inline-block" />
          X1 BLOCKCHAIN
        </div>

        {/* Status messages */}
        {status === 'connecting' && (
          <div className="text-center text-[#ff69b4] font-bold text-lg animate-pulse">
            Connecting to wallet...
          </div>
        )}
        {status === 'switching' && (
          <div className="text-center text-[#ff69b4] font-bold text-lg animate-pulse">
            Switching to X1 Blockchain...
          </div>
        )}
        {status === 'checking' && (
          <div className="text-center text-[#ff69b4] font-bold text-lg animate-pulse">
            Verifying AFRICA NFT...
          </div>
        )}
        {status === 'granted' && (
          <div className="text-center font-black text-2xl text-green-400 animate-bounce"
            style={{ textShadow: '0 0 20px rgba(0,255,0,0.8)' }}>
            ✨ Access Granted! Welcome, AFRICA NFT holder!
          </div>
        )}
        {status === 'denied' && (
          <div className="w-full rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-center">
            <p className="text-red-400 font-bold text-lg">🚫 Access Denied</p>
            <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
            <button onClick={resetState} className="mt-3 text-xs text-[#ff69b4] underline">Try another wallet</button>
          </div>
        )}
        {status === 'error' && (
          <div className="w-full rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-center">
            <p className="text-red-400 font-bold">Connection Error</p>
            <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
            <button onClick={resetState} className="mt-3 text-xs text-[#ff69b4] underline">Try again</button>
          </div>
        )}

        {/* Connected address chip */}
        {walletAddress && status !== 'idle' && (
          <div className="flex items-center gap-3">
            <div className="px-5 py-2 rounded-full border-2 border-[#ffd700] bg-[#1a0a1a] font-mono font-bold text-[#ffd700] text-sm"
              style={{ boxShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
              {truncateAddress(walletAddress)}
            </div>
            {!isConnecting && status !== 'granted' && (
              <button onClick={resetState} className="text-sm text-[#ff69b4] underline">Disconnect</button>
            )}
          </div>
        )}

        {/* Wallet picker (hidden while connecting/checking/granted) */}
        {(status === 'idle' || status === 'error' || status === 'denied') && (
          <div className="w-full flex flex-col gap-3 mt-2">
            <p className="text-center text-[#ffb6c1] text-sm font-semibold uppercase tracking-widest">
              Connect Wallet
            </p>
            {WALLETS.map((wallet) => {
              const installed = walletIsInstalled(wallet.id);
              const isExtension = wallet.action === 'connect';

              return (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletClick(wallet)}
                  className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left"
                  style={{
                    background: 'rgba(255,20,147,0.07)',
                    borderColor: 'rgba(255,20,147,0.25)',
                    boxShadow: '0 0 0px rgba(255,20,147,0)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,20,147,0.7)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 18px rgba(255,20,147,0.35)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,20,147,0.15)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,20,147,0.25)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0px rgba(255,20,147,0)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,20,147,0.07)';
                  }}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">{wallet.icon}</div>

                  {/* Name + description */}
                  <div className="flex-1">
                    <div className="font-black text-white text-base">{wallet.name}</div>
                    <div className="text-[#ff69b4] text-xs mt-0.5">{wallet.description}</div>
                  </div>

                  {/* Status badge */}
                  <div className="flex-shrink-0">
                    {isExtension && installed && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-900/60 text-green-400 border border-green-700">
                        Installed
                      </span>
                    )}
                    {isExtension && !installed && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1a0a1a] text-[#ff69b4] border border-[#ff1493]/30">
                        Install ↗
                      </span>
                    )}
                    {wallet.action === 'open' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1a0a1a] text-[#ffd700] border border-[#ffd700]/30">
                        Open ↗
                      </span>
                    )}
                    {wallet.action === 'download' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
                        iOS ↗
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p className="text-[#ff69b4]/40 text-xs text-center mt-2">
          Running on X1 Blockchain · AFRICA NFT required
        </p>
      </div>
    </div>
  );
}
