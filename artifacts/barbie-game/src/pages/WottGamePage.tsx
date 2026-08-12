import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'wouter';
import wottTicket from '@/assets/wott-ticket.png';
import barbieLogo from '@/assets/barbie-logo.png';
import { useWallet } from '@/context/WalletContext';

// ── Card types ────────────────────────────────────────────────────────────────
const SUITS = ['♥', '♦', '♣', '♠'] as const;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
const RANK_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};
const RED_SUITS = new Set(['♥', '♦']);

type Suit = typeof SUITS[number];
type Rank = typeof RANKS[number];
interface Card { rank: Rank; suit: Suit; value: number; }

function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, value: RANK_VALUES[rank] });
    }
  }
  return shuffle(deck);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Card face component ───────────────────────────────────────────────────────
function CardFace({ card }: { card: Card }) {
  const isRed = RED_SUITS.has(card.suit);
  return (
    <div className="w-full h-full rounded-2xl bg-white flex flex-col justify-between p-3 select-none shadow-inner">
      <div className={`text-left font-black text-2xl leading-none ${isRed ? 'text-[#e91e8c]' : 'text-[#1a0a1a]'}`}>
        <div>{card.rank}</div>
        <div className="text-lg">{card.suit}</div>
      </div>
      <div className={`text-center text-5xl font-black leading-none ${isRed ? 'text-[#e91e8c]' : 'text-[#1a0a1a]'}`}>
        {card.suit}
      </div>
      <div className={`text-right font-black text-2xl leading-none rotate-180 ${isRed ? 'text-[#e91e8c]' : 'text-[#1a0a1a]'}`}>
        <div>{card.rank}</div>
        <div className="text-lg">{card.suit}</div>
      </div>
    </div>
  );
}

// ── Card back component ───────────────────────────────────────────────────────
function CardBack() {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner">
      <img src={wottTicket} alt="Card Back" className="w-full h-full object-cover" />
    </div>
  );
}

// ── Flippable card ────────────────────────────────────────────────────────────
function FlipCard({ card, revealed, glow }: { card: Card | null; revealed: boolean; glow?: 'win' | 'lose' | 'tie' | null }) {
  const glowClass =
    glow === 'win' ? 'shadow-[0_0_40px_8px_rgba(34,197,94,0.8)]'
    : glow === 'lose' ? 'shadow-[0_0_40px_8px_rgba(239,68,68,0.8)]'
    : glow === 'tie' ? 'shadow-[0_0_40px_8px_rgba(251,191,36,0.8)]'
    : 'shadow-[0_0_20px_rgba(255,20,147,0.4)]';

  return (
    <div
      className={`relative w-40 h-56 md:w-48 md:h-68 transition-all duration-700 ${glowClass} rounded-2xl`}
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Back */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
          <CardBack />
        </div>
        {/* Front */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          {card ? <CardFace card={card} /> : <CardBack />}
        </div>
      </div>
    </div>
  );
}

// ── Deck pile ─────────────────────────────────────────────────────────────────
function DeckPile({ count, label }: { count: number; label: string }) {
  const shown = Math.min(count, 4);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 80, height: 110 }}>
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-xl overflow-hidden border border-[#ff1493]/30"
            style={{ width: 76, height: 106, top: -i * 2, left: i * 1, zIndex: i }}
          >
            <img src={wottTicket} alt="deck" className="w-full h-full object-cover" />
          </div>
        ))}
        {count === 0 && (
          <div className="absolute inset-0 rounded-xl border-2 border-dashed border-[#ff1493]/20 flex items-center justify-center">
            <span className="text-[#ff69b4]/30 text-xs font-bold">EMPTY</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <span className="text-[#ff69b4] font-black text-sm">{count}</span>
        <span className="text-[#ff69b4]/50 text-xs ml-1">cards</span>
      </div>
      <span className="text-[#ff69b4]/60 text-xs font-bold tracking-widest uppercase">{label}</span>
    </div>
  );
}

