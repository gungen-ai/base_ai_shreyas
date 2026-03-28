'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type BillingData = {
  plan: string
  subscription: {
    status: string
    currentPeriodEnd: string | null
    stripeCustomerId: string | null
  } | null
}

const FREE_FEATURES = [
  'AI-guided KB setup',
  'Up to 10 KB entries',
  'Policy import (PDF, DOCX, URL)',
  'Storefront widget',
  'Up to 20 tickets/month',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited KB entries',
  'Shopify sync',
  'Email channel inbox',
  'WhatsApp / SMS channel',
  'Unlimited tickets',
  'KB gap alerts',
  'Staleness alerts',
  'Ticket analytics dashboard',
  'KB export on cancellation',
]

function BillingContent() {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    fetch('/api/billing')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [])

  async function handleUpgrade() {
    setUpgrading(true)
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create-checkout' }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    setUpgrading(false)
  }

  async function handlePortal() {
    setUpgrading(true)
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create-portal' }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    setUpgrading(false)
  }

  const isPro = data?.plan === 'pro'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and plan</p>
      </div>

      {/* Success/cancel banners */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-800 font-medium">🎉 You're now on the Pro plan!</p>
          <p className="text-green-700 text-sm mt-1">All Pro features are now unlocked.</p>
        </div>
      )}
      {canceled && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-800 font-medium">Upgrade canceled</p>
          <p className="text-amber-700 text-sm mt-1">You are still on the Free plan.</p>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free plan */}
          <div className={`bg-white rounded-xl border-2 p-6 ${!isPro ? 'border-indigo-400' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Free</h2>
              {!isPro && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                  Current plan
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">$0</p>
            <p className="text-sm text-gray-500 mb-6">Forever free</p>
            <ul className="space-y-2">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro plan */}
          <div className={`bg-white rounded-xl border-2 p-6 ${isPro ? 'border-indigo-400' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Pro</h2>
              {isPro && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                  Current plan
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">$19</p>
            <p className="text-sm text-gray-500 mb-6">per month</p>
            <ul className="space-y-2 mb-6">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>

            {!isPro ? (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {upgrading ? 'Redirecting...' : 'Upgrade to Pro →'}
              </button>
            ) : (
              <button
                onClick={handlePortal}
                disabled={upgrading}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {upgrading ? 'Redirecting...' : 'Manage subscription →'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400 py-12">Loading...</div>}>
      <BillingContent />
    </Suspense>
  )
}
