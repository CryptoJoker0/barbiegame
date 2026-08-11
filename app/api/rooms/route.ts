import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { randomBytes } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gameRoom } from '@/lib/db/schema'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  return session.user.id
}
function roomCode() { return randomBytes(3).toString('hex').toUpperCase() }

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await request.json().catch(() => ({})) as { code?: string }
  if (body.code) {
    const [room] = await db.select().from(gameRoom).where(eq(gameRoom.code, body.code.toUpperCase())).limit(1)
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    if (room.hostUserId === userId) return NextResponse.json(room)
    if (room.guestUserId && room.guestUserId !== userId) return NextResponse.json({ error: 'Room is full' }, { status: 409 })
    const [joined] = await db.update(gameRoom).set({ guestUserId: userId, status: 'ready', updatedAt: new Date() }).where(eq(gameRoom.id, room.id)).returning()
    return NextResponse.json(joined)
  }
  const [created] = await db.insert(gameRoom).values({ id: crypto.randomUUID(), code: roomCode(), hostUserId: userId, status: 'waiting' }).returning()
  return NextResponse.json(created, { status: 201 })
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const rooms = await db.select().from(gameRoom).where(eq(gameRoom.hostUserId, userId)).orderBy(desc(gameRoom.createdAt))
  return NextResponse.json(rooms)
}
