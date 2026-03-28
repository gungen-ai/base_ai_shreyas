import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { merchants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

async function getMerchant(clerkUserId: string) {
  const existing = await db
    .select()
    .from(merchants)
    .where(eq(merchants.clerkUserId, clerkUserId))
    .limit(1)
  return existing[0] || null
}

async function ensureToken(merchant: typeof merchants.$inferSelect): Promise<string> {
  if (merchant.widgetToken) return merchant.widgetToken
  const token = randomUUID()
  await db
    .update(merchants)
    .set({ widgetToken: token })
    .where(eq(merchants.id, merchant.id))
  return token
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const merchant = await getMerchant(userId)
  if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

  const token = await ensureToken(merchant)
  return NextResponse.json({ widgetToken: token })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const merchant = await getMerchant(userId)
  if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

  const token = randomUUID()
  await db
    .update(merchants)
    .set({ widgetToken: token })
    .where(eq(merchants.id, merchant.id))

  return NextResponse.json({ widgetToken: token })
}
