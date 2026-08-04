import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useWallet } from '@/context/WalletContext';
import { WalletModal } from '@/components/WalletModal';
import { useGetLeaderboard, useGetGameConfig } from '@workspace/api-client-react';
import barbieLogo from '@/assets/barbie-logo.png';
import barbieCover from '@/assets/barbie-cover.png';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

// ── Custom slot-machine tile SVGs ─────────────────────────────────────────────
const SevenTile = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="sevGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e53935"/>
        <stop offset="100%" stopColor="#b71c1c"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="12" fill="url(#sevGrad)" opacity="0.15"/>
    <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
      fill="#ff4444" fontSize="38" fontWeight="900" fontFamily="monospace"
      style={{ filter: 'drop-shadow(0 0 8px rgba(255,68,68,0.9))' }}>7</text>
  </svg>
);

const CheeseTile = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="64" height="64" rx="12" fill="#ffd700" opacity="0.1"/>
    <polygon points="10,46 54,46 54,30 32,18 10,30" fill="#ffd700" opacity="0.85"/>
    <polygon points="10,30 32,18 54,30" fill="#ffed4a" opacity="0.9"/>
    <circle cx="26" cy="38" r="4" fill="#b8860b" opacity="0.6"/>
    <circle cx="40" cy="36" r="3" fill="#b8860b" opacity="0.6"/>
    <circle cx="33" cy="43" r="2.5" fill="#b8860b" opacity="0.6"/>
  </svg>
);

const CrownTile = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffd700"/>
        <stop offset="100%" stopColor="#ff8c00"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="12" fill="url(#crownGrad)" opacity="0.1"/>
    <path d="M10 46 L14 24 L24 36 L32 16 L40 36 L50 24 L54 46 Z"
      fill="url(#crownGrad)" stroke="#ffd700" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="10" y="46" width="44" height="6" rx="2" fill="#ffd700" opacity="0.9"/>
    <circle cx="32" cy="16" r="3" fill="#ff1493"/>
    <circle cx="14" cy="24" r="2.5" fill="#ff1493"/>
    <circle cx="50" cy="24" r="2.5" fill="#ff1493"/>
  </svg>
);

const DiamondTile = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="diaGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a8edff"/>
        <stop offset="100%" stopColor="#0090ff"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="12" fill="url(#diaGrad)" opacity="0.1"/>
    <path d="M32 10 L54 30 L32 54 L10 30 Z" fill="url(#diaGrad)" opacity="0.85"/>
    <path d="M32 10 L54 30 L32 30 Z" fill="white" opacity="0.25"/>
    <path d="M10 30 L32 30 L32 10 Z" fill="white" opacity="0.1"/>
  </svg>
);

const BowTile = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="bowGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff1493"/>
        <stop offset="100%" stopColor="#ff69b4"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="12" fill="url(#bowGrad)" opacity="0.12"/>
    {/* Left wing */}
    <path d="M32 32 C28 24 10 18 8 28 C6 38 24 38 32 32 Z" fill="url(#bowGrad)"/>
    {/* Right wing */}
    <path d="M32 32 C36 24 54 18 56 28 C58 38 40 38 32 32 Z" fill="url(#bowGrad)"/>
    {/* Left bottom */}
    <path d="M32 32 C28 40 10 46 8 36 C6 26 24 26 32 32 Z" fill="#ff1493" opacity="0.8"/>
    {/* Right bottom */}
    <path d="M32 32 C36 40 54 46 56 36 C58 26 40 26 32 32 Z" fill="#ff1493" opacity="0.8"/>
    {/* Center knot */}
    <circle cx="32" cy="32" r="5" fill="#ffd700" stroke="#ff69b4" strokeWidth="1.5"/>
  </svg>
);

const StarTile = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffd700"/>
        <stop offset="50%" stopColor="#ff8c00"/>
        <stop offset="100%" stopColor="#ffd700"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="12" fill="url(#starGrad)" opacity="0.1"/>
    <path d="M32 10 L36.9 24.5 L52 24.5 L40 33.5 L44.9 48 L32 39 L19.1 48 L24 33.5 L12 24.5 L27.1 24.5 Z"
      fill="url(#starGrad)" stroke="#ffd700" strokeWidth="0.5"/>
  </svg>
);

