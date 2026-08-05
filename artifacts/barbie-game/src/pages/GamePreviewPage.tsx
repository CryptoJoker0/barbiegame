import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ethers } from 'ethers';
import { useWallet } from '@/context/WalletContext';
import { WalletModal } from '@/components/WalletModal';
import game777 from '@/assets/game-777.jpg';
import gamePrediction from '@/assets/game-prediction.jpg';
import gameWott from '@/assets/game-wott.jpg';
import gameEnglish from '@/assets/game-english.png';
import barbieLogo from '@/assets/barbie-logo.png';
import barbieCover from '@/assets/barbie-cover.png';
import { CheckCircle, AlertTriangle, Wallet, Coins, ShieldCheck, ExternalLink } from 'lucide-react';

interface Game {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  rules: string;
  rewards: string;
  entryFee: string;
  feeCurrency: string;
  nftRequired: boolean;
}

const GAME_IMAGES: Record<string, string> = {
  'slot-machine': game777,
  'barbie-prediction': gamePrediction,
  'barbie-wott': gameWott,
  'barbie-english': gameEnglish,
};

/** Maps a game ID to the in-app route that runs the actual game UI. */
const GAME_ROUTES: Record<string, string> = {
  'slot-machine': '/game',
  'barbie-english': '/english-challenge',
};

type Step = 'preview' | 'connect' | 'no-nft' | 'pay' | 'paying' | 'success';

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function savePaymentSession(walletAddress: string, gameId: string, txHash: string) {
  try {
    sessionStorage.setItem(
      'payment_confirmed',
      JSON.stringify({ walletAddress: walletAddress.toLowerCase(), gameId, txHash, timestamp: Date.now() }),
    );
  } catch { /* ignore */ }
}

