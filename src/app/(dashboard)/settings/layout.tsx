import Link from 'next/link'

const settingsNav = [
  { href: '/settings/embed', label: 'Embed' },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-8">
      {/* Settings sub-nav */}
      <aside className="w-48 shrink-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Settings</p>
        <nav className="space-y-1">
          {settingsNav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Page content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
