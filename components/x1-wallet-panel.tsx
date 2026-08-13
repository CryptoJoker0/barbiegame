'use client'

import { useMemo, useState } from 'react'
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { Check, Copy, ExternalLink, Wallet, X } from 'lucide-react'

const X1_RPC = 'https://rpc.mainnet.x1.xyz'
const X1_CHAIN = 'X1 Mainnet'
const FEE_XNT = 5
const FEE_LAMPORTS = 5_000_000_000
const RECIPIENT = '9rMJNa5QiNakB45qyymGBNVcALrcHYvwnm15mQcZJfNK'

type Provider = { name: string; icon?: string; connect: () => Promise<{ publicKey: { toString(): string } }>; signAndSendTransaction?: (tx: Transaction) => Promise<{ signature: string }> }

declare global { interface Window { phantom?: { solana?: Provider }; backpack?: Provider; x1?: Provider } }

function providers() { if (typeof window === 'undefined') return []; const list: Provider[] = []; if (window.phantom?.solana) list.push({ ...window.phantom.solana, name: 'Phantom' }); if (window.backpack) list.push({ ...window.backpack, name: 'Backpack' }); if (window.x1) list.push({ ...window.x1, name: 'X1 Web Wallet' }); return list }

export function X1WalletPanel({ onPaid }: { onPaid: (signature: string) => void }) {
  const [address, setAddress] = useState('')
  const [walletName, setWalletName] = useState('')
  const [status, setStatus] = useState('Connect a wallet to enter the online arena')
  const [busy, setBusy] = useState(false)
  const available = useMemo(() => providers(), [])
  const connect = async (provider: Provider) => { setBusy(true); setStatus(`Opening ${provider.name}…`); try { const result = await provider.connect(); setAddress(result.publicKey.toString()); setWalletName(provider.name); setStatus(`${provider.name} connected. Entry fee: ${FEE_XNT} XNT.`) } catch (error) { setStatus(error instanceof Error ? error.message : 'Wallet connection was rejected') } finally { setBusy(false) } }
  const pay = async () => { if (!address || !walletName) return setStatus('Connect a wallet first'); const provider = providers().find(item => item.name === walletName); if (!provider?.signAndSendTransaction) return setStatus(`${walletName} does not expose transaction signing here`); setBusy(true); setStatus('Confirm the 5 XNT entry fee in your wallet…'); try { const connection = new Connection(X1_RPC, 'confirmed'); const from = new PublicKey(address); const to = new PublicKey(RECIPIENT); const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey: from, toPubkey: to, lamports: FEE_LAMPORTS })); tx.feePayer = from; tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash; const result = await provider.signAndSendTransaction(tx); const response = await fetch('/api/payments/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ signature: result.signature, walletAddress: address }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Payment verification failed'); setStatus('Payment verified. Online arena unlocked.'); onPaid(result.signature) } catch (error) { setStatus(error instanceof Error ? error.message : 'Payment cancelled') } finally { setBusy(false) } }
  const disconnect = () => { setAddress(''); setWalletName(''); setStatus('Wallet disconnected') }
  return <section className="x1-wallet-panel" aria-label="X1 Mainnet wallet payment"><div className="wallet-panel-head"><div><span className="wallet-kicker">ONLINE ENTRY // X1 MAINNET</span><h2>Unlock the Arena</h2><p>Pay {FEE_XNT} XNT before each online match.</p></div><Wallet size={24} /></div>{address ? <div className="wallet-connected"><div><small>{walletName} CONNECTED</small><b>{address.slice(0, 6)}…{address.slice(-6)}</b></div><button onClick={() => navigator.clipboard.writeText(address)} aria-label="Copy wallet address"><Copy size={15} /></button><button onClick={disconnect} aria-label="Disconnect wallet"><X size={15} /></button></div> : <div className="wallet-providers">{available.length ? available.map(provider => <button key={provider.name} disabled={busy} onClick={() => connect(provider)}><span>{provider.name[0]}</span>{provider.name}<ExternalLink size={13} /></button>) : <p className="wallet-empty">Install Phantom, Backpack, or X1 Web Wallet to continue.</p>}</div>}{address && <button className="wallet-pay" disabled={busy} onClick={pay}>{busy ? 'WAITING FOR WALLET…' : `PAY ${FEE_XNT} XNT & ENTER`} <Check size={16} /></button>}<div className="wallet-status">{status}</div><small className="wallet-recipient">Fee recipient: {RECIPIENT.slice(0, 8)}…{RECIPIENT.slice(-8)}</small></section>
}

export { FEE_XNT }
