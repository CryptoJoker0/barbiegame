import { useState, useCallback, useRef, useEffect } from 'react';
import { playWinSound, playJackpotSound, triggerConfetti } from '@/lib/utils';

export const SYMBOLS = ['7️⃣', '🧀', '👑', '🍷', '🎀'];
const WEIGHTS = [1, 5, 3, 4, 5]; // 7️⃣ is rarest

export const PAYOUTS: Record<string, number> = {
  '7️⃣7️⃣7️⃣': 7777,
  '🧀🧀🧀': 777,
  '👑👑👑': 500,
  '🍷🍷🍷': 200,
  '🎀🎀🎀': 100,
};

function getRandomSymbol() {
  const totalWeight = WEIGHTS.reduce((a, b) => a + b, 0);
  let random = Math.floor(Math.random() * totalWeight);
  
  for (let i = 0; i < SYMBOLS.length; i++) {
    random -= WEIGHTS[i];
    if (random < 0) return SYMBOLS[i];
  }
  return SYMBOLS[0];
}

export function useGameState() {
  const [balance, setBalance] = useState(1000);
  const [cheese, setCheese] = useState(0);
  const [jackpot, setJackpot] = useState(7777);
  const [streak, setStreak] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  
  const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [startTime] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const [freeSpins, setFreeSpins] = useState(0);
  
  const autoSpinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, startTime]);

  const spin = useCallback((isFreeSpin = false) => {
    if (isSpinning || (balance < 10 && !isFreeSpin)) return;
    
    setIsSpinning(true);
    setLastWin(null);
    
    if (!isFreeSpin) {
      setBalance(b => b - 10);
    } else {
      setFreeSpins(f => Math.max(0, f - 1));
    }
    
    setTotalSpins(t => t + 1);
    
    const result = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // Delay resolution to simulate spinning
    setTimeout(() => {
      setReels(result);
      
      const key = result.join('');
      let winAmount = 0;
      let newCheese = 0;
      let newJackpot = jackpot + 1; // Grow jackpot on every spin
      let newStreak = streak;
      
      // Calculate wins
      if (PAYOUTS[key]) {
        winAmount = PAYOUTS[key];
      }
      
      // Check for two 7s
      const sevensCount = result.filter(s => s === '7️⃣').length;
      if (sevensCount === 2 && winAmount === 0) {
        winAmount = 50;
      }
      
      // Check for cheese
      newCheese = result.filter(s => s === '🧀').length;
      
      // Streak bonus
      if (streak >= 3 && winAmount > 0) {
        winAmount += Math.floor(winAmount * streak * 0.1);
      }
      
      // Jackpot trigger
      if (winAmount >= 7777) {
        winAmount = jackpot; // Actual current jackpot pool
        newJackpot = 7777; // Reset
      }

      // Update state
      if (winAmount > 0) {
        newStreak++;
        if (soundEnabled) {
          if (winAmount >= 500) {
            playJackpotSound();
            triggerConfetti();
          } else {
            playWinSound();
          }
        }
      } else {
        newStreak = 0;
      }
      
      setBalance(b => b + winAmount);
      setCheese(c => c + newCheese);
      setJackpot(newJackpot);
      setStreak(newStreak);
      setLastWin(winAmount);
      setIsSpinning(false);
      
    }, 600);
    
  }, [balance, jackpot, streak, isSpinning, soundEnabled]);

  // Auto-spin logic
  useEffect(() => {
    if (isAutoSpin && !isPaused && !isSpinning && (balance >= 10 || freeSpins > 0)) {
      autoSpinTimeoutRef.current = setTimeout(() => {
        spin(freeSpins > 0);
      }, 1000);
    } else if (!isAutoSpin || balance < 10) {
      if (autoSpinTimeoutRef.current) clearTimeout(autoSpinTimeoutRef.current);
    }
    
    return () => {
      if (autoSpinTimeoutRef.current) clearTimeout(autoSpinTimeoutRef.current);
    };
  }, [isAutoSpin, isPaused, isSpinning, balance, spin, freeSpins]);

  const buyBonus = useCallback(() => {
    if (cheese >= 5) {
      setCheese(c => c - 5);
      setFreeSpins(f => f + 3);
      if (soundEnabled) playWinSound();
    }
  }, [cheese, soundEnabled]);

  const resetGame = useCallback(() => {
    setBalance(1000);
    setCheese(0);
    setStreak(0);
    setIsAutoSpin(false);
    setLastWin(null);
  }, []);

  return {
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
  };
}