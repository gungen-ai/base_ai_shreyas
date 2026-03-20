'use client'

import { useState, useEffect, useCallback } from 'react'

type KBEntry = {
  id: string
  category: string
  question: string
  answer: string
  status: string
  source: string
  createdAt: string
}

const CATEGORIES = ['Shipping','Returns','Refunds','Product FAQs','Order Issues','General']

export default function KBPage() {
  const [entries, setEntries] = useState<KBEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ category: 'Shipping', question: '', answer: '' })

  const fetchEntries = useCallback(async () => {
    const res = await fetch('/api/kb')
    const data = await res.json()
    setEntries(data.entries || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await fetch('/api/kb', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ category: 'Shipping', question: '', answer: '' })
    setShowForm(false)
    setSubmitting(false)
    fetchEntries()
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/kb', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    fetchEntries()
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/kb?id=${id}`, { method: 'DELETE' })
    fetchEntries()
  }

  const statusColor: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-500 mt-1">{entries.length} entries · {entries.filter(e => e.status === 'active').length} active</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">+ Add Entry</button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New KB Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input type="text" required placeholder="e.g. How long does shipping take" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
              <textarea required rows={4} placeholder="e.g. We ship within 3-5 business days..." value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">{submitting ? 'Saving...' : 'Save as Draft'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl">📚</span>
            <p className="text-gray-900 font-medium mt-4">No KB entries yet</p>
            <p className="text-gray-500 text-sm mt-1">Click Add Entry to create your first article</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-2">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Question</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{entry.category}</span></td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{entry.question}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{entry.answer}</p>
                  </td>
                  <td className="px-6 py-4"><span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[entry.status]}`}>{entry.status}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {entry.status === 'draft' && <button onClick={() => updateStatus(entry.id, 'active')} className="text-xs text-green-600 hover:text-green-800 font-medium">Activate</button>}
                      {entry.status === 'active' && <button onClick={() => updateStatus(entry.id, 'archived')} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Archive</button>}
                      <button onClick={() => deleteEntry(entry.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
