"use client"

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { ROLES, PERMS, getBranchName, shortDate, BRANCHES } from '@/lib/data'

export function UsersPage() {
  const { db, currentUser, toast, forceUpdate } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', username: '', pass: '', role: 'cashier', branch: 'all', phone: '' })

  const isOwner = currentUser?.role === 'owner'

  const roleLabels: Record<string, string> = { owner: '👑 Owner', admin: '🔑 Admin', finance: '💰 Finance', head: '🏪 Kepala Toko', cashier: '🖥️ Kasir' }
  const roleClasses: Record<string, { bg: string; color: string }> = {
    owner: { bg: '#1C1917', color: 'white' },
    admin: { bg: 'var(--purple-light)', color: 'var(--purple)' },
    finance: { bg: 'var(--info-light)', color: 'var(--info)' },
    head: { bg: 'var(--warning-light)', color: 'var(--warning)' },
    cashier: { bg: 'var(--success-light)', color: 'var(--success)' },
  }
  const avatarColors: Record<string, string> = { owner: '#1C1917', admin: '#7C3AED', finance: '#1D4ED8', head: '#D97706', cashier: '#15803D' }

  function openModal(id: number | null = null) {
    if (!isOwner) { toast('Hanya owner yang bisa mengelola pengguna', 'error'); return }
    setEditingId(id)
    const u = id ? db.users.find(x => x.id === id) : null
    setForm({
      name: u?.name || '', username: u?.username || '', pass: '',
      role: u?.role || 'cashier', branch: u?.branch || 'all', phone: u?.phone || '',
    })
    setShowModal(true)
  }

  function saveUser() {
    if (!form.name.trim() || !form.username.trim()) { toast('Nama dan username harus diisi', 'error'); return }
    if (editingId) {
      const idx = db.users.findIndex(x => x.id === editingId)
      db.users[idx] = {
        ...db.users[idx],
        name: form.name.trim(), username: form.username.trim(),
        ...(form.pass ? { pass: form.pass } : {}),
        role: form.role, branch: form.branch, phone: form.phone,
      }
      toast('Pengguna berhasil diupdate', 'success')
    } else {
      if (!form.pass) { toast('Password harus diisi', 'error'); return }
      if (db.users.find(x => x.username === form.username.trim())) { toast('Username sudah digunakan', 'error'); return }
      db.users.push({
        id: db.nextUserId++, name: form.name.trim(), username: form.username.trim(), pass: form.pass,
        role: form.role, branch: form.branch, phone: form.phone, active: true, lastLogin: null,
      })
      toast('Pengguna berhasil ditambahkan', 'success')
    }
    setShowModal(false)
    forceUpdate()
  }

  function toggleActive(id: number) {
    const u = db.users.find(x => x.id === id)
    if (!u) return
    u.active = !u.active
    toast(`${u.name} ${u.active ? 'diaktifkan' : 'dinonaktifkan'}`, u.active ? 'success' : '')
    forceUpdate()
  }

  const roles = ['owner', 'admin', 'finance', 'head', 'cashier']
  const roleLbls = ['Owner', 'Admin', 'Finance', 'Kep. Toko', 'Kasir']

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>Kelola akun, role, dan izin akses pengguna.</div>
        {isOwner && (
          <button onClick={() => openModal()} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white' }}>
            + Tambah Pengguna
          </button>
        )}
      </div>

      {/* Users Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Pengguna', 'Username', 'Role', 'Cabang', 'Status', 'Terakhir Login', 'Aksi'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', fontWeight: 600, background: 'var(--bg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!isOwner ? (
                <tr><td colSpan={7}>
                  <div style={{ textAlign: 'center', padding: 48 }}>
                    <div style={{ fontSize: 48, opacity: 0.3 }}>{'🔒'}</div>
                    <p style={{ color: 'var(--text2)' }}>Hanya Owner yang dapat melihat halaman ini.</p>
                  </div>
                </td></tr>
              ) : db.users.map(u => (
                <tr key={u.id} style={{ opacity: u.active ? 1 : 0.5 }}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0, background: avatarColors[u.role] || '#666',
                      }}>
                        {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>{u.phone || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 12 }}>{u.username}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: roleClasses[u.role]?.bg, color: roleClasses[u.role]?.color }}>
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    {u.branch === 'all' ? 'Semua Cabang' : getBranchName(parseInt(u.branch))}
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: u.active ? 'var(--success-light)' : 'var(--surface2)', color: u.active ? 'var(--success)' : 'var(--text2)' }}>
                      {u.active ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)' }}>
                    {u.lastLogin ? shortDate(u.lastLogin) : 'Belum login'}
                  </td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => openModal(u.id)} style={{ padding: '5px 10px', borderRadius: 8, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                        Edit
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => toggleActive(u.id)} style={{ padding: '5px 10px', borderRadius: 8, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: u.active ? 'var(--danger)' : 'var(--success)', border: 'none', color: 'white' }}>
                          {u.active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Matrix */}
      {isOwner && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', marginTop: 16 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Matriks Izin Akses</span>
          </div>
          <div style={{ padding: 18, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', fontWeight: 600, background: 'var(--bg)' }}>Izin Akses</th>
                  {roleLbls.map(l => (
                    <th key={l} style={{ textAlign: 'center', padding: '10px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', fontWeight: 600, background: 'var(--bg)' }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PERMS).map(([perm, allowed]) => (
                  <tr key={perm}>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{perm}</td>
                    {roles.map(r => (
                      <td key={r} style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                        {allowed.includes(r) ? (
                          <span style={{ color: 'var(--success)', fontSize: 16 }}>{'✓'}</span>
                        ) : (
                          <span style={{ color: 'var(--border)', fontSize: 16 }}>{'—'}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.25)', animation: 'slideUp 0.2s ease' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>{editingId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</span>
              <span onClick={() => setShowModal(false)} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 22, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>{'×'}</span>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Nama Lengkap *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Username *</label>
                  <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="username login"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Password *</label>
                  <input type="password" value={form.pass} onChange={e => setForm(f => ({ ...f, pass: e.target.value }))}
                    placeholder={editingId ? '(kosongkan jika tidak diganti)' : 'Password'}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Role / Jabatan *</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }}>
                    <option value="owner">Owner / Direksi</option>
                    <option value="admin">Admin Toko</option>
                    <option value="finance">Finance</option>
                    <option value="head">Kepala Toko</option>
                    <option value="cashier">Kasir</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>Cabang</label>
                <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }}>
                  <option value="all">Semua Cabang</option>
                  {BRANCHES.map((b, i) => <option key={i} value={String(i)}>{b}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text2)', marginBottom: 5, display: 'block' }}>No. HP</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xx-xxxx-xxxx"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', outline: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>Batal</button>
              <button onClick={saveUser} style={{ padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'white' }}>{'💾 Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
