import { currentUser } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  const user = await currentUser()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here is an overview of your knowledge base
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">KB Entries</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
          <p className="text-xs text-gray-400 mt-1">0 active</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Open Tickets</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
          <p className="text-xs text-gray-400 mt-1">0 submitted</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Queries Answered</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
          <p className="text-xs text-gray-400 mt-1">this month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Current Plan</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">Free</p>
          <p className="text-xs text-indigo-500 mt-1 cursor-pointer">Upgrade →</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Get started
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 rounded-lg border border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-medium text-gray-900">Add your first KB entry</p>
              <p className="text-sm text-gray-500">Build your knowledge base so customers get instant answers</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
            <span className="text-2xl">🛍️</span>
            <div>
              <p className="font-medium text-gray-900">Connect your Shopify store</p>
              <p className="text-sm text-gray-500">Sync your policies and product data automatically</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-medium text-gray-900">Install the chat widget</p>
              <p className="text-sm text-gray-500">Add AI-powered support to your storefront in minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}