// ── Coin counter ──────────────────────────────────────────────────────────────
function CoinDisplay({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl bg-[#110520] border border-[#ff1493]/20">
      <span className="text-xl">{icon}</span>
      <span className="text-xl font-black text-[#ffd700]">{value.toLocaleString()}</span>
      <span className="text-[10px] text-[#ff69b4]/60 font-bold tracking-widest uppercase">{label}</span>
    </div>
  );
}

// ── Result banner ─────────────────────────────────────────────────────────────
function ResultBanner({ result, playerCard, aiCard }: {
  result: 'win' | 'lose' | 'tie' | null;
  playerCard: Card | null;
  aiCard: Card | null;
}) {
  if (!result || !playerCard || !aiCard) return null;

  const diff = playerCard.value - aiCard.value;
  const msg =
    result === 'win' ? `You win! ${playerCard.rank}${playerCard.suit} beats ${aiCard.rank}${aiCard.suit} 🎉`
    : result === 'lose' ? `AI wins. ${aiCard.rank}${aiCard.suit} beats ${playerCard.rank}${playerCard.suit} 💀`
    : `Tie! Both played ${playerCard.rank}${playerCard.suit} — no coins exchanged 🤝`;

  const color =
    result === 'win' ? 'from-green-500/30 to-green-900/20 border-green-500/50 text-green-300'
    : result === 'lose' ? 'from-red-500/30 to-red-900/20 border-red-500/50 text-red-300'
    : 'from-yellow-500/30 to-yellow-900/20 border-yellow-500/50 text-yellow-300';

  return (
    <div className={`px-6 py-3 rounded-2xl border bg-gradient-to-r ${color} text-center font-black text-sm md:text-base animate-bounce`}>
      {msg}
    </div>
  );
}

// ── Game state ────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'flipping' | 'revealed' | 'gameover';

const STARTING_COINS = 200;
const BET_AMOUNT = 10;
const STARTING_DECK_SIZE = 26; // each player gets half the deck

export default function WottGamePage() {
  const { walletAddress } = useWallet();

  // Decks
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [aiDeck, setAiDeck] = useState<Card[]>([]);
  // Current cards in play
  const [playerCard, setPlayerCard] = useState<Card | null>(null);
  const [aiCard, setAiCard] = useState<Card | null>(null);
  // Flip state
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<'win' | 'lose' | 'tie' | null>(null);
  // Stats
  const [coins, setCoins] = useState(STARTING_COINS);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [ties, setTies] = useState(0);
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);

  // Init
  useEffect(() => { initGame(); }, []);

  function initGame() {
    const full = makeDeck();
    setPlayerDeck(full.slice(0, STARTING_DECK_SIZE));
    setAiDeck(full.slice(STARTING_DECK_SIZE, STARTING_DECK_SIZE * 2));
    setPlayerCard(null);
    setAiCard(null);
    setPhase('idle');
    setResult(null);
    setCoins(STARTING_COINS);
    setWins(0);
    setLosses(0);
    setTies(0);
    setRound(0);
    setStreak(0);
  }

  const flip = useCallback(() => {
    if (phase !== 'idle') return;
    if (playerDeck.length === 0 || aiDeck.length === 0) return;

    const [pCard, ...pRest] = playerDeck;
    const [aCard, ...aRest] = aiDeck;

    setPlayerCard(pCard);
    setAiCard(aCard);
    setPhase('flipping');
    setResult(null);

    setTimeout(() => {
      setPhase('revealed');
      const roundResult: 'win' | 'lose' | 'tie' =
        pCard.value > aCard.value ? 'win'
        : pCard.value < aCard.value ? 'lose'
        : 'tie';
      setResult(roundResult);
      setRound(r => r + 1);

      if (roundResult === 'win') {
        setCoins(c => c + BET_AMOUNT);
        setWins(w => w + 1);
        setStreak(s => s + 1);
      } else if (roundResult === 'lose') {
        setCoins(c => Math.max(0, c - BET_AMOUNT));
        setLosses(l => l + 1);
        setStreak(0);
      } else {
        setTies(t => t + 1);
      }

      setPlayerDeck(pRest);
      setAiDeck(aRest);

      // Check game over
      if (pRest.length === 0 || aRest.length === 0) {
        setTimeout(() => setPhase('gameover'), 1200);
      } else {
        setTimeout(() => setPhase('idle'), 1800);
      }
    }, 700);
  }, [phase, playerDeck, aiDeck]);

  const playerGlow = phase === 'revealed' ? (result === 'win' ? 'win' : result === 'lose' ? 'lose' : 'tie') : null;
  const aiGlow = phase === 'revealed' ? (result === 'lose' ? 'win' : result === 'win' ? 'lose' : 'tie') : null;

  const winRate = round > 0 ? Math.round((wins / round) * 100) : 0;
  const isGameOver = phase === 'gameover';
  const playerWon = wins > losses;

  return (
    <div className="min-h-screen flex flex-col text-white font-['Outfit',sans-serif]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#ff1493]/20 bg-[#0d0013]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src={barbieLogo} alt="BARBIEFUN" className="h-8 drop-shadow-[0_0_8px_rgba(255,20,147,0.7)]" />
          <div>
            <div className="font-black text-white text-sm leading-none">BARBIE-WOTT</div>
            <div className="text-[#ff69b4]/60 text-[10px] font-bold tracking-widest">HUMAN VS AI</div>
          </div>
        </div>
        <Link href="/games">
          <button className="px-4 py-2 rounded-xl border border-[#ff1493]/30 text-[#ff69b4] text-xs font-bold hover:bg-[#ff1493]/10 transition-colors">
            ← Games
          </button>
        </Link>
      </header>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-4 border-b border-[#ff1493]/10 bg-[#0d0013]/40">
        <CoinDisplay label="Coins" value={coins} icon="💰" />
        <CoinDisplay label="Round" value={round} icon="🎲" />
        <CoinDisplay label="Wins" value={wins} icon="✅" />
        <CoinDisplay label="Losses" value={losses} icon="❌" />
        {streak >= 2 && (
          <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ff1493]/30 to-[#ffd700]/30 border border-[#ffd700]/50 text-[#ffd700] font-black text-sm animate-pulse">
            🔥 {streak} WIN STREAK!
          </div>
        )}
      </div>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-8">

        {/* Ticket intro card (back) when idle on round 0 */}
        {round === 0 && phase === 'idle' && (
          <div className="max-w-sm text-center space-y-4 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff1493]/40 bg-[#ff1493]/10 text-xs text-[#ff69b4] font-mono font-bold tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#ff1493] animate-pulse inline-block" />
              HUMAN VS AI CARD BATTLE
            </div>
            <p className="text-[#ffb6c1]/70 text-sm">
              Flip cards against the AI — highest card wins the round. Earn <span className="text-[#ffd700] font-bold">+{BET_AMOUNT} coins</span> per win, lose <span className="text-red-400 font-bold">{BET_AMOUNT}</span> per loss. Cards display the BARBIE-WOTT ticket as their back cover.
            </p>
          </div>
        )}

        {/* Battle arena */}
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">

          {/* AI side */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#ff69b4]/70 font-bold">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
              AI OPPONENT
              {phase === 'flipping' && <span className="text-[10px] animate-pulse text-purple-400">thinking…</span>}
            </div>
            <FlipCard
              card={aiCard}
              revealed={phase === 'revealed' || phase === 'gameover'}
              glow={aiGlow as any}
            />
            <DeckPile count={aiDeck.length} label="AI Deck" />
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-4 w-full max-w-xs">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ff1493]/40 to-transparent" />
            <span className="text-2xl font-black text-[#ff69b4]/60">VS</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ff1493]/40 to-transparent" />
          </div>

          {/* Player side */}
          <div className="flex flex-col items-center gap-3">
            <DeckPile count={playerDeck.length} label="Your Deck" />
            <FlipCard
              card={playerCard}
              revealed={phase === 'revealed' || phase === 'gameover'}
              glow={playerGlow as any}
            />
            <div className="flex items-center gap-2 text-sm text-[#ff69b4]/70 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#ff1493] inline-block animate-pulse" />
              YOU
            </div>
          </div>
        </div>

        {/* Result banner */}
        {phase === 'revealed' && (
          <ResultBanner result={result} playerCard={playerCard} aiCard={aiCard} />
        )}

        {/* Win rate bar */}
        {round > 0 && (
          <div className="w-full max-w-xs space-y-1">
            <div className="flex justify-between text-xs text-[#ff69b4]/60 font-bold">
              <span>Win Rate</span>
              <span>{winRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#ff1493]/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff1493] to-[#ffd700] rounded-full transition-all duration-500"
                style={{ width: `${winRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Action button */}
        {!isGameOver && (
          <button
            onClick={flip}
            disabled={phase !== 'idle' || playerDeck.length === 0}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black text-lg hover:opacity-90 hover:scale-[1.03] transition-all shadow-[0_0_30px_rgba(255,20,147,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          >
            {phase === 'idle' ? '🎴 Flip Card' : phase === 'flipping' ? 'Flipping…' : 'Next Round…'}
          </button>
        )}

        {/* Game Over overlay */}
        {isGameOver && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-[#110520] border border-[#ff1493]/40 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-[0_0_60px_rgba(255,20,147,0.4)]">
              <div className="text-6xl">{playerWon ? '🏆' : '💀'}</div>
              <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff1493] to-[#ffd700]">
                {playerWon ? 'YOU WIN!' : wins === losses ? 'IT\'S A DRAW!' : 'AI WINS!'}
              </h2>
              <div className="grid grid-cols-3 gap-3 py-4 border-y border-[#ff1493]/15">
                <div>
                  <div className="text-2xl font-black text-green-400">{wins}</div>
                  <div className="text-xs text-[#ff69b4]/60 font-bold">WINS</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-red-400">{losses}</div>
                  <div className="text-xs text-[#ff69b4]/60 font-bold">LOSSES</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-yellow-400">{ties}</div>
                  <div className="text-xs text-[#ff69b4]/60 font-bold">TIES</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-[#ffb6c1]/70">Final Coins: <span className="text-[#ffd700] font-black">{coins.toLocaleString()}</span></div>
                <div className="text-sm text-[#ffb6c1]/70">Win Rate: <span className="text-white font-black">{winRate}%</span></div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={initGame}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ffd700] text-white font-black text-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,20,147,0.4)]"
                >
                  Play Again
                </button>
                <Link href="/games">
                  <button className="w-full py-3 rounded-2xl border border-[#ff1493]/30 text-[#ff69b4] font-bold text-sm hover:bg-[#ff1493]/10 transition-colors">
                    Back to Games
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer bar */}
      <footer className="flex items-center justify-between px-4 md:px-8 py-3 border-t border-[#ff1493]/15 bg-[#0d0013]/60 text-xs">
        <div className="flex items-center gap-2 text-green-400 font-bold">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          AFRICA NFT Verified
        </div>
        <div className="text-[#ff69b4]/40 font-mono">
          BARBIE-WOTT · Human vs AI · Min Bet {BET_AMOUNT} XNT
        </div>
      </footer>
    </div>
  );
}
