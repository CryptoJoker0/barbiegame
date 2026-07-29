import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useState } from 'react';
import AccessScreen from '@/components/AccessScreen';
import GameScreen from '@/components/GameScreen';

const queryClient = new QueryClient();

function BarbieApp() {
  const [hasAccess, setHasAccess] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full bg-background dark selection:bg-primary-pink selection:text-white">
      {!hasAccess ? (
        <AccessScreen onAccessGranted={() => setHasAccess(true)} />
      ) : (
        <GameScreen />
      )}
    </div>
  );
}

// Note: onAccessGranted receives (address: string, walletId: WalletId) but
// BarbieApp only needs to know access was granted — unused params are fine.

function Router() {
  return (
    <Switch>
      <Route path="/" component={BarbieApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;