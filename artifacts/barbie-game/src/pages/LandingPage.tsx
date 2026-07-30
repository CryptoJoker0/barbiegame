import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useWallet } from '@/context/WalletContext';
import { WalletModal } from '@/components/WalletModal';
import { useGetLeaderboard, useGetGameConfig } from '@workspace/api-client-react';
import barbieLogo from '@/assets/barbie-logo.png';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  { q: 'Which wallets are supported?', a: 'MetaMask, Phantom, Backpack, and X1 Mobile (iOS via TestFlight). Any EVM-compatible wallet that supports custom networks works with X1 Blockchain.' },
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
        <span className="font-bold text-white text-sm md:text-base">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-[#ff69b4] flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#ff69b4] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-[#ffb6c1] text-sm leading-relaxed border-t border-[#ff1493]/10">
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
    <div className="min-h-screen bg-[#0d0013] text-white">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Radial glow bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,20,147,0.22)_0%,transparent_70%)] pointer-events-none" />
        {/* Drifting symbols */}
        {['7️⃣', '🧀', '👑', '🍷', '🎀', '7️⃣', '🧀', '👑'].map((s, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none opacity-[0.07] text-5xl animate-float"
            style={{
              left: `${8 + i * 12}%`,
              top: `${10 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          >
            {s}
          </span>
        ))}

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl">
          <div className="animate-float" style={{ animationDuration: '4s' }}>
            <img
              src={barbieLogo}
              alt="BARBIEFUN-GAME"
              className="w-full max-w-[480px] drop-shadow-[0_0_50px_rgba(255,20,147,0.9)]"
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff1493]/40 bg-[#ff1493]/10 text-xs text-[#ff69b4] font-mono font-bold tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#ff1493] animate-pulse inline-block" />
            LIVE ON X1 BLOCKCHAIN
          </div>

          <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff1493] via-[#ff69b4] to-[#ffd700] leading-tight"
            style={{ textShadow: 'none', filter: 'drop-shadow(0 0 30px rgba(255,20,147,0.5))' }}>
            BARBIEFUN-GAME
          </h1>

          <p className="text-lg md:text-2xl text-[#ffb6c1] font-bold max-w-2xl leading-relaxed">
            777 &amp; Cheese — The Ultimate NFT Casino Experience
          </p>
          <p className="text-sm md:text-base text-[#ff69b4]/70 max-w-xl">
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
                <button className="px-8 py-4 rounded-2xl border-2 border-[#ff1493]/50 text-[#ff69b4] font-black text-lg hover:bg-[#ff1493]/10 transition-colors">
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
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff1493] to-[#ffd700]">BARBIEFUN-GAME</span>
              </h2>
              <p className="text-[#ffb6c1] text-base md:text-lg leading-relaxed">
                Welcome to BARBIEFUN-GAME, an exclusive Web3 gaming experience where luck, fun, and rewards come together.
                Inspired by the exciting 777 &amp; Cheese concept, players spin the reels, collect Cheese Points,
                unlock bonus rewards, and chase the legendary 777 Jackpot.
              </p>
              <p className="text-[#ffb6c1] text-base md:text-lg leading-relaxed mt-4">
                This game is exclusively available to AFRICA NFT holders. Simply connect your wallet,
                verify your NFT ownership, and start playing.
              </p>
              <p className="mt-6 text-xl font-black text-[#ffd700]" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
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
              { icon: '🎰', title: '777 Jackpot', desc: 'Match three 7 symbols to trigger the legendary Mega Jackpot and claim the entire pool.' },
              { icon: '🧀', title: 'Cheese Points', desc: 'Collect Cheese Points on every spin. Redeem them for powerful bonus spins.' },
              { icon: '🔥', title: 'Win Streaks', desc: 'Build consecutive wins to activate streak multipliers and amplify your rewards.' },
              { icon: '🏆', title: 'Leaderboard', desc: 'Compete against top AFRICA NFT holders worldwide and prove your luck.' },
              { icon: '🎁', title: 'Daily Rewards', desc: 'Log in every day to claim free coins and Cheese Points. Don\'t break the streak.' },
              { icon: '🛡️', title: 'NFT Exclusive', desc: 'Only verified AFRICA NFT holders can enter the lucky kingdom. True Web3 exclusivity.' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="glass-card rounded-2xl p-6 hover:border-[#ff1493]/60 hover:shadow-[0_0_20px_rgba(255,20,147,0.2)] transition-all h-full">
                  <div className="text-4xl mb-3">{f.icon}</div>
                  <h3 className="font-black text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-[#ffb6c1] text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
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
              'Connect your wallet (MetaMask, Phantom, or Backpack)',
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
                    <p className="text-white font-semibold">{step}</p>
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
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ff1493]/20 border border-[#ff1493]/40 flex items-center justify-center text-xs font-bold text-[#ff69b4]">{i + 1}</span>
                    <p className="text-[#ffb6c1] text-sm pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-black text-[#ffd700] text-center mb-4 uppercase tracking-widest text-sm">Paytable</h3>
                <div className="space-y-3 text-sm font-mono">
                  {[
                    { combo: '7️⃣7️⃣7️⃣', reward: 'MEGA JACKPOT', color: 'text-[#ffd700]' },
                    { combo: '🧀🧀🧀', reward: '777 coins', color: 'text-white' },
                    { combo: '👑👑👑', reward: '500 coins', color: 'text-white' },
                    { combo: '🍷🍷🍷', reward: '200 coins', color: 'text-white' },
                    { combo: '🎀🎀🎀', reward: '100 coins', color: 'text-white' },
                    { combo: 'Any 2x 7️⃣', reward: '50 coins', color: 'text-[#ff69b4]' },
                    { combo: 'Any Cheese', reward: '+1 Cheese Point', color: 'text-[#ff69b4]' },
                  ].map(r => (
                    <div key={r.combo} className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="tracking-widest">{r.combo}</span>
                      <span className={`font-bold ${r.color}`}>{r.reward}</span>
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
                  <div className="text-3xl md:text-5xl font-black text-[#ffd700]" style={{ textShadow: '0 0 15px rgba(255,215,0,0.5)' }}>
                    <AnimCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[#ffb6c1] text-xs md:text-sm mt-1 font-semibold uppercase tracking-widest">{s.label}</div>
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
                  <tr className="border-b border-[#ff1493]/20 text-[#ff69b4] text-xs uppercase tracking-widest">
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-right">High Score</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Winnings</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard && leaderboard.length > 0 ? leaderboard.map((p, i) => (
                    <tr key={p.walletAddress} className="border-b border-white/5 hover:bg-[#ff1493]/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`font-black ${i === 0 ? 'text-[#ffd700]' : i === 1 ? 'text-[#C0C0C0]' : i === 2 ? 'text-[#CD7F32]' : 'text-white/60'}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-white">
                        {p.nickname || truncate(p.walletAddress)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#ffd700]">{(p.highScore ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-[#ffb6c1] hidden sm:table-cell">{(p.totalWinnings ?? 0).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[#ff69b4]/50">No players yet — be the first!</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-4 text-center border-t border-[#ff1493]/10">
                <Link href="/leaderboard">
                  <button className="text-[#ff69b4] text-sm font-bold hover:text-white transition-colors">
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
                {['Twitter / X', 'Discord', 'Telegram'].map(s => (
                  <span key={s} className="block text-[#ffb6c1]/70 text-sm">{s}</span>
                ))}
              </div>
            </div>
            {/* Support */}
            <div>
              <h4 className="font-black text-white text-sm mb-3 uppercase tracking-widest">Support</h4>
              <div className="space-y-2">
                {['FAQ', 'Game Rules', 'Contact'].map(s => (
                  <span key={s} className="block text-[#ffb6c1]/70 text-sm">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-[#ff1493]/10 pt-6 text-center">
            <p className="text-[#ff69b4]/30 text-xs">
              © 2024 BARBIEFUN-GAME. All rights reserved. Built on X1 Blockchain.
            </p>
          </div>
        </div>
      </footer>

      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
