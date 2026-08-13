'use client'

import { useState } from 'react'
import BarbieBeastGame from '@/components/barbiebeast-game'
import { X1WalletPanel } from '@/components/x1-wallet-panel'

export default function Page() {
  const [unlocked, setUnlocked] = useState(false)
  if (!unlocked) return <main className="payment-gate"><div className="payment-gate-noise" /><div className="payment-gate-brand">BF / 001 <span>X1 MAINNET</span></div><div className="payment-gate-copy"><span className="eyebrow">BARBIEBEAST // ACCESS CONTROL</span><h1>CONNECT TO<br /><em>ENTER</em></h1><p>Connect your wallet and pay the 5 XNT entry fee to unlock the full game.</p></div><X1WalletPanel onPaid={() => setUnlocked(true)} /><small className="payment-gate-note">PHANTOM · BACKPACK · X1 WEB WALLET / 5 XNT REQUIRED</small></main>
  return <BarbieBeastGame />
}
