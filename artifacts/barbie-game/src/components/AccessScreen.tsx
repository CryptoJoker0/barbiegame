import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import barbieLogo from '@/assets/barbie-logo.png';

interface AccessScreenProps {
  onAccessGranted: () => void;
}

const AFRICA_NFT_CONTRACT = '0x0000000000000000000000000000000000000000';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function AccessScreen({ onAccessGranted }: AccessScreenProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'checking' | 'granted' | 'denied' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setStatus('error');
      setErrorMessage('Please install MetaMask to play!');
      return;
    }

    try {
      setStatus('connecting');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        checkNFT(accounts[0]);
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to connect wallet');
    }
  };

  const checkNFT = async (address: string) => {
    setStatus('checking');
    
    // Demo mode: skip real check if zero address
    if (AFRICA_NFT_CONTRACT === '0x0000000000000000000000000000000000000000') {
      setTimeout(() => {
        setStatus('granted');
        setTimeout(() => {
          onAccessGranted();
        }, 2000);
      }, 1500);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        AFRICA_NFT_CONTRACT,
        ['function balanceOf(address owner) view returns (uint256)'],
        provider
      );
      
      const balance = await contract.balanceOf(address);
      
      if (balance.gt(0)) {
        setStatus('granted');
        setTimeout(() => {
          onAccessGranted();
        }, 2000);
      } else {
        setStatus('denied');
        setErrorMessage('🚫 Access Denied — You need an AFRICA NFT to play');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Failed to verify NFT ownership');
    }
  };

  const disconnect = () => {
    setWalletAddress(null);
    setStatus('idle');
    setErrorMessage(null);
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center radial-glow p-4 relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute top-10 left-10 text-4xl opacity-20 animate-pulse">👑</div>
      <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-pulse delay-1000">7️⃣</div>
      <div className="absolute top-40 right-20 text-4xl opacity-20 animate-pulse delay-500">🎀</div>
      <div className="absolute bottom-40 left-20 text-4xl opacity-20 animate-pulse delay-700">🧀</div>

      <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <img 
          src={barbieLogo} 
          alt="BARBIE FUN GAME" 
          className="w-full max-w-[500px] mb-8 drop-shadow-[0_0_20px_rgba(255,20,147,0.8)] animate-in slide-in-from-top-10 duration-1000"
        />
        
        <p className="text-xl md:text-2xl text-center font-bold text-white mb-10 neon-text max-w-lg leading-relaxed">
          Only AFRICA NFT holders can enter the lucky kingdom
        </p>

        {!walletAddress ? (
          <Button 
            onClick={connectWallet}
            disabled={status === 'connecting'}
            className="h-16 px-10 text-xl font-bold rounded-full bg-gradient-to-r from-primary-pink to-secondary-pink hover:from-secondary-pink hover:to-primary-pink text-white neon-shadow transition-all hover:scale-105"
          >
            {status === 'connecting' ? 'Connecting...' : '🦊 Connect Wallet'}
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="px-6 py-3 bg-[#2d1b4e] border-2 border-gold rounded-full gold-text font-mono font-bold text-lg neon-shadow">
                {truncateAddress(walletAddress)}
              </div>
              <Button 
                variant="outline" 
                onClick={disconnect}
                disabled={status === 'checking' || status === 'granted'}
                className="rounded-full border-primary-pink text-primary-pink hover:bg-primary-pink/20"
              >
                Disconnect
              </Button>
            </div>

            <div className="mt-8 text-center min-h-[60px]">
              {status === 'checking' && (
                <p className="text-secondary-pink font-bold animate-pulse text-xl">Verifying NFT Access...</p>
              )}
              {status === 'granted' && (
                <p className="text-[#00ff00] font-bold text-2xl drop-shadow-[0_0_10px_rgba(0,255,0,0.8)] animate-bounce">
                  ✨ Access Granted! Welcome, AFRICA NFT holder!
                </p>
              )}
              {status === 'denied' && (
                <p className="text-destructive font-bold text-xl drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
                  {errorMessage}
                </p>
              )}
              {status === 'error' && (
                <p className="text-destructive font-bold text-xl">{errorMessage}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}