import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Generate a semantic embedding representation for this text. Return ONLY a JSON array of 1536 numbers between -1 and 1, nothing else: "${text}"`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  try {
    const embedding = JSON.parse(content.text)
    if (!Array.isArray(embedding)) throw new Error('Not an array')
    return embedding
  } catch {
    throw new Error('Failed to parse embedding')
  }
}