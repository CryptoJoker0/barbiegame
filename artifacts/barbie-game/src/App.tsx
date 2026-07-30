import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { WalletProvider, useWallet } from '@/context/WalletContext';
import Nav from '@/components/Nav';
import LandingPage from '@/pages/LandingPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import GameScreen from '@/components/GameScreen';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Game route — redirect to landing if no NFT
function GameRoute() {
  const { isConnected, hasNft, isCheckingNft } = useWallet();
  const [, navigate] = useLocation();

  if (isCheckingNft) {
    return (
      <div className="min-h-screen bg-[#0d0013] flex items-center justify-center">
        <div className="text-[#ff69b4] font-bold text-xl animate-pulse">Verifying AFRICA NFT...</div>
      </div>
    );
  }

  if (!isConnected || !hasNft) {
    return (
      <div className="min-h-screen bg-[#0d0013] flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-white mb-2">NFT Required</h2>
          <p className="text-[#ff69b4]/70 text-sm mb-6">
            {isConnected
              ? 'You need an AFRICA NFT to play. Connect the right wallet or acquire an NFT.'
              : 'Connect your wallet and verify AFRICA NFT ownership to play.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-black hover:scale-105 transition-transform"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return <GameScreen />;
}

// Layout with Nav (skip nav on game page for immersive feel)
function AppRouter() {
  const [loc] = useLocation();
  const showNav = loc !== '/game';

  return (
    <div className="min-h-[100dvh] w-full bg-background dark">
      {showNav && <Nav />}
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/game" component={GameRoute} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/admin" component={AdminPage} />
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
