import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import {
  useGetAdminConfig, useGetAdminStats, useGetLeaderboard, useGetAnnouncements,
  useUpdateAdminConfig, useResetLeaderboard, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement,
  getGetAdminConfigQueryKey, getGetAdminStatsQueryKey, getGetLeaderboardQueryKey, getGetAnnouncementsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Settings, BarChart3, Megaphone, Trophy, Users } from 'lucide-react';

const ADMIN_WALLET = (import.meta.env.VITE_ADMIN_WALLET_ADDRESS ?? '').toLowerCase();

function truncate(addr: string) { return addr ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : ''; }

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-black text-[#ffd700]">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-[#ff69b4] text-xs mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}

type Tab = 'overview' | 'config' | 'announcements' | 'leaderboard' | 'players';

export default function AdminPage() {
  const { walletAddress, isConnected } = useWallet();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [resetConfirm, setResetConfirm] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', message: '' });
  const [configForm, setConfigForm] = useState<Record<string, any>>({});
  const [configEditing, setConfigEditing] = useState(false);

  const isAdmin = isConnected && ADMIN_WALLET && walletAddress?.toLowerCase() === ADMIN_WALLET;

  const { data: adminStats } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey(), enabled: isAdmin } });
  const { data: adminConfig } = useGetAdminConfig({ query: { queryKey: getGetAdminConfigQueryKey(), enabled: isAdmin } });
  const { data: leaderboard } = useGetLeaderboard({ limit: 50 }, { query: { queryKey: getGetLeaderboardQueryKey({ limit: 50 }), enabled: isAdmin } });
  const { data: announcements } = useGetAnnouncements({ query: { queryKey: getGetAnnouncementsQueryKey(), enabled: isAdmin } });

  const updateConfig = useUpdateAdminConfig();
  const resetLb = useResetLeaderboard();
  const createAnn = useCreateAnnouncement();
  const updateAnn = useUpdateAnnouncement();
  const deleteAnn = useDeleteAnnouncement();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-white mb-2">Connect Wallet</h2>
          <p className="text-[#ff69b4]/70 text-sm">Admin access requires wallet connection.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-10 text-center max-w-md border-red-500/30">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-black text-white mb-2">Unauthorized</h2>
          <p className="text-[#ff69b4]/70 text-sm">This wallet does not have admin access.</p>
          <p className="text-[#ff69b4]/40 text-xs mt-3 font-mono">{truncate(walletAddress!)}</p>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'config', label: 'Game Config', icon: <Settings className="h-4 w-4" /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
    { id: 'players', label: 'Players', icon: <Users className="h-4 w-4" /> },
  ];

  function handleSaveConfig() {
    updateConfig.mutate(
      { data: configForm } as any,
      { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetAdminConfigQueryKey() }); setConfigEditing(false); } }
    );
  }

  function handleResetLeaderboard() {
    resetLb.mutate(
      {} as any,
      { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetLeaderboardQueryKey() }); setResetConfirm(false); } }
    );
  }

  function handleCreateAnnouncement() {
    if (!newAnn.title || !newAnn.message) return;
    createAnn.mutate(
      { data: { title: newAnn.title, message: newAnn.message, isActive: true } } as any,
      { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() }); setNewAnn({ title: '', message: '' }); } }
    );
  }

  function handleToggleAnn(id: number, isActive: boolean) {
    updateAnn.mutate(
      { data: { isActive: !isActive }, params: { id } } as any,
      { onSuccess: () => qc.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() }) }
    );
  }

  function handleDeleteAnn(id: number) {
    deleteAnn.mutate(
      { params: { id } } as any,
      { onSuccess: () => qc.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() }) }
    );
  }

  const configFields = [
    { key: 'spinCost', label: 'Spin Cost (coins)', type: 'number' },
    { key: 'jackpotAmount', label: 'Jackpot Amount', type: 'number' },
    { key: 'dailyRewardCoins', label: 'Daily Reward Coins', type: 'number' },
    { key: 'dailyRewardCheese', label: 'Daily Reward Cheese', type: 'number' },
    { key: 'bonusSpinCheeseCost', label: 'Bonus Spin Cheese Cost', type: 'number' },
    { key: 'maxDailySpins', label: 'Max Daily Spins', type: 'number' },
  ];

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-52 border-r border-[#ff1493]/20 bg-[#0a000f] p-4 gap-1 pt-6">
        <div className="text-[#ff69b4]/40 text-xs uppercase tracking-widest font-bold mb-4 px-2">Admin</div>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
              tab === t.id ? 'bg-[#ff1493]/20 text-[#ff69b4]' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </aside>

      {/* Mobile tab bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden flex bg-[#0a000f] border-t border-[#ff1493]/20 z-40">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-semibold transition-colors ${
              tab === t.id ? 'text-[#ff69b4]' : 'text-white/40'
            }`}
          >
            {t.icon}
            <span className="mt-0.5 text-[10px]">{t.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 px-4 md:px-8 py-8 pb-24 md:pb-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          <span className="text-xs font-mono text-[#ff69b4]/40">{truncate(walletAddress!)}</span>
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Total Players" value={adminStats?.totalPlayers ?? 0} icon="👥" />
            <StatCard label="Total Spins" value={adminStats?.totalSpins ?? 0} icon="🎰" />
            <StatCard label="Total Winnings" value={adminStats?.totalWinnings ?? 0} icon="💰" />
            <StatCard label="Total Jackpots" value={adminStats?.totalJackpots ?? 0} icon="👑" />
            <StatCard label="Active (24h)" value={adminStats?.activePlayers24h ?? 0} icon="🟢" />
            <StatCard label="Win Rate" value={`${((adminStats?.avgWinRate ?? 0) * 100).toFixed(1)}%`} icon="📊" />
          </div>
        )}

        {/* CONFIG */}
        {tab === 'config' && adminConfig && (
          <div className="glass-card rounded-2xl p-6 max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-white text-lg">Game Configuration</h2>
              {!configEditing ? (
                <button onClick={() => { setConfigForm({ ...adminConfig }); setConfigEditing(true); }} className="text-sm text-[#ff69b4] hover:text-white font-bold">Edit</button>
              ) : (
                <button onClick={() => setConfigEditing(false)} className="text-sm text-[#ff69b4]/50">Cancel</button>
              )}
            </div>
            <div className="space-y-4">
              {configFields.map(f => (
                <div key={f.key}>
                  <label className="text-[#ff69b4] text-xs uppercase tracking-widest font-semibold block mb-1">{f.label}</label>
                  {configEditing ? (
                    <input
                      type="number"
                      value={configForm[f.key] ?? ''}
                      onChange={e => setConfigForm((prev: any) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                      className="w-full bg-[#1a0a1a] border border-[#ff1493]/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#ff1493]"
                    />
                  ) : (
                    <div className="text-white font-bold">{(adminConfig as any)[f.key]}</div>
                  )}
                </div>
              ))}
              <div>
                <label className="text-[#ff69b4] text-xs uppercase tracking-widest font-semibold block mb-1">Maintenance Mode</label>
                {configEditing ? (
                  <button
                    onClick={() => setConfigForm((prev: any) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-colors ${configForm.maintenanceMode ? 'bg-red-900/40 text-red-400 border-red-700/40' : 'bg-green-900/40 text-green-400 border-green-700/40'}`}
                  >
                    {configForm.maintenanceMode ? 'ON (Maintenance)' : 'OFF (Live)'}
                  </button>
                ) : (
                  <span className={`font-bold ${adminConfig.maintenanceMode ? 'text-red-400' : 'text-green-400'}`}>
                    {adminConfig.maintenanceMode ? 'Maintenance Mode' : 'Live'}
                  </span>
                )}
              </div>
            </div>
            {configEditing && (
              <button
                onClick={handleSaveConfig}
                disabled={updateConfig.isPending}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
              </button>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {tab === 'announcements' && (
          <div className="space-y-6 max-w-2xl">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-black text-white text-lg mb-4">New Announcement</h2>
              <div className="space-y-3">
                <input
                  placeholder="Title"
                  value={newAnn.title}
                  onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-[#1a0a1a] border border-[#ff1493]/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#ff1493]"
                />
                <textarea
                  placeholder="Message"
                  rows={3}
                  value={newAnn.message}
                  onChange={e => setNewAnn(p => ({ ...p, message: e.target.value }))}
                  className="w-full bg-[#1a0a1a] border border-[#ff1493]/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#ff1493] resize-none"
                />
                <button
                  onClick={handleCreateAnnouncement}
                  disabled={createAnn.isPending}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {createAnn.isPending ? 'Creating...' : 'Create Announcement'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {announcements?.map(a => (
                <div key={a.id} className={`glass-card rounded-xl p-4 flex items-start gap-3 ${a.isActive ? 'border-green-700/30' : 'opacity-50'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">{a.title}</div>
                    <div className="text-[#ffb6c1] text-xs mt-0.5 truncate">{a.message}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggleAnn(a.id, a.isActive)} className={`text-xs font-bold px-2 py-1 rounded-lg border ${a.isActive ? 'border-green-700/40 text-green-400' : 'border-gray-700/40 text-gray-500'}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => handleDeleteAnn(a.id)} className="text-red-400/60 hover:text-red-400 text-xs">Delete</button>
                  </div>
                </div>
              ))}
              {!announcements?.length && (
                <div className="text-center text-[#ff69b4]/40 py-8">No announcements yet</div>
              )}
            </div>
          </div>
        )}

        {/* LEADERBOARD */}
        {tab === 'leaderboard' && (
          <div className="space-y-6">
            {resetConfirm ? (
              <div className="glass-card rounded-2xl p-6 border-red-500/30 max-w-md">
                <h3 className="font-black text-red-400 mb-2">Confirm Reset</h3>
                <p className="text-[#ffb6c1] text-sm mb-4">This will reset the leaderboard for all players. This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={handleResetLeaderboard} disabled={resetLb.isPending} className="flex-1 py-2 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-500 disabled:opacity-50">
                    {resetLb.isPending ? 'Resetting...' : 'Yes, Reset'}
                  </button>
                  <button onClick={() => setResetConfirm(false)} className="flex-1 py-2 rounded-lg border border-[#ff1493]/30 text-[#ff69b4] font-bold text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setResetConfirm(true)} className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-900/20 transition-colors">
                Reset Leaderboard
              </button>
            )}
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ff1493]/20 text-[#ff69b4] text-xs uppercase tracking-widest">
                    <th className="px-4 py-3 text-left">Address</th>
                    <th className="px-4 py-3 text-right">High Score</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Winnings</th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">Spins</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard?.map((p, i) => (
                    <tr key={p.walletAddress} className="border-b border-white/5 hover:bg-[#ff1493]/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-white text-xs">{p.nickname ? `${p.nickname} (${truncate(p.walletAddress)})` : truncate(p.walletAddress)}</td>
                      <td className="px-4 py-3 text-right text-[#ffd700] font-bold">{(p.highScore ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-[#ffb6c1] hidden sm:table-cell">{(p.totalWinnings ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-[#ff69b4]/60 hidden md:table-cell">{(p.totalSpins ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PLAYERS */}
        {tab === 'players' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ff1493]/20 text-[#ff69b4] text-xs uppercase tracking-widest">
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-4 py-3 text-right">Spins</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Wins</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">High Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard?.map(p => (
                  <tr key={p.walletAddress} className="border-b border-white/5 hover:bg-[#ff1493]/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-white text-xs">{p.nickname ? `${p.nickname}` : truncate(p.walletAddress)}</div>
                      {p.nickname && <div className="text-[#ff69b4]/40 text-xs font-mono">{truncate(p.walletAddress)}</div>}
                    </td>
                    <td className="px-4 py-3 text-right text-[#ffb6c1]">{(p.totalSpins ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-[#ffb6c1] hidden sm:table-cell">{(p.totalWins ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-[#ffd700] font-bold hidden md:table-cell">{(p.highScore ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
