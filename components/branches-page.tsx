"use client"

import { useApp } from '@/lib/context'
import { rp, BRANCHES, BRANCH_COLORS } from '@/lib/data'

export function BranchesPage() {
  const { db } = useApp()

  const icons = ['🏪', '🏬', '🛍️']
  const branchData = [
    { name: 'Bandung (Pusat)', city: 'Bandung', address: 'Jl. Riau No. 12, Bandung, Jawa Barat', manager: 'Andi Saputra', phone: '0812-3456-7890' },
    { name: 'Cabang Jakarta', city: 'Jakarta', address: 'Jl. Kemang Raya No. 45, Jakarta Selatan 12730', manager: 'Siti Rahayu', phone: '0821-9876-5432' },
    { name: 'Cabang Depok', city: 'Depok', address: 'Jl. Margonda Raya No. 78, Depok, Jawa Barat', manager: 'Budi Santoso', phone: '0851-2345-6789' },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ color: 'var(--text2)', fontSize: 13 }}>Informasi {'&'} performa 3 cabang toko NM Parfum Racikan.</div>
      </div>

      {BRANCHES.map((name, i) => {
        const rev = db.transactions.filter(t => t.branch === i).reduce((a, t) => a + t.total, 0)
        const trxCount = db.transactions.filter(t => t.branch === i).length
        const totalStock = db.products.reduce((a, p) => a + p.stock[i], 0)

        return (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, background: BRANCH_COLORS[i], borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {icons[i]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{branchData[i].name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{'📍'} {branchData[i].address}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{'👤'} {branchData[i].manager} {'·'} {'📱'} {branchData[i].phone}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Omzet Total</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: BRANCH_COLORS[i], marginTop: 4 }}>{rp(rev)}</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Transaksi</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{trxCount}</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Total Stok</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{totalStock}</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
