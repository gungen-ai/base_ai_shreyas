import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { kbEntries, merchants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

async function getMerchant(clerkUserId: string) {
  const existing = await db
    .select()
    .from(merchants)
    .where(eq(merchants.clerkUserId, clerkUserId))
    .limit(1)

  if (existing.length > 0) return existing[0]

  const newMerchant = await db
    .insert(merchants)
    .values({
      id: randomUUID(),
      clerkUserId,
      name: '',
      email: '',
      plan: 'free',
    })
    .returning()

  return newMerchant[0]
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const merchant = await getMerchant(userId)

  const entries = await db
    .select()
    .from(kbEntries)
    .where(eq(kbEntries.merchantId, merchant.id))
    .orderBy(kbEntries.createdAt)

  return NextResponse.json({ entries })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const merchant = await getMerchant(userId)
  const body = await req.json()

  const entry = await db
    .insert(kbEntries)
    .values({
      id: randomUUID(),
      merchantId: merchant.id,
      category: body.category,
      question: body.question,
      answer: body.answer,
      source: 'manual',
      status: 'draft',
    })
    .returning()

  return NextResponse.json({ entry: entry[0] })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const entry = await db
    .update(kbEntries)
    .set({ status: body.status, lastUpdatedAt: new Date() })
    .where(eq(kbEntries.id, body.id))
    .returning()

  return NextResponse.json({ entry: entry[0] })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db.delete(kbEntries).where(eq(kbEntries.id, id))

  return NextResponse.json({ success: true })
}