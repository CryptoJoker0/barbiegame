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
      {/* Nav — soft white-pink glassmorphism on the light-pink background */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#ff1493]/20 bg-white/60 backdrop-blur-2xl shadow-[0_2px_20px_rgba(255,20,147,0.10)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src={barbieLogo} alt="BARBIEFUN-GAME" className="h-10 drop-shadow-[0_0_8px_rgba(255,20,147,0.6)]" />
            <span className="hidden sm:block font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#e91e8c] to-[#c2185b] tracking-wider">
              BARBIEFUN-GAME
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-bold transition-colors ${
                  loc === l.href
                    ? 'text-[#e91e8c]'
                    : 'text-[#c2185b]/70 hover:text-[#e91e8c]'
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
                  <span className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                    NFT
                  </span>
                )}
                <button
                  onClick={disconnect}
                  className="px-3 py-1.5 rounded-full border border-[#ff1493]/40 bg-[#ff1493]/10 text-[#c2185b] text-xs font-mono font-bold hover:bg-[#ff1493]/20 transition-colors"
                >
                  {truncate(walletAddress!)}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#f06292] text-white text-sm font-black hover:opacity-90 transition-opacity shadow-[0_0_18px_rgba(233,30,140,0.45)]"
              >
                Connect Wallet
              </button>
            )}
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-[#c2185b]/70 hover:text-[#e91e8c]"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#ff1493]/15 bg-white/80 backdrop-blur-xl px-4 py-4 flex flex-col gap-3">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`text-base font-bold py-2 transition-colors ${
                  loc === l.href ? 'text-[#e91e8c]' : 'text-[#c2185b]/70'
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
