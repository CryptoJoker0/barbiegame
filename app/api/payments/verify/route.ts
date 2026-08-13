import { Connection, PublicKey } from '@solana/web3.js'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { entryPayment } from '@/lib/db/schema'
import { headers } from 'next/headers'

const X1_RPC = 'https://rpc.mainnet.x1.xyz'
const RECIPIENT = '9rMJNa5QiNakB45qyymGBNVcALrcHYvwnm15mQcZJfNK'
const FEE_LAMPORTS = 5_000_000_000

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Sign in before paying the online entry fee' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const signature = typeof body.signature === 'string' ? body.signature : ''
  const walletAddress = typeof body.walletAddress === 'string' ? body.walletAddress : ''
  if (!signature || !walletAddress) return NextResponse.json({ error: 'Payment signature and wallet address are required' }, { status: 400 })
  try { new PublicKey(walletAddress) } catch { return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 }) }
  const existing = await db.select().from(entryPayment).where(eq(entryPayment.signature, signature)).limit(1)
  if (existing[0]?.status === 'verified') return NextResponse.json({ verified: true, signature })
  const connection = new Connection(X1_RPC, 'confirmed')
  const tx = await connection.getParsedTransaction(signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 })
  const transfer = tx?.transaction.message.instructions.flatMap(instruction => 'parsed' in instruction && instruction.parsed?.type === 'transfer' ? [instruction.parsed.info] : []).find(info => info.destination === RECIPIENT && info.source === walletAddress)
  if (!tx || tx.meta?.err || !transfer || Number(transfer.lamports) < FEE_LAMPORTS) return NextResponse.json({ error: 'Payment not confirmed for the required 5 XNT fee' }, { status: 400 })
  const id = existing[0]?.id ?? crypto.randomUUID()
  await db.insert(entryPayment).values({ id, userId: session.user.id, walletAddress, signature, amountLamports: String(transfer.lamports), network: 'x1-mainnet', status: 'verified', verifiedAt: new Date() }).onConflictDoNothing()
  return NextResponse.json({ verified: true, signature })
}