// Tile wrapper: frosted card with glow border
const TILES = [SevenTile, CheeseTile, CrownTile, DiamondTile, BowTile, StarTile, SevenTile, CrownTile];
const TILE_GLOWS = [
  'shadow-[0_0_18px_rgba(229,57,53,0.6)]  border-[#e53935]/50',
  'shadow-[0_0_18px_rgba(255,215,0,0.5)]  border-[#ffd700]/50',
  'shadow-[0_0_18px_rgba(255,215,0,0.5)]  border-[#ffd700]/50',
  'shadow-[0_0_18px_rgba(0,144,255,0.5)]  border-[#0090ff]/50',
  'shadow-[0_0_18px_rgba(255,20,147,0.5)] border-[#ff1493]/50',
  'shadow-[0_0_18px_rgba(255,215,0,0.5)]  border-[#ffd700]/50',
  'shadow-[0_0_18px_rgba(229,57,53,0.6)]  border-[#e53935]/50',
  'shadow-[0_0_18px_rgba(255,215,0,0.5)]  border-[#ffd700]/50',
];

// ── Feature card icon SVGs ────────────────────────────────────────────────────
const SlotIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
    <rect width="48" height="48" rx="10" fill="#1a0a1a"/>
    <rect x="8" y="12" width="32" height="20" rx="4" fill="#2d1b4e" stroke="#ff1493" strokeWidth="1.5"/>
    <rect x="12" y="16" width="8" height="12" rx="2" fill="#0d0015" stroke="#ff1493" strokeWidth="1"/>
    <rect x="22" y="16" width="8" height="12" rx="2" fill="#0d0015" stroke="#ffd700" strokeWidth="1"/>
    <text x="16" y="25" textAnchor="middle" fill="#ff4444" fontSize="9" fontWeight="900" fontFamily="monospace">7</text>
    <text x="26" y="25" textAnchor="middle" fill="#ffd700" fontSize="9" fontWeight="900" fontFamily="monospace">7</text>
    <rect x="32" y="16" width="4" height="12" rx="2" fill="#0d0015" stroke="#ff1493" strokeWidth="1"/>
    <text x="34" y="25" textAnchor="middle" fill="#ff4444" fontSize="9" fontWeight="900" fontFamily="monospace">7</text>
    {/* Lever */}
    <rect x="38" y="10" width="3" height="16" rx="1.5" fill="#ffd700"/>
    <circle cx="39.5" cy="9" r="3" fill="#e53935"/>
    <rect x="6" y="32" width="36" height="5" rx="2.5" fill="#ff1493" opacity="0.7"/>
  </svg>
);

const FlameIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
    <defs>
      <linearGradient id="flameG" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#ffd700"/>
        <stop offset="50%" stopColor="#ff6600"/>
        <stop offset="100%" stopColor="#e53935"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="#1a0a1a"/>
    {/* Outer flame */}
    <path d="M24 6 C24 6 30 14 28 20 C32 16 34 10 30 6 C34 14 36 20 32 28 C36 24 38 28 36 34 C34 40 28 44 24 44 C20 44 14 40 12 34 C10 28 12 24 16 28 C12 20 14 14 18 10 C16 16 18 20 22 20 C20 14 24 6 24 6Z"
      fill="url(#flameG)" opacity="0.9"/>
    {/* Inner core */}
    <path d="M24 20 C24 20 27 25 26 29 C28 27 29 24 27 20 C29 25 28 30 25 34 C23 36 21 36 20 34 C18 30 20 26 22 28 C20 24 22 20 24 20Z"
      fill="#ffd700" opacity="0.7"/>
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
    <defs>
      <linearGradient id="trophyG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffd700"/>
        <stop offset="100%" stopColor="#ff8c00"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="#1a0a1a"/>
    {/* Cup body */}
    <path d="M16 10 H32 L30 26 C30 30 27 33 24 33 C21 33 18 30 18 26 Z" fill="url(#trophyG)"/>
    {/* Handles */}
    <path d="M16 12 C12 12 10 16 12 20 C13 22 16 22 16 20" stroke="#ffd700" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M32 12 C36 12 38 16 36 20 C35 22 32 22 32 20" stroke="#ffd700" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Stem */}
    <rect x="22" y="33" width="4" height="6" fill="#ff8c00"/>
    {/* Base */}
    <rect x="16" y="39" width="16" height="3" rx="1.5" fill="url(#trophyG)"/>
    {/* Star */}
    <path d="M24 16 L25.2 19.5 L29 19.5 L26 21.7 L27.2 25.2 L24 23 L20.8 25.2 L22 21.7 L19 19.5 L22.8 19.5 Z"
      fill="white" opacity="0.7"/>
  </svg>
);

const GiftIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
    <defs>
      <linearGradient id="giftG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e53935"/>
        <stop offset="100%" stopColor="#b71c1c"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="#1a0a1a"/>
    {/* Box body */}
    <rect x="10" y="22" width="28" height="20" rx="2" fill="url(#giftG)"/>
    {/* Lid */}
    <rect x="8" y="17" width="32" height="7" rx="2" fill="#e53935"/>
    {/* Vertical ribbon on box */}
    <rect x="22" y="22" width="4" height="20" fill="#ffd700" opacity="0.8"/>
    {/* Horizontal ribbon on lid */}
    <rect x="8" y="20" width="32" height="4" fill="#ffd700" opacity="0.8"/>
    {/* Left bow loop */}
    <path d="M24 17 C20 12 12 12 14 17" stroke="#ffd700" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Right bow loop */}
    <path d="M24 17 C28 12 36 12 34 17" stroke="#ffd700" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Bow center knot */}
    <circle cx="24" cy="17" r="2.5" fill="#ffd700"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
    <defs>
      <linearGradient id="shieldG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff1493"/>
        <stop offset="100%" stopColor="#b71c1c"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="#1a0a1a"/>
    <path d="M24 6 L38 12 L38 26 C38 34 32 40 24 44 C16 40 10 34 10 26 L10 12 Z"
      fill="url(#shieldG)" opacity="0.9"/>
    <path d="M24 9 L35 14 L35 26 C35 33 30 38 24 42 C18 38 13 33 13 26 L13 14 Z"
      fill="#1a0a1a" opacity="0.4"/>
    {/* Lock icon */}
    <rect x="19" y="26" width="10" height="8" rx="2" fill="white" opacity="0.9"/>
    <path d="M20 26 L20 23 C20 20.2 28 20.2 28 23 L28 26" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="24" cy="30" r="1.5" fill="#e53935"/>
  </svg>
);

// ── Paytable mini-tile (inline, compact) ──────────────────────────────────────
const WildTile = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
    <rect width="32" height="32" rx="6" fill="#2d1b4e" opacity="0.6"/>
    <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
      fill="#ff69b4" fontSize="14" fontWeight="900" fontFamily="monospace">?</text>
  </svg>
);

type TileComponent = () => JSX.Element;
interface PayRow {
  tiles: (TileComponent | null)[];
  reward: string;
  color: string;
  glow?: string;
}

const PAYTABLE: PayRow[] = [
  { tiles: [SevenTile, SevenTile, SevenTile],   reward: 'MEGA JACKPOT',   color: 'text-[#8B6914]', glow: '0_0_12px_rgba(194,24,91,0.35)' },
  { tiles: [CheeseTile, CheeseTile, CheeseTile],reward: '777 coins',      color: 'text-[#7B1818]' },
  { tiles: [CrownTile, CrownTile, CrownTile],   reward: '500 coins',      color: 'text-[#7B1818]' },
  { tiles: [DiamondTile, DiamondTile, DiamondTile], reward: '200 coins',  color: 'text-[#7B1818]' },
  { tiles: [BowTile, BowTile, BowTile],          reward: '100 coins',     color: 'text-[#7B1818]' },
  { tiles: [SevenTile, SevenTile, null],          reward: '50 coins',     color: 'text-[#B22222]' },
  { tiles: [CheeseTile, null, null],              reward: '+1 Cheese Pt', color: 'text-[#B22222]' },
];

