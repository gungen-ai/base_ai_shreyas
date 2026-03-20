'use client'

import { useState, useEffect, useCallback } from 'react'

type Ticket = {
  id: string
  rawQuery: string
  draftedAnswer: string | null
  status: string
  channel: string
  createdAt: string
  resolvedAt: string | null
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-500',
}

const CATEGORIES = ['Shipping', 'Returns', 'Refunds', 'Product FAQs', 'Order Issues', 'General']

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [answer, setAnswer] = useState('')
  const [addToKb, setAddToKb] = useState(false)
  const [category, setCategory] = useState('General')
  const [submitting, setSubmitting] = useState(false)

  const fetchTickets = useCallback(async () => {
    const res = await fetch('/api/tickets')
    const data = await res.json()
    setTickets(data.tickets || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  async function resolveTicket() {
    if (!selected || !answer.trim()) return
    setSubmitting(true)
    await fetch('/api/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, draftedAnswer: answer, status: 'resolved', addToKb, category }),
    })
    setSelected(null)
    setAnswer('')
    setAddToKb(false)
    setSubmitting(false)
    fetchTickets()
  }

  const openTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed')
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed')

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 mt-1">{openTickets.length} open · {resolvedTickets.length} resolved</p>
        </div>
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <span className="text-4xl">🎫</span>
            <p className="text-gray-900 font-medium mt-4">No tickets yet</p>
            <p className="text-gray-500 text-sm mt-1">Tickets are created automatically when the AI cannot answer a question</p>
          </div>
        ) : (
          <div className="space-y-3">
            {openTickets.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">Open</p>
                {openTickets.map(ticket => (
               <div
                    key={ticket.id}
                    onClick={() => { setSelected(ticket); setAnswer(ticket.draftedAnswer || '') }}
                    className={[
                      'bg-white rounded-xl border p-4 cursor-pointer transition-colors mb-2',
                      selected?.id === ticket.id ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-gray-200 hover:border-gray-300'
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-gray-900">{ticket.rawQuery}</p>
                      <span className={['text-xs px-2 py-1 rounded-full shrink-0 font-medium', STATUS_COLORS[ticket.status]].join(' ')}>{ticket.status}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">via {ticket.channel}</span>
                      <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {resolvedTickets.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2 px-1 mt-4">Resolved</p>
                {resolvedTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => { setSelected(ticket); setAnswer(ticket.draftedAnswer || '') }}
                    className={[
                      'bg-white rounded-xl border p-4 cursor-pointer transition-colors mb-2 opacity-60',
                      selected?.id === ticket.id ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-gray-200 hover:border-gray-300'
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-gray-900">{ticket.rawQuery}</p>
                      <span className={['text-xs px-2 py-1 rounded-full shrink-0 font-medium', STATUS_COLORS[ticket.status]].join(' ')}>{ticket.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {selected && (
        <div className="w-96 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Resolve ticket</h2>
            <p className="text-xs text-gray-400 mb-4">#{selected.id.slice(0, 8)}</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Customer asked</p>
              <p className="text-sm text-gray-900">{selected.rawQuery}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your answer</label>
              <textarea
                rows={5}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Write your answer to the customer..."
                disabled={selected.status === 'resolved'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            {selected.status !== 'resolved' && (
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={addToKb} onChange={e => setAddToKb(e.target.checked)} className="rounded" />
                  <span className="text-sm text-gray-700">Add this answer to Knowledge Base</span>
                </label>
                {addToKb && (
                  <div className="mt-2">
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
            {selected.status !== 'resolved' ? (
              <div className="flex gap-2">
                <button
                  onClick={resolveTicket}
                  disabled={!answer.trim() || submitting}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Saving...' : 'Resolve ticket'}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-sm text-green-700 font-medium">Resolved</p>
                {selected.resolvedAt && (
                  <p className="text-xs text-green-600 mt-1">{new Date(selected.resolvedAt).toLocaleDateString()}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
