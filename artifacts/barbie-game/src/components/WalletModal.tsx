import { useWallet, type WalletId } from '@/context/WalletContext';
import { useEffect } from 'react';

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

const MetaMaskIcon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-9 h-9 flex-shrink-0">
    <rect width="128" height="128" rx="26" fill="#F6851B" />
    <path d="M98 24L66 48l6-16L98 24z" fill="#E17726" />
    <path d="M30 24l31.6 24.4-5.6-16L30 24z" fill="#E27625" />
    <path d="M87 86l-8 13 18 5 5-18-15 0z" fill="#E27625" />
    <path d="M26 86l5 18 18-5-8-13-15 0z" fill="#E27625" />
    <path d="M48 61l-5 8 18 1-1-19-12 10z" fill="#E27625" />
    <path d="M80 61l-12-10-1 19 18-1-5-8z" fill="#E27625" />
    <path d="M49 99l11-5-9-7-2 12z" fill="#D5BFB2" />
    <path d="M68 94l11 5-2-12-9 7z" fill="#D5BFB2" />
  </svg>
);

const X1Icon = () => (
  <svg viewBox="0 0 128 128" fill="none" className="w-9 h-9 flex-shrink-0">
    <rect width="128" height="128" rx="26" fill="#0F0F23" />
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#ff1493" fontSize="44" fontWeight="900" fontFamily="monospace">X1</text>
    <rect x="24" y="85" width="80" height="3" rx="1.5" fill="#ff1493" />
  </svg>
);

const WALLETS: { id: WalletId; name: string; desc: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'phantom', name: 'Phantom', desc: 'Browser extension', icon: <PhantomIcon /> },
  { id: 'backpack', name: 'Backpack', desc: 'Browser extension', icon: <BackpackIcon /> },
  { id: 'metamask', name: 'MetaMask', desc: 'Browser extension', icon: <MetaMaskIcon /> },
  { id: 'x1web', name: 'X1 Web Wallet', desc: 'Official X1 Blockchain wallet', icon: <X1Icon />, badge: 'Open ↗' },
  { id: 'x1mobile', name: 'X1 Mobile', desc: 'iOS via TestFlight', icon: <X1Icon />, badge: 'iOS ↗' },
];

function isInstalled(id: WalletId) {
  if (id === 'phantom') return !!(window.phantom?.ethereum || window.ethereum?.isPhantom);
  if (id === 'backpack') return !!(window.backpack?.ethereum || window.ethereum?.isBackpack);
  if (id === 'metamask') return !!window.ethereum?.isMetaMask;
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-white">Connect Wallet</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {busy && (
          <div className="text-center text-[#ff69b4] font-bold py-3 animate-pulse">
            {isCheckingNft ? 'Verifying AFRICA NFT...' : 'Connecting...'}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {WALLETS.map(w => {
            const installed = isInstalled(w.id);
            const isExtension = !w.badge;
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
                  <div className="text-[#ff69b4] text-xs">{w.desc}</div>
                </div>
                {isExtension && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${installed ? 'bg-green-900/40 text-green-400 border-green-700/50' : 'bg-transparent text-[#ff69b4] border-[#ff1493]/30'}`}>
                    {installed ? 'Installed' : 'Install ↗'}
                  </span>
                )}
                {w.badge && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-[#ffd700]/30 text-[#ffd700]">
                    {w.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[#ff69b4]/40 text-xs text-center mt-5">
          AFRICA NFT required · X1 Blockchain
        </p>
      </div>
    </div>
  );
}
