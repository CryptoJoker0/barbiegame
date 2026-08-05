import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { WalletProvider, useWallet } from '@/context/WalletContext';
import Nav from '@/components/Nav';
import LandingPage from '@/pages/LandingPage';
import GamesPage from '@/pages/GamesPage';
import GamePreviewPage, { hasValidPaymentSession } from '@/pages/GamePreviewPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import GameScreen from '@/components/GameScreen';
import WottGamePage from '@/pages/WottGamePage';
import BarbieEnglishPage from '@/pages/BarbieEnglishPage';
import MintPage from '@/pages/MintPage';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// ── Payment gate helper ───────────────────────────────────────────────────────
function checkPaymentGate(walletAddress: string | null, gameId: string): boolean {
  return hasValidPaymentSession(walletAddress, gameId);
}

// ── Game route — requires wallet + NFT + entry payment ────────────────────────
function GameRoute() {
  const { isConnected, hasNft, walletAddress, isCheckingNft } = useWallet();
  const [, navigate] = useLocation();

  if (isCheckingNft) {
    return (
      <div className="min-h-screen bg-[#0d0013] flex items-center justify-center">
        <div className="text-[#ff69b4] font-bold text-xl animate-pulse">Verifying AFRICA X1 NFT…</div>
      </div>
    );
  }

  // Not connected or no NFT → send to game preview flow
  if (!isConnected || !hasNft) {
    return (
      <div className="min-h-screen bg-[#0d0013] flex items-center justify-center px-4">
        <div className="rounded-3xl border border-[#ff1493]/30 bg-[#110520] p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-white mb-2">Access Required</h2>
          <p className="text-[#ff69b4]/70 text-sm mb-6">
            {isConnected
              ? 'You need an AFRICA X1 NFT to play. Please acquire one or try another wallet.'
              : 'Connect your wallet and verify AFRICA X1 NFT ownership to play.'}
          </p>
          <button
            onClick={() => navigate('/games/slot-machine')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black hover:opacity-90 transition-opacity"
          >
            Go to Game
          </button>
        </div>
      </div>
    );
  }

  // NFT verified but no valid entry payment → back to preview to pay
  if (!checkPaymentGate(walletAddress, 'slot-machine')) {
    return (
      <div className="min-h-screen bg-[#0d0013] flex items-center justify-center px-4">
        <div className="rounded-3xl border border-[#ff1493]/30 bg-[#110520] p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🎟️</div>
          <h2 className="text-2xl font-black text-white mb-2">Entry Fee Required</h2>
          <p className="text-[#ff69b4]/70 text-sm mb-6">
            Please complete the entry fee payment to access the game.
          </p>
          <button
            onClick={() => navigate('/games/slot-machine')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black hover:opacity-90 transition-opacity"
          >
            Pay Entry Fee
          </button>
        </div>
      </div>
    );
  }

  return <GameScreen />;
}

// ── Layout with Nav ───────────────────────────────────────────────────────────
function AppRouter() {
  const [loc] = useLocation();
  const showNav = loc !== '/game';

  return (
    <div className="min-h-[100dvh] w-full bg-transparent">
      {showNav && <Nav />}
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/games" component={GamesPage} />
        <Route path="/games/:id" component={GamePreviewPage} />
        <Route path="/game" component={GameRoute} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/english-challenge" component={BarbieEnglishPage} />
        <Route path="/mint" component={MintPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
