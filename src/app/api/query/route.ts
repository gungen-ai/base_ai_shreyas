import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { kbEntries, tickets, merchants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { query, merchantId, channel = 'widget' } = body

  if (!query || !merchantId) {
    return NextResponse.json({ error: 'Missing query or merchantId' }, { status: 400 })
  }

  // Get all active KB entries for this merchant
  const activeEntries = await db
    .select()
    .from(kbEntries)
    .where(eq(kbEntries.merchantId, merchantId))

  const onlyActive = activeEntries.filter(e => e.status === 'active')

  if (onlyActive.length === 0) {
    // No active entries — create ticket
    const ticket = await createTicket(merchantId, query, channel)
    return NextResponse.json({
      type: 'ticket',
      message: 'No active KB entries found. A ticket has been created.',
      ticketId: ticket.id,
    })
  }

  // Simple keyword matching to find best entry
  const queryLower = query.toLowerCase()
  let bestMatch = null
  let bestScore = 0

  for (const entry of onlyActive) {
    const questionLower = entry.question.toLowerCase()
    const answerLower = entry.answer.toLowerCase()
    const categoryLower = entry.category.toLowerCase()

    const questionWords = questionLower.split(' ')
    const queryWords = queryLower.split(' ')

    let score = 0
    for (const word of queryWords) {
      if (word.length < 3) continue
      if (questionLower.includes(word)) score += 3
      if (answerLower.includes(word)) score += 1
      if (categoryLower.includes(word)) score += 2
    }

    // Bonus for exact phrase match
    if (questionLower.includes(queryLower)) score += 10

    if (score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  const CONFIDENCE_THRESHOLD = 3

  if (!bestMatch || bestScore < CONFIDENCE_THRESHOLD) {
    // No good match — create ticket
    const ticket = await createTicket(merchantId, query, channel)
    return NextResponse.json({
      type: 'ticket',
      message: "We couldn't find an answer in our knowledge base. A support ticket has been created and our team will get back to you shortly.",
      ticketId: ticket.id,
    })
  }

  // Good match found — rephrase with Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 512,
    system: `You are a helpful customer support assistant. 
Your ONLY job is to rephrase the provided answer in a friendly, conversational tone.
You must ONLY use the information provided in the answer below.
Do NOT add any information that is not in the answer.
Do NOT make up any details.
Keep it concise and clear.`,
    messages: [
      {
        role: 'user',
        content: `Customer question: ${query}

Answer from knowledge base: ${bestMatch.answer}

Please rephrase this answer in a friendly, conversational tone.`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response')

  return NextResponse.json({
    type: 'answer',
    answer: content.text,
    category: bestMatch.category,
    entryId: bestMatch.id,
  })
}

async function createTicket(merchantId: string, query: string, channel: string) {
  const ticket = await db
    .insert(tickets)
    .values({
      id: randomUUID(),
      merchantId,
      rawQuery: query,
      channel,
      status: 'submitted',
    })
    .returning()

  return ticket[0]
}