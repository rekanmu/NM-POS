"use client"

import { useState, useRef } from 'react'
import { useApp } from '@/lib/context'
import { rp, imgOrEmoji, type Product } from '@/lib/data'

export function ProductsPage() {
  const { db, currentUser, toast, forceUpdate } = useApp()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', brand: '', category: 'Bibit Parfum', unit: 'ml', buyPrice: '', sellPrice: '', desc: '', s0: '', s1: '', s2: '', minStock: '10' })
  const [currentImg, setCurrentImg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const cats = [...new Set(db.products.map(p => p.category))]
  const canEdit = ['owner', 'admin'].includes(currentUser?.role || '')

  const filtered = db.products.filter(p => {
    const matchS = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    const matchC = !catFilter || p.category === catFilter
    return matchS && matchC
  })

  function openModal(id: number | null = null) {
    if (!canEdit) { toast('Tidak punya akses', 'error'); return }
    setEditingId(id)
    const p = id ? db.products.find(x => x.id === id) : null
    setForm({
      name: p?.name || '', brand: p?.brand || '', category: p?.category || 'Bibit Parfum',
      unit: p?.unit || 'ml', buyPrice: p?.buyPrice?.toString() || '', sellPrice: p?.sellPrice?.toString() || '',
      desc: p?.desc || '', s0: p?.stock[0]?.toString() || '', s1: p?.stock[1]?.toString() || '',
      s2: p?.stock[2]?.toString() || '', minStock: p?.minStock?.toString() || '10',
    })
    setCurrentImg(p?.img || null)
    setShowModal(true)
  }

  function saveProduct() {
    if (!form.name.trim()) { toast('Nama produk harus diisi', 'error'); return }
    const prod: Omit<Product, 'id'> = {
      name: form.name.trim(), brand: form.brand.trim(), category: form.category,
      unit: form.unit, buyPrice: parseInt(form.buyPrice) || 0, sellPrice: parseInt(form.sellPrice) || 0,
      stock: [parseInt(form.s0) || 0, parseInt(form.s1) || 0, parseInt(form.s2) || 0],
      minStock: parseInt(form.minStock) || 10, desc: form.desc.trim(), img: currentImg,
    }
    if (editingId) {
      const idx = db.products.findIndex(x => x.id === editingId)
      db.products[idx] = { ...db.products[idx], ...prod }
      toast('Produk berhasil diupdate', 'success')
    } else {
      (prod as Product).id = db.nextProductId++
      db.products.push(prod as Product)
      toast('Produk berhasil ditambahkan', 'success')
    }
    setShowModal(false)
    forceUpdate()
  }

  function deleteProduct(id: number) {
    if (!confirm('Hapus produk ini?')) return
    const idx = db.products.findIndex(x => x.id === id)
    if (idx !== -1) db.products.splice(idx, 1)
    toast('Produk dihapus', 'success')
    forceUpdate()
  }

  function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast('Ukuran file maks 2MB', 'error'); return }
    const reader = new FileReader()
    reader.onload = ev => setCurrentImg(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const margin = (parseInt(form.buyPrice) && parseInt(form.sellPrice))
    ? Math.round((parseInt(form.sellPrice) - parseInt(form.buyPrice)) / parseInt(form.buyPrice) * 100)
    : null

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <input style={{ width: 240, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }}
            placeholder="🔍 Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={{ width: 160, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
            value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">Semua Kategori</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {canEdit && (
          <button onClick={() => openModal()} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white' }}>
            + Tambah Produk
          </button>
        )}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Produk', 'Kategori', 'Satuan', 'Harga Beli', 'Harga Jual', 'Margin', 'Stok Total', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', fontWeight: 600, background: 'var(--bg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const m = p.buyPrice ? Math.round((p.sellPrice - p.buyPrice) / p.buyPrice * 100) : 0
                const totalStock = p.stock.reduce((a, b) => a + b, 0)
                const status = totalStock === 0 ? ['var(--danger-light)', 'var(--danger)', 'Habis'] : totalStock <= p.minStock ? ['var(--warning-light)', 'var(--warning)', 'Menipis'] : ['var(--success-light)', 'var(--success)', 'Tersedia']
                return (
                  <tr key={p.id} onMouseOver={e => e.currentTarget.style.background = '#FAFAF9'} onMouseOut={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, overflow: 'hidden', flexShrink: 0 }}>
                          {p.img ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : imgOrEmoji(p)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{p.brand}{p.desc ? ` · ${p.desc.slice(0, 30)}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'var(--surface2)', color: 'var(--text2)' }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>{p.unit}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>{rp(p.buyPrice)}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{rp(p.sellPrice)}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 700 }}>{m}%</span>
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 700, color: totalStock === 0 ? 'var(--danger)' : totalStock <= p.minStock ? 'var(--warning)' : 'var(--text)' }}>
                        {totalStock} {p.unit}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: status[0], color: status[1] }}>{status[2]}</span>
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {canEdit ? (
                          <>
                            <button onClick={() => openModal(p.id)} style={{ padding: '5px 10px', borderRadius: 8, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>Edit</button>
                            <button onClick={() => deleteProduct(p.id)} style={{ padding: '5px 10px', borderRadius: 8, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'var(--danger)', border: 'none', color: 'white' }}>Hapus</button>
                          </>
                        ) : <span style={{ fontSize: 11, color: 'var(--text3)' }}>{'—'}</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>Tidak ada produk ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.25)', animation: 'slideUp 0.2s ease' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</span>
              <span onClick={() => setShowModal(false)} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 22, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>{'×'}</span>
            </div>
            <div style={{ padding: 22 }}>
              {/* Image upload */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Foto Produk</label>
                <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: 'var(--bg)' }}>
                  {currentImg ? (
                    <><img src={currentImg} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }} /><br /><span style={{ fontSize: 11, color: 'var(--text2)' }}>Klik untuk ganti foto</span></>
                  ) : (
                    <><div style={{ fontSize: 32, marginBottom: 6 }}>{'📷'}</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>{'Klik untuk upload foto produk'}<br /><span style={{ fontSize: 10 }}>JPG, PNG, GIF — Maks 2MB</span></div></>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgUpload} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Nama Produk *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Cth: Bibit Sauvage" />
                <FormField label="Merek / Brand" value={form.brand} onChange={v => setForm(f => ({ ...f, brand: v }))} placeholder="Cth: Dior Grade A" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Kategori</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}>
                    {['Bibit Parfum', 'Campuran / Base', 'Botol Kosong', 'Packaging', 'Aksesoris', 'Parfum Jadi'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Satuan</label>
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}>
                    {['ml', 'gram', 'pcs', 'botol', 'pack', 'liter'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Harga Beli (Rp)" value={form.buyPrice} onChange={v => setForm(f => ({ ...f, buyPrice: v }))} placeholder="0" type="number" />
                <FormField label="Harga Jual (Rp)" value={form.sellPrice} onChange={v => setForm(f => ({ ...f, sellPrice: v }))} placeholder="0" type="number" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Margin Keuntungan</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>{margin !== null ? `${margin}% margin` : '—'}</span>
                </label>
              </div>
              <FormField label="Deskripsi / Catatan" value={form.desc} onChange={v => setForm(f => ({ ...f, desc: v }))} placeholder="Karakteristik, bahan baku, dll." />
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Stok Awal per Cabang</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <input type="number" placeholder="Bandung" value={form.s0} onChange={e => setForm(f => ({ ...f, s0: e.target.value }))} min="0" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
                  <input type="number" placeholder="Jakarta" value={form.s1} onChange={e => setForm(f => ({ ...f, s1: e.target.value }))} min="0" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
                  <input type="number" placeholder="Depok" value={form.s2} onChange={e => setForm(f => ({ ...f, s2: e.target.value }))} min="0" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
                </div>
              </div>
              <FormField label="Minimum Stok (Alert)" value={form.minStock} onChange={v => setForm(f => ({ ...f, minStock: v }))} placeholder="10" type="number" />
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>Batal</button>
              <button onClick={saveProduct} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white' }}>{'💾 Simpan Produk'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }} />
    </div>
  )
}
