import { Link, useLocation } from 'wouter';
import { useWallet } from '@/context/WalletContext';
import { WalletModal } from '@/components/WalletModal';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import barbieLogo from '@/assets/barbie-logo.png';

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Nav() {
  const { walletAddress, isConnected, hasNft, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loc] = useLocation();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/games', label: 'Games' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-[#ff1493]/30 bg-[#0d0013]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src={barbieLogo} alt="BARBIEFUN-GAME" className="h-10 drop-shadow-[0_0_8px_rgba(255,20,147,0.8)]" />
            <span className="hidden sm:block font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#ff1493] to-[#ffd700] tracking-wider">
              BARBIEFUN-GAME
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-semibold transition-colors ${
                  loc === l.href
                    ? 'text-[#ff1493]'
                    : 'text-white/70 hover:text-[#ff69b4]'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2">
                {hasNft && (
                  <span className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-green-900/40 text-green-400 border border-green-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                    NFT
                  </span>
                )}
                <button
                  onClick={disconnect}
                  className="px-3 py-1.5 rounded-full border border-[#ff1493]/50 bg-[#ff1493]/10 text-[#ff69b4] text-xs font-mono font-bold hover:bg-[#ff1493]/20 transition-colors"
                >
                  {truncate(walletAddress!)}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white text-sm font-black hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(255,20,147,0.5)]"
              >
                Connect Wallet
              </button>
            )}
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white/70 hover:text-white"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#ff1493]/20 bg-[#0d0013]/95 px-4 py-4 flex flex-col gap-3">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`text-base font-semibold py-2 transition-colors ${
                  loc === l.href ? 'text-[#ff1493]' : 'text-white/70'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </>
  );
}