const FEATURE_ICONS = [SlotIcon, CheeseTile, FlameIcon, TrophyIcon, GiftIcon, ShieldIcon];

// ── Scroll-reveal hook ─────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / 60;
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [visible, target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Reveal section wrapper ────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {children}
    </div>
  );
}

// ── FAQ item ──────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is BARBIEFUN-GAME?', a: 'BARBIEFUN-GAME is an exclusive Web3 slot machine game built on X1 Blockchain. Spin the 777 reels, collect Cheese Points, and chase the legendary Mega Jackpot — available only to AFRICA NFT holders.' },
  { q: 'How do I get an AFRICA NFT?', a: 'Visit the AFRICA NFT official website or marketplace to acquire your NFT on X1 Blockchain. Once you hold one, you automatically gain access to BARBIEFUN-GAME.' },
  { q: 'Which wallets are supported?', a: 'Phantom, Backpack, and X1 Web Wallet. These are the official supported wallets for BARBIEFUN-GAME on X1 Blockchain.' },
  { q: 'What is the Mega Jackpot?', a: 'Match three 7️⃣ symbols on the reels to trigger the Mega Jackpot, the biggest prize in the game. The jackpot pool grows with every spin.' },
  { q: 'Are my winnings real money?', a: 'All coins and Cheese Points are in-game currency for fun and competition. They represent your skill and luck on the leaderboard, not monetary value.' },
  { q: 'How does the leaderboard work?', a: 'Your high score is tracked automatically. The leaderboard resets periodically. Compete to hold the top spot among all AFRICA NFT holders.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#ff1493]/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#ff1493]/5 transition-colors"
      >
        <span className="font-bold text-[#7B1818] text-sm md:text-base">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-[#ff69b4] flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#ff69b4] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-[#5C1A1A] text-sm leading-relaxed border-t border-[#ff1493]/10">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

function truncate(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}`; }

export default function LandingPage() {
  const { isConnected, hasNft } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const { data: leaderboard } = useGetLeaderboard({ limit: 5 });
  const { data: gameConfig } = useGetGameConfig();

  const totalSpins = leaderboard?.reduce((s, p) => s + (p.totalSpins ?? 0), 0) ?? 0;
  const activePlayers = leaderboard?.length ?? 0;
  const jackpot = gameConfig?.jackpotAmount ?? 1000;

  return (
    <div className="min-h-screen bg-transparent text-[#7B1818]">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Radial glow bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,20,147,0.22)_0%,transparent_70%)] pointer-events-none" />
        {/* Drifting slot tiles */}
        {TILES.map((TileIcon, i) => (
          <div
            key={i}
            className={`absolute select-none pointer-events-none w-14 h-14 rounded-xl border bg-black/30 backdrop-blur-sm tile-drift ${TILE_GLOWS[i]}`}
            style={{
              left: `${5 + i * 12}%`,
              top: `${8 + (i % 4) * 22}%`,
              opacity: 0.55,
              animationDelay: `${i * 0.75}s`,
              animationDuration: `${5 + i * 0.6}s`,
            }}
          >
            <TileIcon />
          </div>
        ))}

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl">
          {/* Cover image hero */}
          <div className="animate-float" style={{ animationDuration: '4s' }}>
            <img
              src={barbieCover}
              alt="BARBIEFUN-GAME"
              className="w-full max-w-[500px] drop-shadow-[0_0_60px_rgba(255,20,147,0.95)]"
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff1493]/40 bg-[#ff1493]/10 text-xs text-[#B22222] font-mono font-bold tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#ff1493] animate-pulse inline-block" />
            LIVE ON X1 BLOCKCHAIN
          </div>

          <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff1493] via-[#ff69b4] to-[#ffd700] leading-tight"
            style={{ textShadow: 'none', filter: 'drop-shadow(0 0 30px rgba(255,20,147,0.5))' }}>
            BARBIEFUN-GAME
          </h1>

          <p className="text-lg md:text-2xl text-[#5C1A1A] font-bold max-w-2xl leading-relaxed">
            777 &amp; Cheese — The Ultimate NFT Casino Experience
          </p>
          <p className="text-sm md:text-base text-[#9E2A2A] max-w-xl">
            Exclusively for AFRICA NFT holders. Spin the reels, collect Cheese, and chase the Mega Jackpot.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            {!isConnected ? (
              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,20,147,0.6)] pulse-glow"
              >
                Connect Wallet
              </button>
            ) : null}
            {isConnected && hasNft ? (
              <Link href="/game">
                <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ffd700] text-white font-black text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,20,147,0.6)]">
                  Play Now
                </button>
              </Link>
            ) : isConnected ? (
              <button disabled className="px-8 py-4 rounded-2xl bg-gray-800 text-gray-500 font-black text-lg cursor-not-allowed">
                AFRICA NFT Required
              </button>
            ) : (
              <Link href="/leaderboard">
                <button className="px-8 py-4 rounded-2xl border-2 border-[#ff1493]/50 text-[#B22222] font-black text-lg hover:bg-[#ff1493]/10 transition-colors">
                  View Leaderboard
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-[#ff1493]/40">
          <ChevronDown className="h-6 w-6" />
        </div>
      </section>

      {/* ── DESCRIPTION ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-black text-[#7B1818] mb-6">
                Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C2185B] to-[#8B6914]">BARBIEFUN-GAME</span>
              </h2>
              <p className="text-[#5C1A1A] text-base md:text-lg leading-relaxed">
                Welcome to BARBIEFUN-GAME, an exclusive Web3 gaming experience where luck, fun, and rewards come together.
                Inspired by the exciting 777 &amp; Cheese concept, players spin the reels, collect Cheese Points,
                unlock bonus rewards, and chase the legendary 777 Jackpot.
              </p>
              <p className="text-[#5C1A1A] text-base md:text-lg leading-relaxed mt-4">
                This game is exclusively available to AFRICA NFT holders. Simply connect your wallet,
                verify your NFT ownership, and start playing.
              </p>
              <p className="mt-6 text-xl font-black text-[#8B6914]">
                Own the NFT. Spin the 777. Collect the Cheese. Win Big.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#ff1493]/3">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
              Why <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff1493] to-[#ffd700]">Players Love It</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: '777 Jackpot',    desc: 'Match three 7 symbols to trigger the legendary Mega Jackpot and claim the entire pool.' },
              { title: 'Cheese Points',  desc: 'Collect Cheese Points on every spin. Redeem them for powerful bonus spins.' },
              { title: 'Win Streaks',    desc: 'Build consecutive wins to activate streak multipliers and amplify your rewards.' },
              { title: 'Leaderboard',    desc: 'Compete against top AFRICA NFT holders worldwide and prove your luck.' },
              { title: 'Daily Rewards',  desc: "Log in every day to claim free coins and Cheese Points. Don't break the streak." },
              { title: 'NFT Exclusive',  desc: 'Only verified AFRICA NFT holders can enter the lucky kingdom. True Web3 exclusivity.' },
            ].map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <Reveal key={f.title} delay={i * 80}>
                  <div className="glass-card rounded-2xl p-6 hover:border-[#C2185B]/60 hover:shadow-[0_0_20px_rgba(194,24,91,0.15)] transition-all h-full">
                    <div className="w-12 h-12 mb-4"><Icon /></div>
                    <h3 className="font-black text-[#7B1818] text-lg mb-2">{f.title}</h3>
                    <p className="text-[#5C1A1A] text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW TO ENTER ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">How to Enter</h2>
          </Reveal>
          <div className="flex flex-col gap-0">
            {[
              'Own at least one AFRICA NFT',
              'Open BARBIEFUN-GAME in your browser',
              'Connect your wallet (Phantom, Backpack, or X1 Web Wallet)',
              'NFT ownership is verified automatically on X1 Blockchain',
              'Access granted — enter the lucky kingdom!',
              'No NFT yet? Visit the marketplace to get your AFRICA NFT',
            ].map((step, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="flex items-start gap-4 relative pb-6">
                  {i < 5 && (
                    <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gradient-to-b from-[#ff1493] to-transparent" />
                  )}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#ff1493] to-[#ff69b4] flex items-center justify-center font-black text-white text-sm shadow-[0_0_12px_rgba(255,20,147,0.5)] z-10">
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-[#5C1A1A] font-semibold">{step}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO PLAY ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#ff1493]/3">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">How to Play</h2>
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <Reveal>
              <div className="flex flex-col gap-3">
                {[
                  'Press SPIN to start the slot machine (costs 10 coins)',
                  'Match symbols to earn coin rewards',
                  'Three 7 symbols trigger the Mega Jackpot',
                  'Cheese symbols award Cheese Points you can bank',
                  'Use 5 Cheese Points for 3 FREE bonus spins',
                  'Build winning streaks for score multipliers',
                  'Claim daily rewards for free coins each day',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C2185B] flex items-center justify-center text-xs font-black text-white">{i + 1}</span>
                    <p className="text-[#5C1A1A] text-sm pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-black text-[#8B6914] text-center mb-4 uppercase tracking-widest text-sm">Paytable</h3>
                <div className="space-y-2">
                  {PAYTABLE.map((row, ri) => (
                    <div
                      key={ri}
                      className="flex items-center justify-between border-b border-[#ff1493]/10 pb-2"
                      style={row.glow ? { filter: `drop-shadow(${row.glow})` } : undefined}
                    >
                      {/* Tile combo */}
                      <div className="flex items-center gap-1">
                        {row.tiles.map((Tile, ti) => (
                          <div
                            key={ti}
                            className="w-8 h-8 rounded-lg border border-[#ff1493]/20 bg-[#ff1493]/5 overflow-hidden flex-shrink-0"
                          >
                            {Tile ? <Tile /> : <WildTile />}
                          </div>
                        ))}
                      </div>
                      {/* Reward */}
                      <span className={`font-black text-xs ml-3 ${row.color}`}>{row.reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {[
              { label: 'Total Spins', value: totalSpins || 10000, suffix: '+' },
              { label: 'Top Players', value: activePlayers || 50, suffix: '' },
              { label: 'Jackpot Pool', value: jackpot, suffix: '' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="glass-card rounded-2xl p-4 md:p-6 text-center">
                  <div className="text-3xl md:text-5xl font-black text-[#8B6914]">
                    <AnimCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[#9E2A2A] text-xs md:text-sm mt-1 font-semibold uppercase tracking-widest">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD PREVIEW ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#ff1493]/3">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-black text-center mb-10">Top Players</h2>
          </Reveal>
          <Reveal>
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ff1493]/20 text-[#B22222] text-xs uppercase tracking-widest font-bold">
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-right">High Score</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Winnings</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard && leaderboard.length > 0 ? leaderboard.map((p, i) => (
                    <tr key={p.walletAddress} className="border-b border-[#ff1493]/10 hover:bg-[#ff1493]/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`font-black ${i === 0 ? 'text-[#8B6914]' : i === 1 ? 'text-[#666666]' : i === 2 ? 'text-[#8B5A00]' : 'text-[#9E2A2A]'}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#5C1A1A] font-bold">
                        {p.nickname || truncate(p.walletAddress)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-[#8B6914]">{(p.highScore ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-[#9E2A2A] font-semibold hidden sm:table-cell">{(p.totalWinnings ?? 0).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[#9E2A2A] font-semibold">No players yet — be the first!</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-4 text-center border-t border-[#ff1493]/10">
                <Link href="/leaderboard">
                  <button className="text-[#B22222] text-sm font-bold hover:text-[#7B1818] transition-colors">
                    View Full Leaderboard →
                  </button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── RULES ────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-black text-center mb-10">Game Rules</h2>
          </Reveal>
          <Reveal>
            <div className="glass-card rounded-2xl p-6 md:p-8 space-y-3">
              {[
                'Only verified AFRICA NFT holders may access and play',
                'NFT ownership is verified on wallet connect and monitored during session',
                'If the NFT is transferred away, access is revoked immediately',
                'One wallet address per player session',
                'All slot outcomes use fair client-seeded randomisation',
                'All rewards are in-game currency only — not monetary value',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[#ff1493] font-black text-lg leading-none mt-0.5">·</span>
                  <p className="text-[#ffb6c1] text-sm">{rule}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#ff1493]/3">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-black text-center mb-10">Frequently Asked Questions</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 60}>
                <FaqItem {...faq} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#ff1493]/20 bg-[#0a000f] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <img src={barbieLogo} alt="BARBIEFUN-GAME" className="h-10 mb-3 drop-shadow-[0_0_8px_rgba(255,20,147,0.6)]" />
              <p className="text-[#ff69b4]/60 text-xs">Own the NFT. Spin the 777. Win Big.</p>
            </div>
            {/* Game */}
            <div>
              <h4 className="font-black text-white text-sm mb-3 uppercase tracking-widest">Game</h4>
              <div className="space-y-2">
                <Link href="/game"><span className="block text-[#ffb6c1]/70 hover:text-white text-sm transition-colors cursor-pointer">Play</span></Link>
                <Link href="/leaderboard"><span className="block text-[#ffb6c1]/70 hover:text-white text-sm transition-colors cursor-pointer">Leaderboard</span></Link>
                <Link href="/profile"><span className="block text-[#ffb6c1]/70 hover:text-white text-sm transition-colors cursor-pointer">Profile</span></Link>
              </div>
            </div>
            {/* Community */}
            <div>
              <h4 className="font-black text-white text-sm mb-3 uppercase tracking-widest">Community</h4>
              <div className="space-y-2">
                <a href="https://x.com/BARBIEFUNV2" target="_blank" rel="noopener noreferrer" className="block text-[#ffb6c1]/70 hover:text-white text-sm transition-colors">Twitter / X</a>
                <a href="https://t.me/barbiefunv2" target="_blank" rel="noopener noreferrer" className="block text-[#ffb6c1]/70 hover:text-white text-sm transition-colors">Telegram</a>
              </div>
            </div>
            {/* Support */}
            <div>
              <h4 className="font-black text-white text-sm mb-3 uppercase tracking-widest">Support</h4>
              <div className="space-y-2">
                <a href="https://x.com/BARBIEFUNV2" target="_blank" rel="noopener noreferrer" className="block text-[#ffb6c1]/70 hover:text-white text-sm transition-colors">FAQ</a>
                <a href="https://t.me/barbiefunv2" target="_blank" rel="noopener noreferrer" className="block text-[#ffb6c1]/70 hover:text-white text-sm transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#ff1493]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#ff69b4]/30 text-xs">
              © 2025 BARBIEFUN-GAME. All rights reserved. Built on X1 Blockchain.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://x.com/BARBIEFUNV2" target="_blank" rel="noopener noreferrer" className="text-[#ff69b4]/40 hover:text-[#ff1493] transition-colors text-xs font-bold tracking-wide">𝕏 @BARBIEFUNV2</a>
              <a href="https://t.me/barbiefunv2" target="_blank" rel="noopener noreferrer" className="text-[#ff69b4]/40 hover:text-[#ff1493] transition-colors text-xs font-bold tracking-wide">Telegram</a>
            </div>
          </div>
        </div>
      </footer>

      {showModal && <WalletModal onClose={() => setShowModal(false)} />}

      {/* ── FLOATING MINT NFT BUTTON ─────────────────────────────────────────── */}
    </div>
  );
}
