import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import {
  useGetPlayer, useGetPlayerStats, useGetAchievements, useGetDailyRewardStatus,
  useUpsertPlayer, useClaimDailyReward,
  getGetPlayerQueryKey, getGetPlayerStatsQueryKey, getGetAchievementsQueryKey, getGetDailyRewardStatusQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Check, Gift } from 'lucide-react';

const ACHIEVEMENT_DEFS: Record<string, { icon: string; title: string; desc: string }> = {
  FIRST_SPIN: { icon: '🎰', title: 'First Spin', desc: 'Spun the reels for the first time' },
  FIRST_WIN: { icon: '💰', title: 'First Win', desc: 'Won your first coins' },
  JACKPOT_HUNTER: { icon: '👑', title: 'Jackpot Hunter', desc: 'Hit the legendary 777 jackpot' },
  CHEESE_LOVER: { icon: '🧀', title: 'Cheese Lover', desc: 'Collected 10 Cheese Points' },
  HOT_STREAK: { icon: '🔥', title: 'Hot Streak', desc: 'Built a 5-win streak' },
  VETERAN: { icon: '🎖️', title: 'Veteran', desc: 'Spun 100 times' },
  HIGH_ROLLER: { icon: '💎', title: 'High Roller', desc: 'Won 500+ coins in a single spin' },
  DAILY_DEVOTEE: { icon: '🌅', title: 'Daily Devotee', desc: 'Claimed 7 daily rewards' },
};
const ALL_ACHIEVEMENT_KEYS = Object.keys(ACHIEVEMENT_DEFS);

function truncate(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}`; }

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="text-2xl font-black text-[#ffd700]">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-[#ff69b4] text-xs mt-1 uppercase tracking-widest font-semibold">{label}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { walletAddress, isConnected } = useWallet();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [nickname, setNickname] = useState('');
  const [nicknameEditing, setNicknameEditing] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  const addr = walletAddress ?? '';
  const enabled = !!addr;

  const { data: player } = useGetPlayer(addr, { query: { enabled, queryKey: getGetPlayerQueryKey(addr) } });
  const { data: stats } = useGetPlayerStats(addr, { query: { enabled, queryKey: getGetPlayerStatsQueryKey(addr) } });
  const { data: achievements } = useGetAchievements(addr, { query: { enabled, queryKey: getGetAchievementsQueryKey(addr) } });
  const { data: dailyStatus } = useGetDailyRewardStatus(addr, { query: { enabled, queryKey: getGetDailyRewardStatusQueryKey(addr) } });

  const upsertPlayer = useUpsertPlayer();
  const claimDaily = useClaimDailyReward();

  const unlockedKeys = new Set(achievements?.map(a => a.achievementKey) ?? []);

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
          setClaimMsg(`Claimed! +${data.coinsAwarded} coins, +${data.cheeseAwarded} Cheese`);
          qc.invalidateQueries({ queryKey: getGetDailyRewardStatusQueryKey(addr) });
          setTimeout(() => setClaimMsg(null), 4000);
        },
      }
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0d0013] flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-white mb-2">Connect Wallet</h2>
          <p className="text-[#ff69b4]/70 text-sm">Connect your wallet to view your profile and achievements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0013] px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff1493] to-[#ffd700] flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
              {(player?.nickname ?? addr.slice(0, 2)).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {nicknameEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveNickname(); if (e.key === 'Escape') setNicknameEditing(false); }}
                    placeholder="Enter nickname..."
                    maxLength={30}
                    className="flex-1 bg-[#1a0a1a] border border-[#ff1493]/50 rounded-lg px-3 py-1.5 text-white text-sm font-bold outline-none focus:border-[#ff1493]"
                  />
                  <button onClick={saveNickname} className="px-3 py-1.5 rounded-lg bg-[#ff1493] text-white text-xs font-bold">Save</button>
                  <button onClick={() => setNicknameEditing(false)} className="text-[#ff69b4]/60 text-xs">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white truncate">{player?.nickname ?? 'Anonymous'}</h1>
                  <button onClick={() => { setNickname(player?.nickname ?? ''); setNicknameEditing(true); }} className="text-xs text-[#ff69b4]/50 hover:text-[#ff69b4] transition-colors">Edit</button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[#ff69b4]/60 text-sm">{truncate(addr)}</span>
                <button onClick={copyAddress} className="text-[#ff69b4]/40 hover:text-[#ff69b4] transition-colors">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* Daily Reward */}
            <div className="flex-shrink-0">
              {dailyStatus?.canClaim ? (
                <button
                  onClick={handleClaimDaily}
                  disabled={claimDaily.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black text-sm hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                >
                  <Gift className="h-4 w-4" />
                  {claimDaily.isPending ? 'Claiming...' : 'Claim Daily Reward'}
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl border border-[#ff69b4]/20 text-[#ff69b4]/40 text-sm font-bold text-center">
                  <div>Daily Reward</div>
                  <div className="text-xs">Already claimed</div>
                </div>
              )}
            </div>
          </div>

          {claimMsg && (
            <div className="mt-4 p-3 rounded-xl bg-green-900/30 border border-green-700/40 text-green-400 text-sm font-bold text-center animate-in fade-in">
              {claimMsg}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div>
          <h2 className="text-xl font-black text-white mb-4">Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Total Spins" value={stats?.totalSpins ?? 0} />
            <StatCard label="Total Wins" value={stats?.totalWins ?? 0} />
            <StatCard label="High Score" value={stats?.highScore ?? 0} />
            <StatCard label="Total Winnings" value={stats?.totalWinnings ?? 0} />
            <StatCard label="Cheese Collected" value={stats?.cheeseCollected ?? 0} />
            <StatCard label="Best Streak" value={stats?.streakRecord ?? 0} />
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-xl font-black text-white mb-4">
            Achievements
            <span className="ml-2 text-sm font-semibold text-[#ff69b4]/60">
              {unlockedKeys.size}/{ALL_ACHIEVEMENT_KEYS.length}
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ALL_ACHIEVEMENT_KEYS.map(key => {
              const def = ACHIEVEMENT_DEFS[key];
              const unlocked = unlockedKeys.has(key);
              return (
                <div
                  key={key}
                  className={`glass-card rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                    unlocked
                      ? 'border-[#ffd700]/40 shadow-[0_0_10px_rgba(255,215,0,0.15)]'
                      : 'opacity-40 grayscale'
                  }`}
                >
                  <span className="text-3xl mb-2">{def.icon}</span>
                  <span className="font-black text-white text-xs">{def.title}</span>
                  <span className="text-[#ffb6c1] text-xs mt-1 leading-tight">{def.desc}</span>
                  {unlocked && (
                    <span className="mt-2 text-xs px-2 py-0.5 rounded-full bg-[#ffd700]/10 text-[#ffd700] font-bold border border-[#ffd700]/20">
                      Unlocked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
