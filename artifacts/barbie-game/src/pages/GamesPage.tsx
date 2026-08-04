import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import game777 from '@/assets/game-777.jpg';
import gamePrediction from '@/assets/game-prediction.jpg';
import gameWott from '@/assets/game-wott.jpg';

interface Game {
  id: string;
  name: string;
  shortDescription: string;
  entryFee: string;
  feeCurrency: string;
  nftRequired: boolean;
  isActive: boolean;
  imageUrl: string | null;
}

// Map game IDs to imported assets for reliable bundling
const GAME_IMAGES: Record<string, string> = {
  'slot-machine': game777,
  'barbie-prediction': gamePrediction,
  'barbie-wott': gameWott,
};

function GameCard({ game }: { game: Game }) {
  const img = GAME_IMAGES[game.id] ?? game.imageUrl ?? barbieCover;
  const fee = parseFloat(game.entryFee);
  const feeDisplay = fee === 0 ? 'FREE' : `${Number(game.entryFee).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${game.feeCurrency}`;

  return (
    <div className="group relative flex flex-col rounded-3xl overflow-hidden border border-[#ff1493]/25 bg-[#110520] hover:border-[#ff1493]/70 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,20,147,0.3)]">
      {/* Image */}
      <div className="relative overflow-hidden bg-[#0d0013]">
        <img
          src={img}
          alt={game.name}
          className="w-full h-56 object-contain p-4 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_30px_rgba(255,20,147,0.6)]"
        />
        {/* NFT badge */}
        {game.nftRequired && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d0013]/90 border border-[#ffd700]/50 text-[#ffd700] text-[10px] font-black tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffd700] animate-pulse inline-block" />
            AFRICA X1 NFT
          </div>
        )}
        {/* Entry fee badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#ff1493]/20 border border-[#ff1493]/50 text-[#ff69b4] text-[10px] font-black tracking-wider">
          {feeDisplay}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3 className="font-black text-white text-lg leading-snug">{game.name}</h3>
        <p className="text-[#9c1a5e]/80 text-sm leading-relaxed flex-1 font-medium">{game.shortDescription}</p>

        {/* Requirements */}
        <div className="flex flex-col gap-1.5 py-3 border-t border-[#ff1493]/10">
          {game.nftRequired && (
            <div className="flex items-center gap-2 text-xs text-[#7a1048]/80 font-semibold">
              <span className="text-[#c8860a]">◆</span>
              Hold at least 1 AFRICA X1 NFT
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-[#7a1048]/80 font-semibold">
            <span className="text-[#e91e8c]">◆</span>
            Entry fee: {feeDisplay}
          </div>
        </div>

        {/* CTA */}
        <Link href={`/games/${game.id}`}>
          <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black text-sm hover:opacity-90 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,20,147,0.4)]">
            Play Now
          </button>
        </Link>
      </div>
    </div>
  );
}

function ComingSoonCard() {
  return (
    <div className="flex flex-col rounded-3xl overflow-hidden border border-[#ff1493]/10 bg-[#110520]/50 opacity-60">
      <div className="h-56 flex items-center justify-center bg-[#0d0013]/60">
        <span className="text-6xl opacity-30">🎮</span>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 rounded-full bg-[#ff1493]/10 w-2/3" />
        <div className="h-4 rounded-full bg-[#ff1493]/5 w-full" />
        <div className="h-4 rounded-full bg-[#ff1493]/5 w-3/4" />
        <div className="mt-2 py-3 rounded-2xl border border-[#ff1493]/20 text-center text-[#ff69b4]/40 text-sm font-black">
          Coming Soon
        </div>
      </div>
    </div>
  );
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/games')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load games');
        return r.json();
      })
      .then(setGames)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-[#7B1818]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,20,147,0.18)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-10 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff1493]/40 bg-[#ff1493]/10 text-xs text-[#ff69b4] font-mono font-bold tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-[#ff1493] animate-pulse inline-block" />
            AFRICA X1 BLOCKCHAIN
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff1493] via-[#ff69b4] to-[#ffd700] mb-4">
            Browse Games
          </h1>
          <p className="text-[#9c1a5e]/80 text-lg max-w-xl mx-auto font-medium">
            Exclusive games for AFRICA NFT holders. Explore freely — connect your wallet when you're ready to play.
          </p>
        </div>
      </div>

      {/* Games grid */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-[#ff69b4] font-bold text-lg animate-pulse">Loading games…</div>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
            {/* Coming soon placeholders */}
            {games.length < 3 && Array.from({ length: 3 - games.length }).map((_, i) => (
              <ComingSoonCard key={`soon-${i}`} />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[#9c1a5e]/70">
          <span className="flex items-center gap-1.5">
            <span className="text-[#ffd700]">◆</span> AFRICA X1 NFT required to play
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#ff1493]">◆</span> Entry fee sent to AFRICA X1 Treasury
          </span>
        </div>
      </div>
    </div>
  );
}
