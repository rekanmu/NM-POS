"use client"

import { useApp } from '@/lib/context'
import { rp, BRANCHES, BRANCH_COLORS } from '@/lib/data'

export function ReportsPage() {
  const { db } = useApp()

  const allRev = db.transactions.reduce((a, t) => a + t.total, 0)
  const count = db.transactions.length
  const profit = allRev * 0.38

  // Branch revenues
  const branchRevs = [0, 0, 0]
  db.transactions.forEach(t => { if (t.branch >= 0 && t.branch < 3) branchRevs[t.branch] += t.total })
  const maxBr = Math.max(...branchRevs, 1)

  // Payment methods
  const payM: Record<string, number> = {}
  db.transactions.forEach(t => { payM[t.method] = (payM[t.method] || 0) + 1 })
  const pmColors: Record<string, string> = { Tunai: BRANCH_COLORS[0], QRIS: BRANCH_COLORS[1], Transfer: BRANCH_COLORS[2], Debit: '#7C3AED' }

  // Top products
  const prodSales: Record<string, { qty: number; rev: number }> = {}
  db.transactions.forEach(t => t.items.forEach(it => {
    if (!prodSales[it.name]) prodSales[it.name] = { qty: 0, rev: 0 }
    prodSales[it.name].qty += it.qty
    prodSales[it.name].rev += it.price * it.qty
  }))
  const sorted = Object.entries(prodSales).sort((a, b) => b[1].qty - a[1].qty).slice(0, 10)

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }} className="stats-grid">
        <StatCard label="Total Omzet" value={rp(allRev)} valueColor="var(--accent)" />
        <StatCard label="Total Transaksi" value={String(count)} />
        <StatCard label="Rata-rata / Transaksi" value={rp(count ? allRev / count : 0)} />
        <StatCard label="Est. Laba Bersih" value={rp(profit)} valueColor="var(--success)" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="grid-2-col">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Omzet per Cabang</span>
          </div>
          <div style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, paddingBottom: 22, position: 'relative' }}>
              {BRANCHES.map((b, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative' }}>
                  <div style={{ fontSize: 8, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                    {branchRevs[i] > 999999 ? (branchRevs[i] / 1000000).toFixed(1) + 'jt' : (branchRevs[i] / 1000).toFixed(0) + 'k'}
                  </div>
                  <div style={{
                    width: '100%', borderRadius: '5px 5px 0 0',
                    background: BRANCH_COLORS[i],
                    height: Math.max((branchRevs[i] / maxBr) * 110, 4),
                    transition: 'height 0.4s ease', cursor: 'pointer',
                  }} />
                  <div style={{ fontSize: 9, color: 'var(--text3)', position: 'absolute', bottom: -18, textAlign: 'center' }}>
                    {b.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Metode Pembayaran</span>
          </div>
          <div style={{ padding: 18 }}>
            {Object.entries(payM).map(([m, n]) => (
              <div key={m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: pmColors[m] || '#999' }} />
                  <span style={{ fontSize: 13 }}>{m}</span>
                </div>
                <div style={{ fontSize: 13 }}>
                  <b>{n}</b> <span style={{ color: 'var(--text2)' }}>({count ? Math.round(n / count * 100) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Top Produk Terlaris</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['#', 'Produk', 'Terjual', 'Omzet'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', fontWeight: 600, background: 'var(--bg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length ? sorted.map(([name, d], i) => (
                <tr key={name}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>{name}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>{d.qty}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{rp(d.rev)}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--text3)' }}>Belum ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18, boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif), Fraunces, serif', fontSize: 24, letterSpacing: -1, color: valueColor }}>{value}</div>
    </div>
  )
}
