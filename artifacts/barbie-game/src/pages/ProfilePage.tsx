import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import {
  useGetPlayer, useGetPlayerStats, useGetAchievements, useGetDailyRewardStatus,
  useUpsertPlayer, useClaimDailyReward,
  getGetPlayerQueryKey, getGetPlayerStatsQueryKey, getGetAchievementsQueryKey, getGetDailyRewardStatusQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Check, Gift, ShieldCheck, ShieldX, Gamepad2, Trophy, XCircle, BarChart3 } from 'lucide-react';
import { WalletModal } from '@/components/WalletModal';

function truncate(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}`; }

// ── NFT Card ──────────────────────────────────────────────────────────────────
function NftCard({ address, hasNft }: { address: string; hasNft: boolean }) {
  const [nftData, setNftData] = useState<{ balance: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    fetch(`/api/nft/verify/${address}`)
      .then(r => r.json())
      .then(d => setNftData({ balance: d.balance ?? (d.hasNft ? 1 : 0) }))
      .catch(() => setNftData({ balance: 0 }))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <div className={`rounded-2xl border p-5 ${hasNft ? 'border-[#ffd700]/40 bg-[#ffd700]/5' : 'border-[#ff1493]/15 bg-[#110520]'}`}>
      <div className="flex items-center gap-3 mb-4">
        {hasNft
          ? <ShieldCheck className="w-5 h-5 text-[#ffd700]" />
          : <ShieldX className="w-5 h-5 text-[#ff69b4]/40" />
        }
        <h3 className="font-black text-white text-sm uppercase tracking-widest">AFRICA X1 NFT</h3>
      </div>

      {loading ? (
        <div className="h-16 flex items-center justify-center">
          <div className="text-[#ff69b4]/40 text-sm animate-pulse">Checking on-chain…</div>
        </div>
      ) : hasNft ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            {/* NFT visual */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff1493] to-[#ffd700] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,20,147,0.5)] flex-shrink-0">
              🎭
            </div>
            <div>
              <div className="text-white font-black text-lg">{nftData?.balance ?? 1}× AFRICA NFT</div>
              <div className="text-[#ffd700]/70 text-xs font-bold mt-0.5">Verified on X1 Blockchain</div>
              <div className="text-[#ff69b4]/50 text-xs mt-0.5 font-mono">{truncate(address)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-900/20 border border-green-700/30">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span className="text-green-400 text-xs font-bold">Access granted to all BARBIEFUN games</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[#ff69b4]/60 text-sm">No AFRICA X1 NFT found in this wallet.</p>
          <a
            href="https://x.com/BARBIEFUNV2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black text-sm hover:opacity-90 transition-opacity"
          >
            Mint AFRICA X1 NFT ↗
          </a>
        </div>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, color = 'text-[#ffd700]',
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#ff1493]/15 bg-[#110520] p-4 flex flex-col gap-2">
      <div className={`${color} opacity-80`}>{icon}</div>
      <div className={`text-2xl font-black ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-[#ff69b4]/50 text-xs uppercase tracking-widest font-bold">{label}</div>
    </div>
  );
}

