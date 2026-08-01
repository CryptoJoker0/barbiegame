import { useWallet, type WalletId } from '@/context/WalletContext';
import { useEffect } from 'react';

// ── Icons ─────────────────────────────────────────────────────────────────────
const PhantomIcon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-9 h-9 flex-shrink-0">
    <rect width="128" height="128" rx="26" fill="#AB9FF2" />
    <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8544 41.3056 14.4224 64.0944C13.9744 87.9732 33.8516 108 57.9492 108H63.2752C85.1332 108 113.6 89.2118 117.984 67.9756C118.484 65.4044 116.48 64.9142 110.584 64.9142Z" fill="white" />
    <ellipse cx="47.5" cy="66.5" rx="6.5" ry="7.5" fill="#AB9FF2" />
    <ellipse cx="73.5" cy="66.5" rx="6.5" ry="7.5" fill="#AB9FF2" />
  </svg>
);

const BackpackIcon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-9 h-9 flex-shrink-0">
    <rect width="128" height="128" rx="26" fill="#E33E3F" />
    <path d="M64 18C48.536 18 36 30.536 36 46V52H30C25.582 52 22 55.582 22 60V98C22 102.418 25.582 106 30 106H98C102.418 106 106 102.418 106 98V60C106 55.582 102.418 52 98 52H92V46C92 30.536 79.464 18 64 18ZM64 28C74.166 28 82.5 36.086 82.5 46V52H45.5V46C45.5 36.086 53.834 28 64 28ZM58 72H70V84H58V72Z" fill="white" />
  </svg>
);

const WEWalletIcon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-9 h-9 flex-shrink-0">
    <rect width="128" height="128" rx="26" fill="#0A0A1A" />
    <circle cx="64" cy="64" r="36" fill="none" stroke="#ff1493" strokeWidth="5" />
    <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="#ff1493" fontSize="30" fontWeight="900" fontFamily="monospace">WE</text>
  </svg>
);

const X1Icon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-9 h-9 flex-shrink-0">
    <rect width="128" height="128" rx="26" fill="#0F0F23" />
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#ff1493" fontSize="44" fontWeight="900" fontFamily="monospace">X1</text>
    <rect x="24" y="85" width="80" height="3" rx="1.5" fill="#ff1493" />
  </svg>
);

const IOSIcon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-9 h-9 flex-shrink-0">
    <rect width="128" height="128" rx="26" fill="#1C1C1E" />
    {/* Apple logo simplified */}
    <path d="M79 34c-3.5 4.5-9.5 8-15 7.5 0-5.5 3-11 7-14.5C74.5 22.5 80.5 19.5 86 20c0 5.5-3 11-7 14z" fill="white"/>
    <path d="M86.5 48c-3.5-0.2-9.5 2-13 2s-9-2-13-2c-8 0-20 9-20 26 0 17 12 36 20 36 4 0 7.5-2.5 12-2.5s8.5 2.5 12 2.5c8 0 20-18 20-36 0-2.5-8.5-2.5-18-26z" fill="white"/>
  </svg>
);

// ── Wallet list ───────────────────────────────────────────────────────────────
const WALLETS: {
  id: WalletId;
  name: string;
  desc: string;
  icon: React.ReactNode;
  badge?: string;
  installUrl?: string;
}[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    desc: 'Browser extension · X1 Blockchain',
    icon: <PhantomIcon />,
    installUrl: 'https://phantom.app',
  },
  {
    id: 'backpack',
    name: 'Backpack',
    desc: 'Browser extension · X1 Blockchain',
    icon: <BackpackIcon />,
    installUrl: 'https://backpack.app',
  },
  {
    id: 'wewallet',
    name: 'WE Wallet',
    desc: 'Browser extension · X1 native',
    icon: <WEWalletIcon />,
    installUrl: 'https://wewallet.io',
  },
  {
    id: 'x1web',
    name: 'X1 Web Wallet',
    desc: 'Official X1 Blockchain web wallet',
    icon: <X1Icon />,
    badge: 'Open ↗',
  },
  {
    id: 'x1mobile',
    name: 'X1 Mobile (iOS)',
    desc: 'Install via TestFlight',
    icon: <IOSIcon />,
    badge: 'TestFlight ↗',
  },
];

function isInstalled(id: WalletId): boolean {
  if (id === 'phantom')  return !!(window.phantom?.ethereum || window.ethereum?.isPhantom);
  if (id === 'backpack') return !!(window.backpack?.ethereum || window.ethereum?.isBackpack);
  if (id === 'wewallet') return !!(window.we?.ethereum || window.weWallet || window.ethereum?.isWEWallet);
  return false;
}

interface WalletModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function WalletModal({ onClose, onSuccess }: WalletModalProps) {
  const { connect, isConnecting, isCheckingNft, error, clearError, isConnected } = useWallet();

  useEffect(() => {
    if (isConnected) {
      onSuccess?.();
      onClose();
    }
  }, [isConnected, onClose, onSuccess]);

  async function handleConnect(id: WalletId) {
    clearError();
    await connect(id);
  }

  const busy = isConnecting || isCheckingNft;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#0d0013] border border-[#ff1493]/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(255,20,147,0.3)]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-white">Connect Wallet</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <p className="text-[#ff69b4]/50 text-xs mb-5">All wallets connect on X1 Blockchain (Chain ID 204005)</p>

        {busy && (
          <div className="text-center text-[#ff69b4] font-bold py-3 animate-pulse">
            {isCheckingNft ? 'Verifying AFRICA X1 NFT…' : 'Connecting…'}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {WALLETS.map(w => {
            const isExtension = !w.badge;
            const installed = isExtension ? isInstalled(w.id) : null;
            return (
              <button
                key={w.id}
                disabled={busy}
                onClick={() => handleConnect(w.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#ff1493]/20 bg-[#ff1493]/5 hover:bg-[#ff1493]/15 hover:border-[#ff1493]/50 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {w.icon}
                <div className="flex-1 min-w-0">
                  <div className="font-black text-white text-sm">{w.name}</div>
                  <div className="text-[#ff69b4]/60 text-xs">{w.desc}</div>
                </div>
                {isExtension && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    installed
                      ? 'bg-green-900/40 text-green-400 border-green-700/50'
                      : 'bg-transparent text-[#ff69b4]/60 border-[#ff1493]/30'
                  }`}>
                    {installed ? 'Installed' : 'Install ↗'}
                  </span>
                )}
                {w.badge && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-[#ffd700]/30 text-[#ffd700] flex-shrink-0">
                    {w.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[#ff69b4]/30 text-xs text-center mt-5">
          AFRICA X1 NFT required to play · All transactions on X1 Blockchain
        </p>
      </div>
    </div>
  );
}
