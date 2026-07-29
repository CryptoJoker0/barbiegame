import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useGameState, SYMBOLS } from '@/hooks/useGameState';
import { Volume2, VolumeX, Pause, Play, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// A single slot reel component that handles its own rapid spin animation
function Reel({ 
  symbol, 
  isSpinning, 
  delay 
}: { 
  symbol: string, 
  isSpinning: boolean, 
  delay: number 
}) {
  const [displaySymbol, setDisplaySymbol] = useState(symbol);
  
  useEffect(() => {
    if (!isSpinning) {
      setDisplaySymbol(symbol);
      return;
    }

    let i = 0;
    // Rapid fire changing symbols
    const interval = setInterval(() => {
      setDisplaySymbol(SYMBOLS[i % SYMBOLS.length]);
      i++;
    }, 50);
    
    // Stop spinning after a delay to create stagger effect
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplaySymbol(symbol);
    }, delay);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isSpinning, symbol, delay]);

  return (
    <div className="w-full h-[150px] md:h-[200px] flex items-center justify-center bg-[#110515] border-4 border-primary-pink rounded-xl neon-shadow overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
      <span className={cn(
        "text-6xl md:text-8xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-transform",
        !isSpinning && "symbol-glow"
      )}>
        {displaySymbol}
      </span>
    </div>
  );
}

