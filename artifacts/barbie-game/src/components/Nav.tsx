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
      <nav className="sticky top-0 z-50 w-full border-b border-[#e53935]/20 bg-black/60 backdrop-blur-2xl shadow-[0_2px_20px_rgba(229,57,53,0.15)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src={barbieLogo} alt="BARBIEFUN-GAME" className="h-10 drop-shadow-[0_0_8px_rgba(255,20,147,0.6)]" />
            <span className="hidden sm:block font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#e53935] to-[#b71c1c] tracking-wider">
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
                    ? 'text-[#e53935]'
                    : 'text-[#b71c1c]/70 hover:text-[#e53935]'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {/* Mint NFT — always visible */}
            <a
              href="https://african-x-1-nft--africamarket.replit.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-xs tracking-widest uppercase text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #e53935 0%, #b71c1c 50%, #ffd700 100%)', border: '1.5px solid rgba(255,215,0,0.4)' }}
            >
              ✦ Mint NFT
            </a>
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
                  className="px-3 py-1.5 rounded-full border border-[#e53935]/40 bg-[#e53935]/10 text-[#b71c1c] text-xs font-mono font-bold hover:bg-[#e53935]/20 transition-colors"
                >
                  {truncate(walletAddress!)}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#e53935] to-[#ef5350] text-white text-sm font-black hover:opacity-90 transition-opacity shadow-[0_0_18px_rgba(229,57,53,0.45)]"
              >
                Connect Wallet
              </button>
            )}
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-[#b71c1c]/70 hover:text-[#e53935]"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#e53935]/15 bg-black/80 backdrop-blur-xl px-4 py-4 flex flex-col gap-3">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`text-base font-bold py-2 transition-colors ${
                  loc === l.href ? 'text-[#e53935]' : 'text-[#b71c1c]/70'
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