// ── Achievement badges ────────────────────────────────────────────────────────
const ACHIEVEMENT_DEFS: Record<string, { icon: string; title: string; desc: string }> = {
  FIRST_SPIN:     { icon: '🎰', title: 'First Spin',     desc: 'Spun the reels for the first time' },
  FIRST_WIN:      { icon: '💰', title: 'First Win',      desc: 'Won your first coins' },
  JACKPOT_HUNTER: { icon: '👑', title: 'Jackpot Hunter', desc: 'Hit the legendary 777 jackpot' },
  CHEESE_LOVER:   { icon: '🧀', title: 'Cheese Lover',   desc: 'Collected 10 Cheese Points' },
  HOT_STREAK:     { icon: '🔥', title: 'Hot Streak',     desc: 'Built a 5-win streak' },
  VETERAN:        { icon: '🎖️', title: 'Veteran',        desc: 'Spun 100 times' },
  HIGH_ROLLER:    { icon: '💎', title: 'High Roller',    desc: 'Won 500+ coins in a single spin' },
  DAILY_DEVOTEE:  { icon: '🌅', title: 'Daily Devotee',  desc: 'Claimed 7 daily rewards' },
};
const ALL_ACHIEVEMENT_KEYS = Object.keys(ACHIEVEMENT_DEFS);

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { walletAddress, hasNft, isConnected } = useWallet();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  const addr = walletAddress ?? '';
  const enabled = !!addr;

  const { data: player }       = useGetPlayer(addr,       { query: { enabled, queryKey: getGetPlayerQueryKey(addr) } });
  const { data: stats }        = useGetPlayerStats(addr,  { query: { enabled, queryKey: getGetPlayerStatsQueryKey(addr) } });
  const { data: achievements } = useGetAchievements(addr, { query: { enabled, queryKey: getGetAchievementsQueryKey(addr) } });
  const { data: dailyStatus }  = useGetDailyRewardStatus(addr, { query: { enabled, queryKey: getGetDailyRewardStatusQueryKey(addr) } });

  const claimDaily = useClaimDailyReward();
  const upsertPlayer = useUpsertPlayer();
  const [nicknameEditing, setNicknameEditing] = useState(false);
  const [nickname, setNickname] = useState('');

  const unlockedKeys = new Set(achievements?.map(a => a.achievementKey) ?? []);
  const totalSpins = stats?.totalSpins ?? 0;
  const totalWins  = stats?.totalWins  ?? 0;
  const totalLosses = Math.max(0, totalSpins - totalWins);
  const winRate = totalSpins > 0 ? Math.round((totalWins / totalSpins) * 100) : 0;

  function copyAddress() {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveNickname() {
    if (!nickname.trim()) { setNicknameEditing(false); return; }
    upsertPlayer.mutate(
      { data: { address: addr, nickname: nickname.trim() }, params: { address: addr } } as any,
      {
        onSuccess: () => {
          setNicknameEditing(false);
          qc.invalidateQueries({ queryKey: getGetPlayerQueryKey(addr) });
        },
      }
    );
  }

  function handleClaimDaily() {
    claimDaily.mutate(
      { params: { address: addr } } as any,
      {
        onSuccess: (data: any) => {
          setClaimMsg(`+${data.coinsAwarded} Coins  +${data.cheeseAwarded} Cheese claimed!`);
          qc.invalidateQueries({ queryKey: getGetDailyRewardStatusQueryKey(addr) });
          setTimeout(() => setClaimMsg(null), 4000);
        },
      }
    );
  }

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
        <div className="rounded-3xl border border-[#ff1493]/30 bg-[#110520] p-10 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-white mb-3">Connect Your Wallet</h2>
          <p className="text-[#ff69b4]/70 text-sm mb-6">
            Connect a Phantom, Backpack, WE Wallet, or X1 Mobile wallet to view your profile, NFT, and game stats.
          </p>
          <button
            onClick={() => setShowWalletModal(true)}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,20,147,0.4)]"
          >
            Connect Wallet
          </button>
        </div>
        {showWalletModal && <WalletModal onClose={() => setShowWalletModal(false)} />}
      </div>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,rgba(255,20,147,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 py-10 relative z-10 space-y-8">

        {/* ── Profile header ─────────────────────────────────────────────── */}
        <div className="rounded-3xl border border-[#ff1493]/25 bg-[#110520] p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff1493] to-[#ffd700] flex items-center justify-center text-2xl font-black text-white flex-shrink-0 shadow-[0_0_20px_rgba(255,20,147,0.4)]">
              {(player?.nickname ?? addr).slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              {nicknameEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveNickname();
                      if (e.key === 'Escape') setNicknameEditing(false);
                    }}
                    placeholder="Enter nickname…"
                    maxLength={30}
                    className="flex-1 bg-[#0d0013] border border-[#ff1493]/50 rounded-lg px-3 py-1.5 text-white text-sm font-bold outline-none focus:border-[#ff1493]"
                  />
                  <button onClick={saveNickname} className="px-3 py-1.5 rounded-lg bg-[#ff1493] text-white text-xs font-black">Save</button>
                  <button onClick={() => setNicknameEditing(false)} className="text-[#ff69b4]/60 text-xs">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white truncate">
                    {player?.nickname ?? 'Anonymous Player'}
                  </h1>
                  <button
                    onClick={() => { setNickname(player?.nickname ?? ''); setNicknameEditing(true); }}
                    className="text-xs text-[#ff69b4]/40 hover:text-[#ff69b4] transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[#ff69b4]/50 text-sm">{truncate(addr)}</span>
                <button onClick={copyAddress} className="text-[#ff69b4]/30 hover:text-[#ff69b4] transition-colors">
                  {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              {hasNft && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffd700] animate-pulse" />
                  <span className="text-[#ffd700] text-xs font-bold">AFRICA X1 NFT Holder</span>
                </div>
              )}
            </div>

            {/* Daily reward */}
            <div className="flex-shrink-0">
              {dailyStatus?.canClaim ? (
                <button
                  onClick={handleClaimDaily}
                  disabled={claimDaily.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black text-sm hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                >
                  <Gift className="h-4 w-4" />
                  {claimDaily.isPending ? 'Claiming…' : 'Daily Reward'}
                </button>
              ) : (
                <div className="px-4 py-2.5 rounded-xl border border-[#ff69b4]/15 text-[#ff69b4]/30 text-sm font-bold text-center">
                  <Gift className="h-4 w-4 mx-auto mb-0.5 opacity-40" />
                  <div className="text-xs">Claimed today</div>
                </div>
              )}
            </div>
          </div>

          {claimMsg && (
            <div className="mt-4 p-3 rounded-xl bg-green-900/30 border border-green-700/40 text-green-400 text-sm font-bold text-center">
              🎁 {claimMsg}
            </div>
          )}
        </div>

        {/* ── NFT Status ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#ffd700]" /> My NFT
          </h2>
          <NftCard address={addr} hasNft={hasNft} />
        </div>

        {/* ── Game Stats ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#ff1493]" /> Game Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={<Gamepad2 className="w-5 h-5" />}
              label="Games Played"
              value={totalSpins}
              color="text-[#ff69b4]"
            />
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Wins"
              value={totalWins}
              color="text-[#ffd700]"
            />
            <StatCard
              icon={<XCircle className="w-5 h-5" />}
              label="Losses"
              value={totalLosses}
              color="text-red-400"
            />
            <StatCard
              icon={<BarChart3 className="w-5 h-5" />}
              label="Win Rate"
              value={`${winRate}%`}
              color="text-[#ff1493]"
            />
          </div>

          {/* Secondary stats row */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="rounded-2xl border border-[#ff1493]/10 bg-[#110520] p-4 text-center">
              <div className="text-[#ffd700] font-black text-xl">{(stats?.highScore ?? 0).toLocaleString()}</div>
              <div className="text-[#ff69b4]/50 text-xs uppercase tracking-widest font-bold mt-1">High Score</div>
            </div>
            <div className="rounded-2xl border border-[#ff1493]/10 bg-[#110520] p-4 text-center">
              <div className="text-[#ffd700] font-black text-xl">{(stats?.totalWinnings ?? 0).toLocaleString()}</div>
              <div className="text-[#ff69b4]/50 text-xs uppercase tracking-widest font-bold mt-1">Total Coins Won</div>
            </div>
            <div className="rounded-2xl border border-[#ff1493]/10 bg-[#110520] p-4 text-center">
              <div className="text-[#ffd700] font-black text-xl">{stats?.streakRecord ?? 0}</div>
              <div className="text-[#ff69b4]/50 text-xs uppercase tracking-widest font-bold mt-1">Best Streak</div>
            </div>
          </div>
        </div>

        {/* ── Achievements ───────────────────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#ffd700]" /> Achievements
            <span className="text-sm font-semibold text-[#ff69b4]/50">
              {unlockedKeys.size}/{ALL_ACHIEVEMENT_KEYS.length}
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALL_ACHIEVEMENT_KEYS.map(key => {
              const def = ACHIEVEMENT_DEFS[key];
              const unlocked = unlockedKeys.has(key);
              return (
                <div
                  key={key}
                  className={`rounded-2xl p-4 flex flex-col items-center text-center border transition-all ${
                    unlocked
                      ? 'border-[#ffd700]/40 bg-[#ffd700]/5 shadow-[0_0_12px_rgba(255,215,0,0.1)]'
                      : 'border-[#ff1493]/10 bg-[#110520] opacity-40 grayscale'
                  }`}
                >
                  <span className="text-3xl mb-2">{def.icon}</span>
                  <span className="font-black text-white text-xs">{def.title}</span>
                  <span className="text-[#ffb6c1]/60 text-xs mt-1 leading-tight">{def.desc}</span>
                  {unlocked && (
                    <span className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-[#ffd700]/10 text-[#ffd700] font-bold border border-[#ffd700]/20">
                      Unlocked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Cheese balance ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#ff1493]/15 bg-[#110520] p-5 flex items-center gap-4">
          <span className="text-4xl">🧀</span>
          <div>
            <div className="text-white font-black text-xl">{(stats?.cheeseCollected ?? 0).toLocaleString()} Cheese Points</div>
            <div className="text-[#ff69b4]/50 text-sm">Collected across all games</div>
          </div>
        </div>

      </div>
    </div>
  );
}
