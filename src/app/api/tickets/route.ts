import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tickets, kbEntries, merchants } from '@/lib/db/schema'
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

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const merchant = await getMerchant(userId)
  if (!merchant) return NextResponse.json({ tickets: [] })

  const allTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.merchantId, merchant.id))
    .orderBy(tickets.createdAt)

  return NextResponse.json({ tickets: allTickets })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, draftedAnswer, status, addToKb, category } = body

  const updated = await db
    .update(tickets)
    .set({
      draftedAnswer,
      status,
      resolvedAt: status === 'resolved' ? new Date() : undefined,
    })
    .where(eq(tickets.id, id))
    .returning()

  // Optionally add answer to KB
  if (addToKb && updated[0]) {
    await db.insert(kbEntries).values({
      id: randomUUID(),
      merchantId: updated[0].merchantId,
      category: category || 'General',
      question: updated[0].rawQuery,
      answer: draftedAnswer,
      source: 'ticket-resolved',
      status: 'draft',
    })
  }

  return NextResponse.json({ ticket: updated[0] })
}