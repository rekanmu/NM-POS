"use client"

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { rp, imgOrEmoji, getBranchName, BRANCHES } from '@/lib/data'

export function StockPage() {
  const { db, currentUser, toast, forceUpdate } = useApp()
  const [showRestock, setShowRestock] = useState(false)
  const [rstProduct, setRstProduct] = useState('')
  const [rstBranch, setRstBranch] = useState('0')
  const [rstQty, setRstQty] = useState('')
  const [rstNote, setRstNote] = useState('')

  const canRestock = ['owner', 'admin', 'head'].includes(currentUser?.role || '')

  // Low stock items
  const low: { p: typeof db.products[0]; bi: number; s: number }[] = []
  db.products.forEach(p => p.stock.forEach((s, bi) => {
    if (s <= p.minStock) low.push({ p, bi, s })
  }))

  function openRestock(pId?: number, bIdx?: number) {
    if (!canRestock) { toast('Tidak punya akses', 'error'); return }
    setRstProduct(pId?.toString() || db.products[0]?.id.toString() || '')
    setRstBranch(bIdx?.toString() || '0')
    setRstQty('')
    setRstNote('')
    setShowRestock(true)
  }

  function saveRestock() {
    const pId = parseInt(rstProduct)
    const bIdx = parseInt(rstBranch)
    const qty = parseInt(rstQty)
    if (!qty || qty < 1) { toast('Masukkan jumlah restock', 'error'); return }
    const p = db.products.find(x => x.id === pId)
    if (!p) { toast('Produk tidak ditemukan', 'error'); return }
    p.stock[bIdx] += qty
    setShowRestock(false)
    forceUpdate()
    toast(`Restock ${p.name} +${qty} ${p.unit} di ${getBranchName(bIdx)} berhasil!`, 'success')
  }

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{'Monitor & kelola stok semua produk per cabang.'}</div>
        {canRestock && (
          <button onClick={() => openRestock()} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white' }}>
            + Input Restock
          </button>
        )}
      </div>

      {/* Low stock */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2, color: 'var(--warning)' }}>{'⚠️ Stok Kritis / Habis'}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Produk', 'Cabang', 'Stok', 'Min. Stok', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', fontWeight: 600, background: 'var(--bg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {low.length ? low.map(({ p, bi, s }, i) => (
                <tr key={`${p.id}-${bi}-${i}`}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{imgOrEmoji(p)}</div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>{getBranchName(bi)}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontWeight: 800, color: s === 0 ? 'var(--danger)' : 'var(--warning)' }}>{s} {p.unit}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>{p.minStock} {p.unit}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: s === 0 ? 'var(--danger-light)' : 'var(--warning-light)', color: s === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                      {s === 0 ? 'Habis' : 'Menipis'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <button onClick={() => openRestock(p.id, bi)} style={{ padding: '5px 10px', borderRadius: 8, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white' }}>
                      + Restock
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: 'var(--success)' }}>{'✅ Semua stok aman'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* All stock */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Semua Stok per Cabang</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Produk', 'Bandung', 'Jakarta', 'Depok', 'Total'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', fontWeight: 600, background: 'var(--bg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {db.products.map(p => (
                <tr key={p.id} onMouseOver={e => e.currentTarget.style.background = '#FAFAF9'} onMouseOut={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{imgOrEmoji(p)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>{p.brand} {'·'} {p.unit}</div>
                      </div>
                    </div>
                  </td>
                  {p.stock.map((s, i) => (
                    <td key={i} style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: s === 0 ? 'var(--danger)' : s <= p.minStock ? 'var(--warning)' : 'var(--text)' }}>{s}</td>
                  ))}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontWeight: 800 }}>{p.stock.reduce((a, b) => a + b, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {showRestock && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowRestock(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.25)', animation: 'slideUp 0.2s ease' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>Input Restock</span>
              <span onClick={() => setShowRestock(false)} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 22, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>{'×'}</span>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Produk</label>
                <select value={rstProduct} onChange={e => setRstProduct(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }}>
                  {db.products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Cabang Tujuan</label>
                <select value={rstBranch} onChange={e => setRstBranch(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }}>
                  {BRANCHES.map((b, i) => <option key={i} value={i}>{b}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Jumlah</label>
                <input type="number" value={rstQty} onChange={e => setRstQty(e.target.value)} placeholder="Jumlah unit" min="1"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>{'Catatan (opsional)'}</label>
                <input value={rstNote} onChange={e => setRstNote(e.target.value)} placeholder="Dari supplier, dll."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRestock(false)} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>Batal</button>
              <button onClick={saveRestock} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white' }}>{'✅ Simpan Restock'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