export function hasValidPaymentSession(walletAddress: string | null, gameId: string): boolean {
  if (!walletAddress) return false;
  try {
    const raw = sessionStorage.getItem('payment_confirmed');
    if (!raw) return false;
    const data = JSON.parse(raw);
    return (
      data.walletAddress === walletAddress.toLowerCase() &&
      data.gameId === gameId &&
      Date.now() - data.timestamp < 24 * 60 * 60 * 1000
    );
  } catch { return false; }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
/** Returns true when a step indicator dot should appear active for the current step. */
function isStepActive(dotKey: string, currentStep: string): boolean {
  return (
    dotKey === currentStep ||
    (currentStep === 'no-nft' && dotKey === 'connect') ||
    (currentStep === 'paying' && dotKey === 'pay')
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${
        done ? 'bg-green-500 text-white' : active ? 'bg-[#ff1493] text-white shadow-[0_0_12px_rgba(255,20,147,0.7)]' : 'bg-[#ff1493]/15 text-[#ff69b4]/50 border border-[#ff1493]/20'
      }`}>
        {done ? '✓' : label[0]}
      </div>
      <span className={`text-[10px] font-bold tracking-wide ${active ? 'text-[#B22222]' : done ? 'text-green-600' : 'text-[#9E2A2A]'}`}>
        {label}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function GamePreviewPage({ params }: { params: { id: string } }) {
  const gameId = params?.id ?? 'slot-machine';
  const { isConnected, hasNft, walletAddress, isConnecting, isCheckingNft, getRawProvider } = useWallet();
  const [, navigate] = useLocation();

  const [game, setGame] = useState<Game | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('preview');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const treasuryWallet = import.meta.env.VITE_TREASURY_WALLET_ADDRESS as string | undefined;

  // Load game from API
  useEffect(() => {
    fetch(`/api/games/${gameId}`)
      .then(r => { if (!r.ok) throw new Error('Game not found'); return r.json(); })
      .then(setGame)
      .catch(e => setLoadError(e.message));
  }, [gameId]);

  // Advance step after wallet connects
  useEffect(() => {
    if (step !== 'connect') return;
    if (isConnecting || isCheckingNft) return;
    if (!isConnected) return;
    setShowWalletModal(false);
    if (!hasNft) { setStep('no-nft'); return; }
    const free = game && parseFloat(game.entryFee) === 0;
    const alreadyPaid = hasValidPaymentSession(walletAddress, gameId);
    if (free || alreadyPaid) { setStep('success'); return; }
    setStep('pay');
  }, [isConnected, hasNft, isConnecting, isCheckingNft, step, game, walletAddress, gameId]);

  // Auto-navigate to game after success animation
  useEffect(() => {
    if (step !== 'success') return;
    const destination = GAME_ROUTES[gameId] ?? '/game';
    const t = setTimeout(() => navigate(destination), 2200);
    return () => clearTimeout(t);
  }, [step, navigate, gameId]);

  function handleContinue() {
    // Free + no NFT required → skip all wallet/NFT/payment gates
    if (game && !game.nftRequired && parseFloat(game.entryFee) === 0) {
      setStep('success');
      return;
    }
    if (!isConnected) {
      setStep('connect');
      setShowWalletModal(true);
      return;
    }
    if (!hasNft) { setStep('no-nft'); return; }
    const free = game && parseFloat(game.entryFee) === 0;
    const alreadyPaid = hasValidPaymentSession(walletAddress, gameId);
    if (free || alreadyPaid) { setStep('success'); return; }
    setStep('pay');
  }

  async function handlePayEntryFee() {
    if (!game || !walletAddress || !treasuryWallet) return;
    setPayError(null);
    setStep('paying');

    try {
      const rawProvider = getRawProvider();
      if (!rawProvider) throw new Error('Wallet provider not available. Please reconnect.');
      const web3 = new ethers.providers.Web3Provider(rawProvider);
      const signer = web3.getSigner();

      const tx = await signer.sendTransaction({
        to: treasuryWallet,
        value: ethers.utils.parseEther(game.entryFee),
      });

      const receipt = await tx.wait(1);
      const hash = receipt.transactionHash;
      setTxHash(hash);

      // Record in DB (fire-and-forget; client already has tx confirmation)
      fetch('/api/payments/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress.toLowerCase(),
          gameId,
          amount: game.entryFee,
          txHash: hash,
          treasuryWallet,
        }),
      }).catch(() => { /* non-fatal */ });

      // Store in sessionStorage so GameRoute and repeat visits skip payment
      savePaymentSession(walletAddress, gameId, hash);
      setStep('success');
    } catch (err: any) {
      setPayError(
        err.code === 4001
          ? 'Transaction cancelled.'
          : err.reason ?? err.message ?? 'Payment failed. Please try again.',
      );
      setStep('pay');
    }
  }

  // ── Loading / error ───────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 font-bold mb-4">{loadError}</p>
          <Link href="/games"><button className="px-6 py-3 rounded-xl bg-[#ff1493]/20 border border-[#ff1493]/40 text-[#ff69b4] font-bold">← Back to Games</button></Link>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-[#ff69b4] font-bold animate-pulse">Loading game…</div>
      </div>
    );
  }

  const img = GAME_IMAGES[game.id] ?? barbieCover;
  const entryFeeNum = parseFloat(game.entryFee);
  const isFree = entryFeeNum === 0;

  // Step indicators
  const steps: { key: Step; label: string }[] = [
    { key: 'preview', label: 'Browse' },
    { key: 'connect', label: 'Wallet' },
    { key: 'pay', label: 'Entry' },
    { key: 'success', label: 'Play' },
  ];
  const stepOrder: Step[] = ['preview', 'connect', 'no-nft', 'pay', 'paying', 'success'];
  const currentIdx = stepOrder.indexOf(step);

  // ── SUCCESS ───────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="text-center flex flex-col items-center gap-6 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Access Granted!</h2>
            <p className="text-[#ff69b4]/70">Entering {game.name}…</p>
            {txHash && (
              <a
                href={`https://explorer.x1blockchain.net/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#ff69b4]/50 hover:text-[#ff69b4] mt-2 transition-colors"
              >
                View payment on X1 Explorer <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="w-full h-1 rounded-full bg-[#ff1493]/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#ff1493] to-[#ffd700] animate-[grow_2s_ease-in-out_forwards]" style={{ width: '100%', animation: 'none', transition: 'width 2s ease-in-out' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── NO NFT ────────────────────────────────────────────────────────────────────
  if (step === 'no-nft') {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="text-center flex flex-col items-center gap-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-3">NFT Required</h2>
            <p className="text-[#ff69b4]/70 text-sm leading-relaxed">
              You must own at least 1 AFRICA NFT to play.
            </p>
            {walletAddress && (
              <p className="font-mono text-xs text-[#ff69b4]/40 mt-2">{truncate(walletAddress)}</p>
            )}
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Link href="/mint">
              <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black text-sm text-center hover:opacity-90 transition-opacity">
                🖼 Mint NFT
              </button>
            </Link>
            <button
              onClick={() => setStep('preview')}
              className="w-full py-3 rounded-2xl border border-[#ff1493]/30 text-[#ff69b4] font-bold text-sm hover:bg-[#ff1493]/10 transition-colors"
            >
              ← Back to Game Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PAYING ────────────────────────────────────────────────────────────────────
  if (step === 'paying') {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-[#ff1493]/30 border-t-[#ff1493] animate-spin" />
          <div>
            <h2 className="text-xl font-black text-white mb-2">Processing Payment</h2>
            <p className="text-[#ff69b4]/70 text-sm">Sending {game.entryFee} {game.feeCurrency} to Treasury…</p>
            <p className="text-[#ff69b4]/40 text-xs mt-2">Please confirm in your wallet and wait for on-chain confirmation.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── PREVIEW + CONNECT + PAY (main layout) ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-transparent text-[#7B1818]">
      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_20%,rgba(255,20,147,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Back link */}
        <Link href="/games">
          <button className="flex items-center gap-2 text-[#9E2A2A] hover:text-[#7B1818] text-sm font-semibold mb-8 transition-colors">
            ← All Games
          </button>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => {
            const sIdx = stepOrder.indexOf(s.key);
            const done = currentIdx > sIdx;
            const active = isStepActive(s.key, step);
            return (
              <div key={s.key} className="flex items-center gap-2">
                <StepDot label={s.label} active={active} done={done} />
                {i < steps.length - 1 && (
                  <div className={`w-12 h-0.5 rounded-full transition-colors ${done ? 'bg-green-500' : 'bg-[#ff1493]/15'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left — game image + quick facts */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl overflow-hidden border border-[#ff1493]/20 bg-[#110520] p-6">
              <img
                src={img}
                alt={game.name}
                className="w-full max-w-[360px] mx-auto drop-shadow-[0_0_40px_rgba(255,20,147,0.7)]"
              />
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#ff1493]/15 bg-[#110520] p-4">
                <div className="text-[#9E2A2A] text-xs font-bold uppercase tracking-widest mb-1">Entry Fee</div>
                <div className="text-[#7B1818] font-black text-lg">
                  {isFree ? 'FREE' : `${game.entryFee} ${game.feeCurrency}`}
                </div>
              </div>
              <div className="rounded-2xl border border-[#ffd700]/15 bg-[#110520] p-4">
                <div className="text-[#ffd700]/50 text-xs font-bold uppercase tracking-widest mb-1">Requirement</div>
                {game.nftRequired
                  ? <div className="text-[#ffd700] font-black text-sm">1 AFRICA X1 NFT</div>
                  : <div className="text-green-400 font-black text-sm">No wallet required</div>
                }
              </div>
            </div>

            {/* Connected wallet */}
            {isConnected && walletAddress && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-green-500/30 bg-green-900/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <div className="text-green-400 text-xs font-bold">Wallet Connected</div>
                  <div className="text-green-300/70 text-xs font-mono">{truncate(walletAddress)}</div>
                </div>
                {hasNft && (
                  <div className="ml-auto px-2 py-0.5 rounded-full bg-green-900/40 border border-green-600/40 text-green-400 text-[10px] font-black">
                    NFT ✓
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — details + action panel */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff1493] to-[#ffd700] mb-2">
                {game.name}
              </h1>
              <p className="text-[#5C1A1A] leading-relaxed">{game.description}</p>
            </div>

            {/* Rules */}
            <div className="rounded-2xl border border-[#ff1493]/15 bg-[#110520] p-5">
              <h3 className="font-black text-[#7B1818] text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C2185B]" /> Game Rules
              </h3>
              <ul className="space-y-2">
                {game.rules.split('\n').filter(Boolean).map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#5C1A1A]">
                    <span className="text-[#B22222] mt-0.5 flex-shrink-0">›</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rewards */}
            <div className="rounded-2xl border border-[#ffd700]/15 bg-[#110520] p-5">
              <h3 className="font-black text-[#7B1818] text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#8B6914]" /> Rewards
              </h3>
              <ul className="space-y-2">
                {game.rewards.split('\n').filter(Boolean).map((reward, i) => (
                  <li key={i} className="text-sm text-[#5C1A1A]">{reward}</li>
                ))}
              </ul>
            </div>

            {/* ── ACTION PANEL ── */}
            {step === 'preview' && (
              <div className="rounded-2xl border border-[#ff1493]/25 bg-[#110520] p-5 flex flex-col gap-4">
                <h3 className="font-black text-[#7B1818] text-sm uppercase tracking-widest">How to Enter</h3>
                <div className="flex flex-col gap-2 text-sm text-[#5C1A1A]">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#ff1493]/20 border border-[#ff1493]/40 flex items-center justify-center text-[#ff69b4] text-xs font-black flex-shrink-0">1</div>
                    Connect your wallet
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#ff1493]/20 border border-[#ff1493]/40 flex items-center justify-center text-[#ff69b4] text-xs font-black flex-shrink-0">2</div>
                    Verify AFRICA X1 NFT ownership
                  </div>
                  {!isFree && (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#ff1493]/20 border border-[#ff1493]/40 flex items-center justify-center text-[#ff69b4] text-xs font-black flex-shrink-0">3</div>
                      Pay entry fee: {game.entryFee} {game.feeCurrency} → Treasury
                    </div>
                  )}
                </div>
                <button
                  onClick={handleContinue}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black text-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-[0_0_25px_rgba(255,20,147,0.5)]"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 'connect' && (
              <div className="rounded-2xl border border-[#ff1493]/25 bg-[#110520] p-5 flex flex-col gap-4 text-center">
                <Wallet className="w-10 h-10 text-[#ff1493] mx-auto" />
                <div>
                  <h3 className="font-black text-white mb-1">Connect Your Wallet</h3>
                  <p className="text-[#ff69b4]/60 text-sm">Choose a wallet to verify your AFRICA X1 NFT</p>
                </div>
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black hover:opacity-90 transition-opacity"
                >
                  Connect Wallet
                </button>
                <button onClick={() => setStep('preview')} className="text-sm text-[#ff69b4]/50 hover:text-[#ff69b4] transition-colors">
                  ← Back
                </button>
              </div>
            )}

            {step === 'pay' && (
              <div className="rounded-2xl border border-[#ff1493]/25 bg-[#110520] p-5 flex flex-col gap-4">
                <h3 className="font-black text-[#7B1818] text-sm uppercase tracking-widest flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#8B6914]" /> Pay Entry Fee
                </h3>

                {!treasuryWallet && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-center">
                    Treasury wallet not configured. Set VITE_TREASURY_WALLET_ADDRESS.
                  </div>
                )}

                <div className="rounded-xl bg-[#0d0013] border border-[#ff1493]/15 p-4 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between text-[#ffb6c1]/60">
                    <span>Entry Fee</span>
                    <span className="font-black text-[#7B1818]">{game.entryFee} {game.feeCurrency}</span>
                  </div>
                  <div className="flex justify-between text-[#ffb6c1]/60">
                    <span>Recipient</span>
                    <span className="font-mono text-xs text-[#ff69b4]/70">{treasuryWallet ? truncate(treasuryWallet) : '—'}</span>
                  </div>
                  <div className="border-t border-[#ff1493]/10 pt-2 flex justify-between">
                    <span className="text-[#ffb6c1]/60">You Pay</span>
                    <span className="font-black text-[#ffd700]">{game.entryFee} {game.feeCurrency}</span>
                  </div>
                </div>

                {payError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-center">
                    {payError}
                  </div>
                )}

                <button
                  onClick={handlePayEntryFee}
                  disabled={!treasuryWallet}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ffd700] text-white font-black text-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-[0_0_25px_rgba(255,20,147,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                >
                  Pay {game.entryFee} {game.feeCurrency} → Enter Game
                </button>
                <p className="text-[#ff69b4]/30 text-xs text-center">
                  100% of the entry fee goes to the AFRICA X1 Treasury · X1 Blockchain
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showWalletModal && (
        <WalletModal
          onClose={() => {
            setShowWalletModal(false);
            if (!isConnected) setStep('preview');
          }}
        />
      )}
    </div>
  );
}
