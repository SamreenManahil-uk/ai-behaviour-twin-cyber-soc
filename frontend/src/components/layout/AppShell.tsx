import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={[
          'min-h-screen transition-[margin] duration-300',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72',
        ].join(' ')}
      >
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="soc-grid-background min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
