'use client'

import { useState, useEffect } from 'react'

export default function EmbedPage() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState(false)

  useEffect(() => {
    fetch('/api/widget-token')
      .then(r => r.json())
      .then(d => {
        setToken(d.widgetToken)
        setLoading(false)
      })
  }, [])

  async function handleRegenerate() {
    if (!confirm('Regenerating will break any existing embeds using the current token. Continue?')) return
    setRegenerating(true)
    const res = await fetch('/api/widget-token', { method: 'POST' })
    const d = await res.json()
    setToken(d.widgetToken)
    setRegenerating(false)
  }

  function copy(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const snippet = `<script src="https://base-ai-beryl.vercel.app/base-ai-widget.js"\n  data-token="${token ?? ''}">\n</script>`

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Embed Widget</h1>
        <p className="text-gray-500 mt-1">Add the AI chat widget to your storefront</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : (
        <div className="space-y-6">

          {/* Section 1 — Widget Token */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Your Widget Token</h2>
            <p className="text-sm text-gray-500 mb-4">Use this token to authenticate your embedded widget.</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-mono text-gray-800 break-all">
                {token}
              </code>
              <button
                onClick={() => copy(token!, setCopiedToken)}
                className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                {copiedToken ? 'Copied!' : 'Copy Token'}
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
              <p className="text-xs text-amber-600">
                Warning: regenerating will break any existing embeds using the current token.
              </p>
            </div>
          </div>

          {/* Section 2 — Embed Code */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Embed Code</h2>
            <p className="text-sm text-gray-500 mb-4">Paste this snippet into your site to load the widget.</p>
            <div className="relative">
              <pre className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-800 overflow-x-auto whitespace-pre">
                {snippet}
              </pre>
              <button
                onClick={() => copy(snippet, setCopiedSnippet)}
                className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                {copiedSnippet ? 'Copied!' : 'Copy Snippet'}
              </button>
            </div>
          </div>

          {/* Section 3 — Installation Instructions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Installation Instructions</h2>
            <p className="text-sm text-gray-500 mb-4">Get the widget running on your site in seconds.</p>
            <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700">
              <li>Copy the embed code above.</li>
              <li>Paste it before the closing <code className="font-mono bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag on your website.</li>
              <li>That&apos;s it — the chat widget will appear automatically.</li>
            </ol>
          </div>

        </div>
      )}
    </div>
  )
}
