"use client"

import { useState, useMemo, useCallback } from 'react'
import { useApp } from '@/lib/context'
import { CATEGORIES, rp, imgOrEmoji, getBranchName, fmtDate, type Product } from '@/lib/data'

export function PosPage() {
  const { db, cart, setCart, selectedBranch, selectedPayMethod, setSelectedPayMethod, currentUser, toast, forceUpdate } = useApp()
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('Semua')
  const [discPct, setDiscPct] = useState(0)
  const [cashReceived, setCashReceived] = useState('')
  const [showUpsell, setShowUpsell] = useState(false)
  const [selectedUpsellIds, setSelectedUpsellIds] = useState<number[]>([])
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTrx, setLastTrx] = useState<typeof db.transactions[0] | null>(null)

  const branchIdx = selectedBranch === 'all' ? 0 : parseInt(selectedBranch)

  const filtered = useMemo(() => {
    return db.products.filter(p => {
      const matchCat = activeCat === 'Semua' || p.category === activeCat
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [db.products, activeCat, search])

  const addToCart = useCallback((productId: number) => {
    const p = db.products.find(x => x.id === productId)
    if (!p) return
    if (p.stock[branchIdx] <= 0) { toast('Stok habis di cabang ini', 'error'); return }
    setCart(prev => {
      const existing = prev.find(c => c.productId === productId)
      if (existing) {
        if (existing.qty >= p.stock[branchIdx]) { toast('Stok tidak cukup', 'error'); return prev }
        return prev.map(c => c.productId === productId ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { productId, qty: 1 }]
    })
  }, [db.products, branchIdx, setCart, toast])

  const changeQty = useCallback((productId: number, delta: number) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.productId === productId)
      if (idx === -1) return prev
      const newQty = prev[idx].qty + delta
      if (newQty <= 0) return prev.filter(c => c.productId !== productId)
      return prev.map(c => c.productId === productId ? { ...c, qty: newQty } : c)
    })
  }, [setCart])

  const clearCart = useCallback(() => {
    setCart([])
    setDiscPct(0)
    setCashReceived('')
  }, [setCart])

  const subtotal = cart.reduce((a, c) => {
    const p = db.products.find(x => x.id === c.productId)
    return p ? a + p.sellPrice * c.qty : a
  }, 0)
  const total = subtotal * (1 - discPct / 100)
  const cashReceivedNum = parseFloat(cashReceived) || 0

  function tryPay() {
    if (!cart.length) { toast('Keranjang kosong!', 'error'); return }
    // Show upsell
    const cartIds = cart.map(c => c.productId)
    const upsellProds = db.products.filter(p =>
      (p.category === 'Aksesoris' || p.category === 'Packaging' || p.category === 'Botol Kosong') &&
      !cartIds.includes(p.id) && p.stock[branchIdx] > 0
    ).slice(0, 6)

    if (!upsellProds.length) { doPayment(); return }
    setSelectedUpsellIds([])
    setShowUpsell(true)
  }

  function doPayment() {
    const items = cart.map(c => {
      const p = db.products.find(x => x.id === c.productId)!
      return { name: p.name, qty: c.qty, price: p.sellPrice, unit: p.unit }
    })

    const trx = {
      id: `TRX-${db.nextTrxId++}`,
      items, branch: branchIdx,
      method: selectedPayMethod,
      cashier: currentUser!.name,
      discount: discPct, subtotal, total,
      date: new Date().toISOString(),
    }

    // Deduct stock
    cart.forEach(c => {
      const p = db.products.find(x => x.id === c.productId)
      if (p) p.stock[branchIdx] = Math.max(0, p.stock[branchIdx] - c.qty)
    })

    db.transactions.unshift(trx)
    setLastTrx(trx)
    setShowReceipt(true)
    clearCart()
    forceUpdate()
    toast('Transaksi berhasil!', 'success')
  }

  function selectPay(method: string) {
    setSelectedPayMethod(method)
  }

  const branchName = selectedBranch === 'all' ? 'Bandung (Pusat)' : getBranchName(parseInt(selectedBranch))

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, height: 'calc(100vh - 54px - 48px)' }} className="pos-layout">
        {/* Left - Products */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              style={{ flex: 1, minWidth: 120, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }}
              placeholder="🔍 Cari produk..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <div
                  key={c}
                  onClick={() => setActiveCat(c)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', border: '1px solid',
                    borderColor: activeCat === c ? 'var(--accent)' : 'var(--border)',
                    background: activeCat === c ? 'var(--accent)' : 'var(--surface)',
                    color: activeCat === c ? 'white' : 'var(--text2)',
                    transition: 'all 0.15s',
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 12, overflowY: 'auto', flex: 1 }}>
            {filtered.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {filtered.map(p => {
                  const s = p.stock[branchIdx]
                  return (
                    <div
                      key={p.id}
                      onClick={() => s > 0 && addToCart(p.id)}
                      style={{
                        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
                        padding: 14, cursor: s > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
                        position: 'relative', opacity: s === 0 ? 0.55 : 1,
                      }}
                      onMouseOver={e => { if (s > 0) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}
                    >
                      {s === 0 && (
                        <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--danger)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>HABIS</div>
                      )}
                      <div style={{ width: '100%', height: 90, borderRadius: 7, marginBottom: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                        {p.img ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 7 }} /> : imgOrEmoji(p)}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.3, marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text2)' }}>{p.brand}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginTop: 6 }}>
                        {rp(p.sellPrice)}<span style={{ fontSize: 10, color: 'var(--text3)' }}> / {p.unit}</span>
                      </div>
                      <div style={{ fontSize: 10, marginTop: 4, color: s < 10 ? 'var(--danger)' : s < 20 ? 'var(--warning)' : 'var(--text3)' }}>
                        Stok: {s} {p.unit}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Tidak ada produk ditemukan</div>
            )}
          </div>
        </div>

        {/* Right - Cart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 14, background: 'var(--sidebar-bg)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{'🛒 Keranjang'}</div>
              <div style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: 12, color: 'rgba(255,255,255,0.6)', display: 'inline-block', marginTop: 4 }}>
                {branchName}
              </div>
            </div>
            <button onClick={clearCart} style={{ padding: '3px 8px', fontSize: 11, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Hapus Semua
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            {cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.4 }}>{'🧴'}</div>
                <p>{'Klik produk untuk'}<br />{'menambah ke keranjang'}</p>
              </div>
            ) : (
              cart.map(c => {
                const p = db.products.find(x => x.id === c.productId)
                if (!p) return null
                return (
                  <div key={c.productId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 9, borderRadius: 8, background: 'var(--bg)', marginBottom: 7 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 6, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
                      {p.img ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : imgOrEmoji(p)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{rp(p.sellPrice)} / {p.unit}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <button onClick={() => changeQty(p.id, -1)} style={{
                          width: 22, height: 22, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text2)',
                        }}>{'−'}</button>
                        <div style={{ fontSize: 12, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{c.qty}</div>
                        <button onClick={() => changeQty(p.id, 1)} style={{
                          width: 22, height: 22, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text2)',
                        }}>{'+'}</button>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800 }}>{rp(p.sellPrice * c.qty)}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
              <span>Subtotal</span><span>{rp(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6, alignItems: 'center' }}>
              <span>Diskon (%)</span>
              <input
                type="number" min="0" max="100" value={discPct}
                onChange={e => setDiscPct(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                style={{ width: 55, padding: '3px 6px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, textAlign: 'right', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, paddingTop: 8, borderTop: '1px solid var(--border)', marginBottom: 12 }}>
              <span>Total</span><span style={{ color: 'var(--accent)' }}>{rp(total)}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 12 }}>
              {['Tunai', 'QRIS', 'Transfer', 'Debit'].map((m, i) => {
                const icons = ['💵', '📱', '🏦', '💳']
                return (
                  <div
                    key={m}
                    onClick={() => selectPay(m)}
                    style={{
                      padding: 7, border: '1px solid',
                      borderColor: selectedPayMethod === m ? 'var(--accent)' : 'var(--border)',
                      borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                      fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                      background: selectedPayMethod === m ? 'var(--accent)' : 'var(--surface)',
                      color: selectedPayMethod === m ? 'white' : 'var(--text)',
                    }}
                  >
                    {icons[i]} {m}
                  </div>
                )
              })}
            </div>

            {selectedPayMethod === 'Tunai' && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>
                  {'Uang Diterima (Rp)'}
                </label>
                <input
                  type="number" placeholder="0" value={cashReceived}
                  onChange={e => setCashReceived(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }}
                />
                {cashReceivedNum > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>
                    Kembalian: {rp(Math.max(0, cashReceivedNum - total))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={clearCart} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                Batal
              </button>
              <button onClick={tryPay} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white' }}>
                {'💳 Bayar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upsell Modal */}
      {showUpsell && (
        <Modal title="Ada Tambahan? 🛍️" onClose={() => { setShowUpsell(false); doPayment() }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Pelanggan mungkin butuh produk pelengkap lainnya:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 14 }}>
            {db.products.filter(p =>
              (p.category === 'Aksesoris' || p.category === 'Packaging' || p.category === 'Botol Kosong') &&
              !cart.map(c => c.productId).includes(p.id) && p.stock[branchIdx] > 0
            ).slice(0, 6).map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedUpsellIds(prev =>
                    prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                  )
                }}
                style={{
                  border: '1px solid',
                  borderColor: selectedUpsellIds.includes(p.id) ? 'var(--accent)' : 'var(--border)',
                  background: selectedUpsellIds.includes(p.id) ? 'var(--accent-light)' : 'var(--surface)',
                  borderRadius: 10, padding: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{imgOrEmoji(p)}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginTop: 2 }}>{rp(p.sellPrice)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={() => { setShowUpsell(false); doPayment() }} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>
              Tidak, Lanjut Bayar
            </button>
            <button onClick={() => {
              selectedUpsellIds.forEach(id => addToCart(id))
              setShowUpsell(false)
              setTimeout(() => doPayment(), 50)
            }} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white' }}>
              {'✅ Tambahkan & Bayar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastTrx && (
        <Modal title="Transaksi Berhasil ✅" onClose={() => setShowReceipt(false)}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ width: 60, height: 60, background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'white', margin: '0 auto 12px' }}>{'✓'}</div>
            <div style={{ fontFamily: 'var(--font-serif), Fraunces, serif', fontSize: 20 }}>Pembayaran Diterima!</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{'Terima kasih sudah berbelanja di NM Parfum Racikan 🧴'}</div>
          </div>
          <div style={{ background: '#FAFAFA', border: '1px dashed var(--border)', borderRadius: 8, padding: 16, fontFamily: 'Courier New, monospace', fontSize: 12, lineHeight: 1.9, textAlign: 'center' }}>
            <b>NM Parfum Racikan</b><br />
            {getBranchName(lastTrx.branch)}<br />
            <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '8px 0' }} />
            <div style={{ fontSize: 10 }}>{lastTrx.id} {'·'} {fmtDate(lastTrx.date)}</div>
            <div style={{ fontSize: 10 }}>Kasir: {lastTrx.cashier} {'·'} {lastTrx.method}</div>
            <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '8px 0' }} />
            {lastTrx.items.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left' }}>
                <span>{it.name} {`×${it.qty} ${it.unit}`}</span>
                <span>{rp(it.price * it.qty)}</span>
              </div>
            ))}
            <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '8px 0' }} />
            {lastTrx.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left' }}>
                <span>Diskon {lastTrx.discount}%</span>
                <span>-{rp((lastTrx.subtotal || 0) * lastTrx.discount / 100)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left' }}>
              <b>TOTAL</b><b>{rp(lastTrx.total)}</b>
            </div>
            <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '8px 0' }} />
            <i style={{ fontSize: 10 }}>{'Terima kasih! NM Parfum Racikan 🧴✨'}</i>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={() => setShowReceipt(false)} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>
              Tutup
            </button>
            <button onClick={() => window.print()} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white' }}>
              {'🖨️ Cetak Struk'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
        }}>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>{title}</span>
          <span onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 22, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
            {'×'}
          </span>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  )
}
