"use client"

import { useApp } from '@/lib/context'
import { rp, shortDate, getBranchName } from '@/lib/data'

export function DashboardPage() {
  const { db, setCurrentPage } = useApp()

  const today = new Date().toDateString()
  const todayTrx = db.transactions.filter(t => new Date(t.date).toDateString() === today)
  const allRev = todayTrx.reduce((a, t) => a + t.total, 0)
  const low = db.products.filter(p => p.stock.some(s => s <= p.minStock))

  // Top products
  const prodSales: Record<string, number> = {}
  db.transactions.forEach(t => t.items.forEach(it => {
    prodSales[it.name] = (prodSales[it.name] || 0) + it.qty
  }))
  const sorted = Object.entries(prodSales).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxQ = sorted[0]?.[1] || 1

  // Week chart
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
  const vals = [3200000, 4500000, 2800000, 5100000, 3900000, 6200000, allRev || 2400000]
  const max = Math.max(...vals, 1)

  // Recent transactions
  const recent = db.transactions.slice(0, 7)

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }} className="stats-grid">
        <StatCard label="Omzet Hari Ini" value={rp(allRev)} sub={`${todayTrx.length} transaksi`} valueColor="var(--accent)" />
        <StatCard label="Total Produk" value={String(db.products.length)} sub={`${[...new Set(db.products.map(p => p.category))].length} kategori`} />
        <StatCard label="Stok Kritis" value={String(low.length)} sub="Perlu restock segera" valueColor="var(--danger)" />
        <StatCard label="Pengguna Aktif" value={String(db.users.filter(u => u.active).length)} sub={`dari ${db.users.length} pengguna`} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="grid-2-col">
        <div className="nm-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Omzet 7 Hari</span>
          </div>
          <div style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, paddingBottom: 22, position: 'relative' }}>
              {vals.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative' }}>
                  <div style={{ fontSize: 8, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                    {v > 999999 ? (v / 1000000).toFixed(1) + 'jt' : (v / 1000).toFixed(0) + 'k'}
                  </div>
                  <div style={{
                    width: '100%', borderRadius: '5px 5px 0 0',
                    background: 'linear-gradient(to top, var(--accent), #E8A856)',
                    height: (v / max) * 110, minHeight: 4, cursor: 'pointer',
                    transition: 'height 0.4s ease',
                  }} title={`${days[i]}: ${rp(v)}`} />
                  <div style={{ fontSize: 9, color: 'var(--text3)', position: 'absolute', bottom: -18, left: 0, right: 0, textAlign: 'center' }}>
                    {days[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Terlaris Bulan Ini</span>
          </div>
          <div style={{ padding: 18 }}>
            {sorted.length ? sorted.map(([name, qty], i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 22, height: 22, background: i === 0 ? 'var(--accent)' : 'var(--surface2)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: i === 0 ? 'white' : 'var(--text2)',
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{name}</div>
                  <div style={{ height: 3, background: 'var(--accent)', borderRadius: 2, width: `${(qty / maxQ) * 100}%`, marginTop: 4, opacity: 0.5 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>{qty} terjual</div>
              </div>
            )) : (
              <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 20 }}>Belum ada data penjualan</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Transaksi Terbaru</span>
          <button onClick={() => setCurrentPage('transactions')} style={{
            padding: '5px 10px', borderRadius: 8, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)',
          }}>
            {'Lihat Semua →'}
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['ID', 'Item', 'Cabang', 'Metode', 'Total', 'Waktu', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', fontWeight: 600, background: 'var(--bg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length ? recent.map(t => (
                <tr key={t.id} style={{ transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = '#FAFAF9'} onMouseOut={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 11, color: 'var(--text2)' }}>{t.id}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', maxWidth: 180, fontSize: 12 }}>{t.items.map(i => `${i.name}×${i.qty}`).join(', ')}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'var(--surface2)', color: 'var(--text2)' }}>
                      {getBranchName(t.branch)}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>{t.method}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{rp(t.total)}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11 }}>{shortDate(t.date)}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'var(--success-light)', color: 'var(--success)' }}>Lunas</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: 'var(--text3)' }}>Belum ada transaksi hari ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, valueColor }: { label: string; value: string; sub: string; valueColor?: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18, boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif), Fraunces, serif', fontSize: 24, letterSpacing: -1, color: valueColor }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>
    </div>
  )
}
