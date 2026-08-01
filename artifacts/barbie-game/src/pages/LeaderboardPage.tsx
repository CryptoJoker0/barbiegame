import { useState } from 'react';
import { useGetLeaderboard, getGetLeaderboardQueryKey } from '@workspace/api-client-react';
import { useWallet } from '@/context/WalletContext';
import type { GetLeaderboardParams } from '@workspace/api-client-react';

type SortBy = 'highScore' | 'totalWinnings' | 'totalSpins';

function truncate(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}`; }

function RankBadge({ rank }: { rank: number }) {
  if (rank === 0) return <span className="text-xl">🥇</span>;
  if (rank === 1) return <span className="text-xl">🥈</span>;
  if (rank === 2) return <span className="text-xl">🥉</span>;
  return <span className="text-[#ff69b4]/60 font-mono">#{rank + 1}</span>;
}

const TABS: { label: string; value: SortBy }[] = [
  { label: 'High Score', value: 'highScore' },
  { label: 'Total Winnings', value: 'totalWinnings' },
  { label: 'Total Spins', value: 'totalSpins' },
];

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortBy>('highScore');
  const [limit, setLimit] = useState(20);
  const { walletAddress } = useWallet();

  const params: GetLeaderboardParams = { sortBy, limit };
  const { data, isLoading } = useGetLeaderboard(params, {
    query: { queryKey: getGetLeaderboardQueryKey(params) },
  });

  return (
    <div className="min-h-screen bg-transparent px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff1493] to-[#ffd700] mb-2">
            Leaderboard
          </h1>
          <p className="text-[#ff69b4]/70 text-sm">Top AFRICA NFT holders competing for glory</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[#ff1493]/5 p-1.5 rounded-xl border border-[#ff1493]/20 w-fit mx-auto">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setSortBy(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                sortBy === t.value
                  ? 'bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                  : 'text-[#ff69b4]/70 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ff1493]/20 text-[#ff69b4] text-xs uppercase tracking-widest">
                <th className="px-4 md:px-6 py-4 text-left">Rank</th>
                <th className="px-4 md:px-6 py-4 text-left">Player</th>
                <th className="px-4 md:px-6 py-4 text-right">High Score</th>
                <th className="px-4 md:px-6 py-4 text-right hidden sm:table-cell">Winnings</th>
                <th className="px-4 md:px-6 py-4 text-right hidden md:table-cell">Spins</th>
                <th className="px-4 md:px-6 py-4 text-right hidden md:table-cell">Wins</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Skeleton rows
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className={`px-4 md:px-6 py-4 ${j >= 4 ? 'hidden md:table-cell' : j >= 3 ? 'hidden sm:table-cell' : ''}`}>
                        <div className="h-4 bg-[#ff1493]/10 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data && data.length > 0 ? (
                data.map((p, i) => {
                  const isMe = walletAddress?.toLowerCase() === p.walletAddress.toLowerCase();
                  return (
                    <tr
                      key={p.walletAddress}
                      className={`border-b border-white/5 transition-colors ${
                        isMe ? 'bg-[#ff1493]/10 border-[#ff1493]/30' : 'hover:bg-[#ff1493]/5'
                      }`}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <RankBadge rank={i} />
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white text-sm">{p.nickname || truncate(p.walletAddress)}</span>
                          {isMe && <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#ff1493]/20 text-[#ff69b4] font-bold">You</span>}
                        </div>
                        {p.nickname && <span className="text-[#ff69b4]/40 text-xs font-mono">{truncate(p.walletAddress)}</span>}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right font-bold text-[#ffd700]">{(p.highScore ?? 0).toLocaleString()}</td>
                      <td className="px-4 md:px-6 py-4 text-right text-[#ffb6c1] hidden sm:table-cell">{(p.totalWinnings ?? 0).toLocaleString()}</td>
                      <td className="px-4 md:px-6 py-4 text-right text-[#ff69b4]/60 hidden md:table-cell">{(p.totalSpins ?? 0).toLocaleString()}</td>
                      <td className="px-4 md:px-6 py-4 text-right text-[#ff69b4]/60 hidden md:table-cell">{(p.totalWins ?? 0).toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[#ff69b4]/40">
                    No players yet. Be the first to spin!
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {data && data.length >= limit && (
            <div className="p-4 text-center border-t border-[#ff1493]/10">
              <button
                onClick={() => setLimit(l => l + 20)}
                className="text-[#ff69b4] text-sm font-bold hover:text-white transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
