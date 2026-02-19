"use client"

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { ROLES, BRANCHES } from '@/lib/data'

const NAV_ITEMS = [
  { section: 'UTAMA', items: [
    { page: 'dashboard', icon: '📊', label: 'Dashboard' },
    { page: 'pos', icon: '🛍️', label: 'Kasir (POS)' },
  ]},
  { section: 'INVENTORI', items: [
    { page: 'products', icon: '🧴', label: 'Produk' },
    { page: 'stock', icon: '📦', label: 'Stok', hasBadge: true },
  ]},
  { section: 'LAPORAN', items: [
    { page: 'transactions', icon: '🧾', label: 'Transaksi' },
    { page: 'reports', icon: '📈', label: 'Laporan' },
  ]},
  { section: 'MANAJEMEN', items: [
    { page: 'branches', icon: '🏪', label: 'Cabang' },
    { page: 'users', icon: '👥', label: 'Pengguna' },
  ]},
]

export function Sidebar() {
  const { currentUser, logout, currentPage, setCurrentPage, canAccess, db, toast } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!currentUser) return null

  const role = ROLES[currentUser.role]
  const colors: Record<string, string> = { owner: '#1C1917', admin: '#7C3AED', finance: '#1D4ED8', head: '#D97706', cashier: '#15803D' }
  const initials = currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const lowStockCount = db.products.filter(p => p.stock.some(s => s <= p.minStock)).length

  function navTo(page: string) {
    if (!canAccess(page)) {
      toast('Anda tidak memiliki akses ke halaman ini', 'error')
      return
    }
    setCurrentPage(page)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none', position: 'fixed', top: 14, left: 12, zIndex: 200,
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text)', padding: 4,
        }}
        className="mobile-menu-btn"
      >
        {'☰'}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }}
          className="sidebar-overlay"
        />
      )}

      <aside style={{
        width: 230, background: 'var(--sidebar-bg)', color: 'white', display: 'flex',
        flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100,
        transition: 'transform 0.3s',
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}
        className="app-sidebar"
      >
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontFamily: 'var(--font-serif), Fraunces, serif', fontSize: 22, color: 'var(--accent)', letterSpacing: -0.5 }}>
            NM Parfum
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 }}>
            Parfum Racikan Custom
          </div>
        </div>

        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '14px 8px 5px', marginTop: 4 }}>
                {section.section}
              </div>
              {section.items.filter(item => role?.pages.includes(item.page)).map(item => (
                <div
                  key={item.page}
                  onClick={() => navTo(item.page)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8,
                    cursor: 'pointer', fontSize: 13,
                    color: currentPage === item.page ? 'white' : 'rgba(255,255,255,0.55)',
                    background: currentPage === item.page ? 'var(--accent)' : 'transparent',
                    fontWeight: currentPage === item.page ? 600 : 400,
                    transition: 'all 0.15s', userSelect: 'none',
                  }}
                  onMouseOver={e => { if (currentPage !== item.page) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' } }}
                  onMouseOut={e => { if (currentPage !== item.page) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' } }}
                >
                  <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                  {item.hasBadge && lowStockCount > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
                      {lowStockCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
              background: colors[currentUser.role] || '#666',
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>{currentUser.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {role?.label}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%', padding: 8, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
              color: 'rgba(255,255,255,0.5)', fontFamily: 'inherit', fontSize: 12,
              cursor: 'pointer', marginTop: 8,
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.2)'
              e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
            }}
          >
            {'⬅ Keluar'}
          </button>
        </div>
      </aside>
    </>
  )
}

export function Topbar() {
  const { currentUser, selectedBranch, setSelectedBranch } = useApp()

  if (!currentUser) return null

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const titles: Record<string, string> = {
    dashboard: 'Dashboard', pos: 'Kasir (POS)', products: 'Manajemen Produk',
    stock: 'Manajemen Stok', transactions: 'Riwayat Transaksi', reports: 'Laporan & Analitik',
    branches: 'Manajemen Cabang', users: 'Manajemen Pengguna',
  }

  return (
    <div style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: 54, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PageTitle titles={titles} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <select
          value={selectedBranch}
          onChange={e => setSelectedBranch(e.target.value)}
          disabled={currentUser.branch !== 'all'}
          style={{
            background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
            padding: '6px 10px', fontFamily: 'inherit', fontSize: 12, color: 'var(--text)',
            cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all">{'🏪 Semua Cabang'}</option>
          {BRANCHES.map((b, i) => (
            <option key={i} value={String(i)}>{b}</option>
          ))}
        </select>
        <div style={{ fontSize: 11, color: 'var(--text2)', background: 'var(--surface2)', padding: '5px 10px', borderRadius: 6 }}>
          {today}
        </div>
      </div>
    </div>
  )
}

function PageTitle({ titles }: { titles: Record<string, string> }) {
  const { currentPage } = useApp()
  return (
    <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>
      {titles[currentPage] || currentPage}
    </span>
  )
}

export function ToastContainer() {
  const { toasts } = useApp()
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--text)',
            color: 'white', padding: '12px 18px', borderRadius: 10, fontSize: 13,
            fontWeight: 500, animation: 'slideUp 0.2s ease', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            maxWidth: 300,
          }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}