export default function GameScreen() {
  const {
    balance,
    cheese,
    jackpot,
    streak,
    totalSpins,
    reels,
    isSpinning,
    lastWin,
    isAutoSpin,
    setIsAutoSpin,
    isPaused,
    setIsPaused,
    soundEnabled,
    setSoundEnabled,
    elapsedSeconds,
    spin,
    buyBonus,
    freeSpins,
    resetGame
  } = useGameState();

  const isGameOver = balance <= 0 && !isAutoSpin && !isSpinning && freeSpins === 0;

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-mono text-white pb-10">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 border-b border-primary-pink/30 bg-black/40 backdrop-blur-sm">
        <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-pink to-gold neon-text">
          BARBIEGame
        </h1>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full border-primary-pink text-primary-pink hover:bg-primary-pink/20 neon-shadow bg-transparent"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full border-primary-pink text-primary-pink hover:bg-primary-pink/20 neon-shadow bg-transparent"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* LEFT PANEL: STATS */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-4 rounded-xl flex flex-col items-center">
            <span className="text-sm text-secondary-pink uppercase tracking-widest font-bold">Balance</span>
            <div className="text-4xl font-bold gold-text flex items-center gap-2 mt-1">
              {balance} <Coins className="text-gold h-8 w-8" />
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl flex flex-col items-center">
            <span className="text-sm text-secondary-pink uppercase tracking-widest font-bold">Cheese</span>
            <div className="text-4xl font-bold flex items-center gap-2 mt-1">
              {cheese} <span className="text-3xl">🧀</span>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl flex flex-col items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary-pink/20 animate-pulse pointer-events-none" />
            <span className="text-sm text-secondary-pink uppercase tracking-widest font-bold z-10">Jackpot Pool</span>
            <div className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] flex items-center gap-2 mt-1 z-10">
              {jackpot} <span className="text-3xl">👑</span>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl flex flex-col items-center">
            <span className="text-sm text-secondary-pink uppercase tracking-widest font-bold">Win Streak</span>
            <div className="text-4xl font-bold text-orange-500 drop-shadow-[0_0_10px_rgba(255,165,0,0.8)] flex items-center gap-2 mt-1">
              {streak} <span className="text-3xl">🔥</span>
            </div>
            {streak >= 3 && <span className="text-xs text-green-400 mt-2 animate-pulse">+{(streak * 10).toFixed(0)}% Bonus Active</span>}
          </div>
        </div>

        {/* CENTER PANEL: SLOT MACHINE */}
        <div className="flex flex-col items-center justify-center">
          <div className={cn(
            "w-full glass-card p-6 md:p-10 rounded-[2rem] neon-border flex flex-col items-center gap-8",
            lastWin && lastWin > 0 && "animate-slot-bounce border-gold"
          )}>
            
            {/* Jackpot Header inside Machine */}
            <div className="px-8 py-2 rounded-full border-2 border-gold bg-black/60 gold-text text-xl md:text-2xl font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.5)]">
              Mega Jackpot: {jackpot} 👑
            </div>

            {/* Reels Container */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 w-full">
              <Reel symbol={reels[0]} isSpinning={isSpinning} delay={200} />
              <Reel symbol={reels[1]} isSpinning={isSpinning} delay={400} />
              <Reel symbol={reels[2]} isSpinning={isSpinning} delay={600} />
            </div>

            {/* Win Display */}
            <div className="h-16 w-full flex items-center justify-center">
              {lastWin !== null && (
                <div className={cn(
                  "px-8 py-2 rounded-lg font-black text-2xl animate-in zoom-in slide-in-from-bottom-2",
                  lastWin > 0 
                    ? "bg-green-500/20 text-green-400 border border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                    : "text-muted-foreground opacity-50"
                )}>
                  {lastWin > 0 ? `WIN! +${lastWin} 💰` : 'NO WIN'}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: CONTROLS */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 rounded-xl flex flex-col gap-6">
            <Button 
              onClick={() => spin(false)}
              disabled={isSpinning || isPaused || (balance < 10 && freeSpins === 0)}
              className={cn(
                "h-20 text-2xl font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_0_rgb(180,20,100)] active:shadow-none active:translate-y-1",
                freeSpins > 0 
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_4px_0_rgb(100,20,180)] hover:scale-105"
                  : "bg-gradient-to-r from-primary-pink to-secondary-pink text-white hover:scale-105"
              )}
            >
              {freeSpins > 0 ? `FREE SPIN (${freeSpins})` : 'SPIN / 10 💰'}
            </Button>
            
            <div className="flex items-center justify-between px-2">
              <label htmlFor="auto-spin" className="font-bold text-lg cursor-pointer">Auto Spin</label>
              <Switch 
                id="auto-spin" 
                checked={isAutoSpin} 
                onCheckedChange={setIsAutoSpin}
                className="data-[state=checked]:bg-primary-pink"
              />
            </div>

            <div className="w-full h-[1px] bg-primary-pink/30 my-2" />
            
            <Button
              variant="outline"
              onClick={buyBonus}
              disabled={cheese < 5 || isSpinning || isPaused}
              className="h-14 font-bold bg-transparent border-gold text-gold hover:bg-gold/20"
            >
              BUY 3 FREE SPINS (Costs 5 🧀)
            </Button>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-secondary-pink font-bold uppercase tracking-widest text-center mb-4 border-b border-primary-pink/30 pb-2">Paytable</h3>
            <div className="space-y-3 text-sm md:text-base">
              <div className="flex justify-between items-center"><span className="tracking-widest">7️⃣7️⃣7️⃣</span> <span className="gold-text font-bold">JACKPOT</span></div>
              <div className="flex justify-between items-center"><span className="tracking-widest">🧀🧀🧀</span> <span>777 💰</span></div>
              <div className="flex justify-between items-center"><span className="tracking-widest">👑👑👑</span> <span>500 💰</span></div>
              <div className="flex justify-between items-center"><span className="tracking-widest">🍷🍷🍷</span> <span>200 💰</span></div>
              <div className="flex justify-between items-center"><span className="tracking-widest">🎀🎀🎀</span> <span>100 💰</span></div>
              <div className="w-full h-[1px] bg-white/10 my-2" />
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Any 2x 7️⃣</span> <span className="text-muted-foreground">50 💰</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Any 🧀</span> <span className="text-muted-foreground">+1 🧀</span></div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-3 bg-black/80 backdrop-blur-md border-t border-primary-pink/30 flex justify-between items-center z-40 text-xs md:text-sm">
        <div className="flex items-center gap-2 text-green-400 font-bold">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          AFRICA NFT Verified
        </div>
        <div className="text-muted-foreground font-mono">
          {totalSpins} spins | {formatTime(elapsedSeconds)}
        </div>
      </footer>

      {/* Game Over Modal */}
      <Dialog open={isGameOver} onOpenChange={() => {}}>
        <DialogContent className="bg-[#1a0a1a] border-primary-pink text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-black text-destructive neon-text mb-4">
              GAME OVER
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <span className="text-6xl mb-2">💸</span>
            <p className="text-xl">You're out of coins!</p>
            <p className="text-muted-foreground">But in the Barbie Dream Casino, the party never really stops.</p>
          </div>
          <DialogFooter>
            <Button 
              onClick={resetGame}
              className="w-full h-14 text-xl font-bold bg-gradient-to-r from-primary-pink to-gold text-white hover:scale-105 transition-transform"
            >
              Play Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}