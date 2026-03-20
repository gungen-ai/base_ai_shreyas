import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { merchants, subscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { randomUUID } from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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

  const sub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.merchantId, merchant.id))
    .limit(1)

  return NextResponse.json({
    plan: merchant.plan,
    subscription: sub[0] || null,
  })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const merchant = await getMerchant(userId)
  const body = await req.json()

  if (body.action === 'create-checkout') {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      metadata: {
        merchantId: merchant.id,
      },
    })

    return NextResponse.json({ url: session.url })
  }

  if (body.action === 'create-portal') {
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.merchantId, merchant.id))
      .limit(1)

    if (!sub[0]?.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub[0].stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    })

    return NextResponse.json({ url: session.url })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
