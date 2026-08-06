import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';
import {
  useGetAdminConfig, useGetAdminStats, useGetLeaderboard, useGetAnnouncements,
  useUpdateAdminConfig, useResetLeaderboard, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement,
  getGetAdminConfigQueryKey, getGetAdminStatsQueryKey, getGetLeaderboardQueryKey, getGetAnnouncementsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import {
  Settings, BarChart3, Megaphone, Trophy, Users,
  Shield, Plus, Trash2, Edit2, X, Check, Search, ChevronLeft, ChevronRight, Wallet, Hash, Layers,
} from 'lucide-react';

const ADMIN_WALLET = (import.meta.env.VITE_ADMIN_WALLET_ADDRESS ?? '').toLowerCase();
const API_BASE = '/api';

function truncate(addr: string, start = 8, end = 6) {
  return addr ? `${addr.slice(0, start)}…${addr.slice(-end)}` : '';
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-black text-[#ffd700]">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-[#ff69b4] text-xs mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}

// ── NFT Admin helpers ─────────────────────────────────────────────────────────

interface NftHolder {
  id: string;
  walletAddress: string;
  tokenId: string;
  collection: string;
  nftCount: number;
  createdAt: string;
  updatedAt: string;
}

interface NftStats {
  totalWallets: number;
  totalNfts: number;
  recentlyAdded: NftHolder[];
}

interface HoldersPage {
  holders: NftHolder[];
  total: number;
  page: number;
  limit: number;
}

function useNftStats(enabled: boolean) {
  return useQuery<NftStats>({
    queryKey: ['admin', 'nft', 'stats'],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/admin/nft/stats`);
      if (!r.ok) throw new Error('Failed to fetch NFT stats');
      return r.json();
    },
    enabled,
  });
}

function useNftHolders(enabled: boolean, search: string, page: number, limit = 20) {
  return useQuery<HoldersPage>({
    queryKey: ['admin', 'nft', 'holders', search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
      const r = await fetch(`${API_BASE}/admin/nft/holders?${params}`);
      if (!r.ok) throw new Error('Failed to fetch NFT holders');
      return r.json();
    },
    enabled,
  });
}

function useAddNftHolder() {
  return useMutation({
    mutationFn: async (body: { walletAddress: string; tokenId: string; collection?: string; nftCount?: number }) => {
      const r = await fetch(`${API_BASE}/admin/nft/holders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error ?? 'Failed to add holder');
      }
      return r.json();
    },
  });
}

function useEditNftHolder() {
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; tokenId?: string; collection?: string; nftCount?: number }) => {
      const r = await fetch(`${API_BASE}/admin/nft/holders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error ?? 'Failed to update holder');
      }
      return r.json();
    },
  });
}

function useDeleteNftHolder() {
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`${API_BASE}/admin/nft/holders/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Failed to delete holder');
      return r.json();
    },
  });
}

// ── Add NFT Modal ─────────────────────────────────────────────────────────────

function AddNftModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ walletAddress: '', tokenId: '', collection: 'AFRICA_NFT', nftCount: 1 });
  const [error, setError] = useState('');
  const add = useAddNftHolder();
  const walletRef = useRef<HTMLInputElement>(null);
  useEffect(() => { walletRef.current?.focus(); }, []);

  function set(k: string, v: string | number) { setForm(p => ({ ...p, [k]: v })); setError(''); }

  async function submit() {
    if (!form.walletAddress.trim()) return setError('Wallet address is required');
    if (!form.tokenId.trim()) return setError('NFT Token ID is required');
    try {
      await add.mutateAsync(form);
      onSuccess();
    } catch (e: any) {
      setError(e.message ?? 'Failed to add');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(10,0,15,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-[#ff1493]/30 shadow-2xl" style={{ boxShadow: '0 0 60px rgba(255,20,147,0.15)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff1493]/20 flex items-center justify-center">
              <Plus className="h-4 w-4 text-[#ff69b4]" />
            </div>
            <h3 className="font-black text-white text-lg">Add NFT Holder</h3>
          </div>
          <button onClick={onClose} className="text-[#ff69b4]/50 hover:text-[#ff69b4] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-[#ff69b4] text-xs uppercase tracking-widest font-semibold mb-1.5">
              <Wallet className="h-3 w-3" /> Wallet Address
            </label>
            <input
              ref={walletRef}
              placeholder="0x..."
              value={form.walletAddress}
              onChange={e => set('walletAddress', e.target.value)}
              className="w-full bg-[#1a0a1a] border border-[#ff1493]/30 rounded-xl px-3 py-2.5 text-white text-sm font-mono outline-none focus:border-[#ff1493] transition-colors placeholder-white/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[#ff69b4] text-xs uppercase tracking-widest font-semibold mb-1.5">
              <Hash className="h-3 w-3" /> NFT Token ID
            </label>
            <input
              placeholder="#1"
              value={form.tokenId}
              onChange={e => set('tokenId', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="w-full bg-[#1a0a1a] border border-[#ff1493]/30 rounded-xl px-3 py-2.5 text-white text-sm font-mono outline-none focus:border-[#ff1493] transition-colors placeholder-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[#ff69b4] text-xs uppercase tracking-widest font-semibold mb-1.5">
                <Layers className="h-3 w-3" /> Collection
              </label>
              <input
                placeholder="AFRICA_NFT"
                value={form.collection}
                onChange={e => set('collection', e.target.value)}
                className="w-full bg-[#1a0a1a] border border-[#ff1493]/30 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#ff1493] transition-colors placeholder-white/20"
              />
            </div>
            <div>
              <label className="text-[#ff69b4] text-xs uppercase tracking-widest font-semibold mb-1.5 block">NFT Count</label>
              <input
                type="number"
                min={1}
                value={form.nftCount}
                onChange={e => set('nftCount', Number(e.target.value))}
                className="w-full bg-[#1a0a1a] border border-[#ff1493]/30 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#ff1493] transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2 border border-red-700/30">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#ff1493]/30 text-[#ff69b4] font-bold text-sm hover:bg-[#ff1493]/10 transition-colors">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={add.isPending}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {add.isPending ? 'Adding…' : 'Add Holder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Row Inline ───────────────────────────────────────────────────────────

function EditRow({
  holder, onDone,
}: { holder: NftHolder; onDone: () => void }) {
  const [form, setForm] = useState({ tokenId: holder.tokenId, collection: holder.collection, nftCount: holder.nftCount });
  const [error, setError] = useState('');
  const edit = useEditNftHolder();

  async function save() {
    try {
      await edit.mutateAsync({ id: holder.id, ...form });
      onDone();
    } catch (e: any) { setError(e.message ?? 'Error'); }
  }

  return (
    <tr className="border-b border-[#ff1493]/10 bg-[#ff1493]/5">
      <td className="px-4 py-3 font-mono text-white/70 text-xs">{truncate(holder.walletAddress, 10, 8)}</td>
      <td className="px-4 py-3">
        <input
          value={form.tokenId}
          onChange={e => setForm(p => ({ ...p, tokenId: e.target.value }))}
          className="w-full bg-[#1a0a1a] border border-[#ff1493]/40 rounded-lg px-2 py-1 text-white text-xs font-mono outline-none focus:border-[#ff1493]"
        />
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <input
          value={form.collection}
          onChange={e => setForm(p => ({ ...p, collection: e.target.value }))}
          className="w-full bg-[#1a0a1a] border border-[#ff1493]/40 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-[#ff1493]"
        />
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <input
          type="number"
          min={1}
          value={form.nftCount}
          onChange={e => setForm(p => ({ ...p, nftCount: Number(e.target.value) }))}
          className="w-20 bg-[#1a0a1a] border border-[#ff1493]/40 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-[#ff1493]"
        />
      </td>
      <td className="px-4 py-3 hidden lg:table-cell" />
      <td className="px-4 py-3">
        {error && <div className="text-red-400 text-xs mb-1">{error}</div>}
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={edit.isPending} className="text-green-400 hover:text-green-300 transition-colors" title="Save">
            <Check className="h-4 w-4" />
          </button>
          <button onClick={onDone} className="text-[#ff69b4]/50 hover:text-[#ff69b4] transition-colors" title="Cancel">
            <X className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── NFT Tab ───────────────────────────────────────────────────────────────────

function NftTab({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: stats, isLoading: statsLoading } = useNftStats(isAdmin);
  const { data: holdersData, isLoading: holdersLoading } = useNftHolders(isAdmin, debouncedSearch, page);
  const deleteHolder = useDeleteNftHolder();

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['admin', 'nft'] });
  }

  function handleAddSuccess() {
    setShowAdd(false);
    invalidate();
  }

  async function handleDelete(id: string) {
    await deleteHolder.mutateAsync(id);
    setDeletingId(null);
    invalidate();
  }

  const totalPages = holdersData ? Math.ceil(holdersData.total / holdersData.limit) : 1;

  return (
    <div className="space-y-6">
      {showAdd && <AddNftModal onClose={() => setShowAdd(false)} onSuccess={handleAddSuccess} />}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 col-span-1 border border-[#ffd700]/10" style={{ boxShadow: '0 0 30px rgba(255,215,0,0.05)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#ffd700]/10 flex items-center justify-center">
              <Wallet className="h-3.5 w-3.5 text-[#ffd700]" />
            </div>
            <span className="text-[#ff69b4] text-xs uppercase tracking-widest font-semibold">Verified Wallets</span>
          </div>
          <div className="text-3xl font-black text-[#ffd700]">
            {statsLoading ? <span className="animate-pulse text-[#ffd700]/30">—</span> : (stats?.totalWallets ?? 0).toLocaleString()}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 col-span-1 border border-[#ff69b4]/10" style={{ boxShadow: '0 0 30px rgba(255,105,180,0.05)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#ff69b4]/10 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-[#ff69b4]" />
            </div>
            <span className="text-[#ff69b4] text-xs uppercase tracking-widest font-semibold">NFTs Assigned</span>
          </div>
          <div className="text-3xl font-black text-[#ff69b4]">
            {statsLoading ? <span className="animate-pulse text-[#ff69b4]/30">—</span> : (stats?.totalNfts ?? 0).toLocaleString()}
          </div>
        </div>

        {/* Recently added — spans 2 cols on large screens */}
        <div className="glass-card rounded-xl p-5 col-span-2 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
              <Layers className="h-3.5 w-3.5 text-white/50" />
            </div>
            <span className="text-white/50 text-xs uppercase tracking-widest font-semibold">Recently Added</span>
          </div>
          {statsLoading ? (
            <div className="space-y-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 rounded bg-white/5 animate-pulse" style={{ width: `${60 + i * 10}%` }} />
              ))}
            </div>
          ) : stats?.recentlyAdded?.length ? (
            <div className="space-y-1.5">
              {stats.recentlyAdded.slice(0, 4).map(h => (
                <div key={h.id} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-white/60">{truncate(h.walletAddress, 10, 6)}</span>
                  <span className="text-[#ffd700]/70 font-mono ml-2">{h.tokenId}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/20 text-xs">No holders yet</div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#ff69b4]/40" />
          <input
            placeholder="Search wallet or token ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1a0a1a] border border-[#ff1493]/30 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm outline-none focus:border-[#ff1493] transition-colors placeholder-white/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black text-sm hover:opacity-90 transition-opacity shadow-lg"
          style={{ boxShadow: '0 4px 20px rgba(255,20,147,0.3)' }}
        >
          <Plus className="h-4 w-4" />
          Add Holder
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[#ff1493]/10">
        {/* Table header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ff1493]/10 bg-[#ff1493]/5">
          <span className="text-[#ff69b4]/60 text-xs uppercase tracking-widest font-semibold">
            {holdersData ? `${holdersData.total.toLocaleString()} holder${holdersData.total !== 1 ? 's' : ''}` : 'Loading…'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ff1493]/10 text-[#ff69b4] text-xs uppercase tracking-widest">
                <th className="px-4 py-3 text-left">Wallet</th>
                <th className="px-4 py-3 text-left">Token ID</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Collection</th>
                <th className="px-4 py-3 text-right hidden md:table-cell">Count</th>
                <th className="px-4 py-3 text-right hidden lg:table-cell">Added</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdersLoading && (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className={`px-4 py-3 ${j >= 2 && j <= 4 ? 'hidden sm:table-cell' : ''}`}>
                        <div className="h-4 rounded bg-white/5 animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              )}

              {!holdersLoading && holdersData?.holders.map(holder => (
                editingId === holder.id ? (
                  <EditRow
                    key={holder.id}
                    holder={holder}
                    onDone={() => { setEditingId(null); invalidate(); }}
                  />
                ) : (
                  <tr key={holder.id} className="border-b border-white/5 hover:bg-[#ff1493]/5 transition-colors group">
                    {/* Wallet */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#ff1493]/10 flex items-center justify-center flex-shrink-0">
                          <Wallet className="h-3 w-3 text-[#ff69b4]/60" />
                        </div>
                        <span className="font-mono text-white/70 text-xs" title={holder.walletAddress}>
                          {truncate(holder.walletAddress, 10, 8)}
                        </span>
                      </div>
                    </td>

                    {/* Token ID */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-[#ffd700] text-xs bg-[#ffd700]/10 px-2 py-0.5 rounded-md border border-[#ffd700]/20">
                        {holder.tokenId}
                      </span>
                    </td>

                    {/* Collection */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[#ff69b4]/70 text-xs">{holder.collection}</span>
                    </td>

                    {/* Count */}
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-white/60 text-xs font-bold">{holder.nftCount}</span>
                    </td>

                    {/* Added */}
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className="text-white/30 text-xs">
                        {new Date(holder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {deletingId === holder.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-red-400/70 text-xs">Delete?</span>
                          <button
                            onClick={() => handleDelete(holder.id)}
                            disabled={deleteHolder.isPending}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Confirm delete"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeletingId(null)} className="text-white/30 hover:text-white/60 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingId(holder.id); setDeletingId(null); }}
                            className="text-[#ff69b4]/50 hover:text-[#ff69b4] transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setDeletingId(holder.id); setEditingId(null); }}
                            className="text-red-400/50 hover:text-red-400 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              ))}

              {!holdersLoading && !holdersData?.holders.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#ff1493]/10 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-[#ff1493]/30" />
                      </div>
                      <div>
                        <div className="text-white/40 font-semibold">
                          {debouncedSearch ? 'No results found' : 'No NFT holders yet'}
                        </div>
                        <div className="text-white/20 text-xs mt-1">
                          {debouncedSearch ? 'Try a different search term' : 'Add your first holder to grant access'}
                        </div>
                      </div>
                      {!debouncedSearch && (
                        <button
                          onClick={() => setShowAdd(true)}
                          className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff1493]/20 text-[#ff69b4] font-bold text-sm hover:bg-[#ff1493]/30 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add First Holder
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {holdersData && holdersData.total > holdersData.limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#ff1493]/10">
            <span className="text-white/30 text-xs">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-[#ff1493]/20 text-[#ff69b4]/60 hover:text-[#ff69b4] hover:border-[#ff1493]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-[#ff1493]/20 text-[#ff69b4]/60 hover:text-[#ff69b4] hover:border-[#ff1493]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main AdminPage ─────────────────────────────────────────────────────────────

type Tab = 'overview' | 'config' | 'announcements' | 'leaderboard' | 'players' | 'nft';

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
    { id: 'nft', label: 'NFT Holders', icon: <Shield className="h-4 w-4" /> },
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
      <aside className="hidden md:flex flex-col w-56 border-r border-[#ff1493]/20 bg-[#0a000f] p-4 gap-1 pt-6">
        <div className="text-[#ff69b4]/40 text-xs uppercase tracking-widest font-bold mb-4 px-2">Admin</div>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
              tab === t.id
                ? t.id === 'nft'
                  ? 'bg-gradient-to-r from-[#ff1493]/20 to-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/10'
                  : 'bg-[#ff1493]/20 text-[#ff69b4]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </aside>

      {/* Mobile tab bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden flex bg-[#0a000f] border-t border-[#ff1493]/20 z-40 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-semibold transition-colors min-w-[52px] ${
              tab === t.id
                ? t.id === 'nft' ? 'text-[#ffd700]' : 'text-[#ff69b4]'
                : 'text-white/40'
            }`}
          >
            {t.icon}
            <span className="mt-0.5 text-[10px]">{t.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-8 py-8 pb-24 md:pb-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            {tab === 'nft' && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/20">
                NFT Management
              </span>
            )}
          </div>
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

        {/* NFT HOLDERS */}
        {tab === 'nft' && <NftTab isAdmin={!!isAdmin} />}

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
                  {leaderboard?.map((p) => (
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
