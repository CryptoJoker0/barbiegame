import barbieLogo from '@/assets/barbie-logo.png';
import { Link } from 'wouter';

/**
 * Mint Page — placeholder for AFRICA NFT minting.
 * Wire up the real mint contract here once it is deployed.
 */
export default function MintPage() {
  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_20%,rgba(255,20,147,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center gap-8">
        <img src={barbieLogo} alt="AFRICA NFT" className="w-32 drop-shadow-[0_0_30px_rgba(255,20,147,0.6)]" />

        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff1493] to-[#ffd700] mb-3">
            Mint Your AFRICA NFT
          </h1>
          <p className="text-[#ff69b4]/70 text-base leading-relaxed">
            Own an AFRICA NFT to unlock all games, earn Cheese Points, and compete on the global leaderboard.
          </p>
        </div>

        <div className="w-full rounded-3xl border border-[#ff1493]/20 bg-[#110520] p-8 flex flex-col gap-4">
          <div className="text-[#ffd700] font-black text-sm uppercase tracking-widest mb-2">
            🔔 Coming Soon
          </div>
          <p className="text-[#ff69b4]/60 text-sm leading-relaxed">
            The AFRICA NFT smart contract is being prepared for launch on X1 Blockchain.
            Follow us on social media to be first in line when minting opens.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            <a
              href="https://x.com/BARBIEFUNV2"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black text-sm hover:opacity-90 transition-opacity"
            >
              Follow on X (Twitter) ↗
            </a>
            <Link href="/games">
              <button className="w-full py-3 rounded-2xl border border-[#ff1493]/30 text-[#ff69b4] font-bold text-sm hover:bg-[#ff1493]/10 transition-colors">
                ← Browse Games
              </button>
            </Link>
          </div>
        </div>

        <p className="text-[#ff69b4]/30 text-xs">
          Network: X1 Blockchain · Collection: AFRICA NFT
        </p>
      </div>
    </div>
  );
}
