"use client"

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { rp, shortDate, fmtDate, getBranchName } from '@/lib/data'

export function TransactionsPage() {
  const { db, currentUser } = useApp()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [detailTrx, setDetailTrx] = useState<typeof db.transactions[0] | null>(null)

  let trxs = [...db.transactions]
  if (fromDate) trxs = trxs.filter(t => new Date(t.date) >= new Date(fromDate))
  if (toDate) trxs = trxs.filter(t => new Date(t.date) <= new Date(toDate + 'T23:59:59'))
  if (branchFilter !== '') trxs = trxs.filter(t => t.branch === parseInt(branchFilter))
  if (currentUser?.role === 'cashier' && currentUser.branch !== 'all') {
    trxs = trxs.filter(t => t.branch === parseInt(currentUser.branch))
  }

  function exportCSV() {
    let csv = 'ID,Item,Kasir,Cabang,Metode,Total,Tanggal\n'
    db.transactions.forEach(t => {
      csv += `${t.id},"${t.items.map(i => `${i.name}x${i.qty}`).join('; ')}",${t.cashier || '-'},${getBranchName(t.branch)},${t.method},${t.total},${fmtDate(t.date)}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'transaksi-nm-parfum.csv'
    a.click()
  }

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
          <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
            style={{ width: 160, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}>
            <option value="">Semua Cabang</option>
            <option value="0">Bandung</option>
            <option value="1">Jakarta</option>
            <option value="2">Depok</option>
          </select>
        </div>
        <button onClick={exportCSV} style={{ padding: '5px 10px', borderRadius: 8, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>
          {'⬇ Export CSV'}
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['ID', 'Item', 'Kasir', 'Cabang', 'Metode', 'Total', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', fontWeight: 600, background: 'var(--bg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trxs.map(t => (
                <tr key={t.id} onMouseOver={e => e.currentTarget.style.background = '#FAFAF9'} onMouseOut={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 11, color: 'var(--text2)' }}>{t.id}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', maxWidth: 180, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.items.map(i => `${i.name}×${i.qty}`).join(', ')}
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>{t.cashier || '—'}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'var(--surface2)', color: 'var(--text2)' }}>
                      {getBranchName(t.branch)}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'var(--info-light)', color: 'var(--info)' }}>
                      {t.method}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontWeight: 800 }}>{rp(t.total)}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11 }}>{shortDate(t.date)}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <button onClick={() => setDetailTrx(t)} style={{ padding: '3px 8px', borderRadius: 8, fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
              {!trxs.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>Tidak ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {detailTrx && (
        <div onClick={e => { if (e.target === e.currentTarget) setDetailTrx(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.25)', animation: 'slideUp 0.2s ease' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>Detail Transaksi</span>
              <span onClick={() => setDetailTrx(null)} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 22, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>{'×'}</span>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>{detailTrx.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{fmtDate(detailTrx.date)}</div>
                </div>
                <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'var(--success-light)', color: 'var(--success)' }}>Lunas</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div><div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Cabang</div><div style={{ fontWeight: 700 }}>{getBranchName(detailTrx.branch)}</div></div>
                <div><div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Kasir</div><div style={{ fontWeight: 700 }}>{detailTrx.cashier || '—'}</div></div>
                <div><div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Metode</div><div style={{ fontWeight: 700 }}>{detailTrx.method}</div></div>
                <div><div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Diskon</div><div style={{ fontWeight: 700 }}>{detailTrx.discount || 0}%</div></div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                {detailTrx.items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span>{it.name} {`× ${it.qty} ${it.unit}`}</span>
                    <span style={{ fontWeight: 700 }}>{rp(it.price * it.qty)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', fontWeight: 800, fontSize: 15, background: 'var(--bg)' }}>
                  <span>Total</span><span style={{ color: 'var(--accent)' }}>{rp(detailTrx.total)}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setDetailTrx(null)} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
