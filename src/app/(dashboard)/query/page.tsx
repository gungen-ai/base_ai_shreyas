'use client'

import { useState, useEffect } from 'react'

export default function QueryPlaygroundPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'answer' | 'ticket'
    answer?: string
    category?: string
    message?: string
    ticketId?: string
  } | null>(null)
  const [merchantId, setMerchantId] = useState('')

  useEffect(() => {
    fetch('/api/kb')
      .then(r => r.json())
      .then(data => {
        if (data.entries?.length > 0) {
          setMerchantId(data.entries[0].merchantId)
        }
      })
  }, [])

  async function handleQuery(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || !merchantId) return

    setLoading(true)
    setResult(null)

    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, merchantId, channel: 'widget' }),
    })

    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Query Engine</h1>
        <p className="text-gray-500 mt-1">
          Test how your AI responds to customer questions
        </p>
      </div>

      {/* How it works */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
        <p className="text-sm text-indigo-800 font-medium mb-1">How it works</p>
        <p className="text-sm text-indigo-700">
          Type a customer question below. If it matches an active KB entry, 
          Claude will rephrase the answer. If not, a support ticket is created automatically.
        </p>
      </div>

      {/* Query form */}
      <form onSubmit={handleQuery} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer question
        </label>
        <textarea
          rows={3}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. How long does shipping take?"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />
        <button
          type="submit"
          disabled={loading || !query.trim() || !merchantId}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors w-full"
        >
          {loading ? 'Thinking...' : 'Ask AI →'}
        </button>
        {!merchantId && (
          <p className="text-xs text-amber-600 mt-2 text-center">
            Add at least one KB entry first to test the query engine
          </p>
        )}
      </form>

      {/* Result */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
          <p className="text-sm text-gray-400 mt-4">Claude is thinking...</p>
        </div>
      )}

      {result && !loading && (
        <div className={`rounded-xl border p-6 ${
          result.type === 'answer'
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">
              {result.type === 'answer' ? '✅' : '🎫'}
            </span>
            <span className={`text-sm font-semibold ${
              result.type === 'answer' ? 'text-green-800' : 'text-amber-800'
            }`}>
              {result.type === 'answer' ? `Answer found · ${result.category}` : 'Ticket created'}
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${
            result.type === 'answer' ? 'text-green-900' : 'text-amber-900'
          }`}>
            {result.type === 'answer' ? result.answer : result.message}
          </p>
          {result.ticketId && (
            <p className="text-xs text-amber-600 mt-2">
              Ticket ID: {result.ticketId}
            </p>
          )}
        </div>
      )}
    </div>
  )
}