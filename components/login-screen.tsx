"use client"

import { useState } from 'react'
import { useApp } from '@/lib/context'

export function LoginScreen() {
  const { login } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function doLogin() {
    if (login(username, password)) {
      setError(false)
    } else {
      setError(true)
    }
  }

  function fillLogin(u: string, p: string) {
    setUsername(u)
    setPassword(p)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(180,83,9,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(146,64,14,0.04) 0%, transparent 50%)',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20,
        padding: 40, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
      }}>
        <div style={{ fontFamily: 'var(--font-serif), Fraunces, serif', fontSize: 28, color: 'var(--accent)', marginBottom: 4 }}>
          NM Parfum Racikan
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 32 }}>
          Management System
        </div>

        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
          Username
        </label>
        <input
          style={{
            width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8,
            fontFamily: 'inherit', fontSize: 14, outline: 'none', background: 'var(--surface)',
            color: 'var(--text)', marginBottom: 16,
          }}
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Masukkan username"
        />

        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
          Password
        </label>
        <input
          style={{
            width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8,
            fontFamily: 'inherit', fontSize: 14, outline: 'none', background: 'var(--surface)',
            color: 'var(--text)', marginBottom: 16,
          }}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') doLogin() }}
          placeholder="Masukkan password"
        />

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 12 }}>
            Username / password salah.
          </div>
        )}

        <button
          onClick={doLogin}
          style={{
            width: '100%', padding: 12, background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--accent2)')}
          onMouseOut={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          Masuk
        </button>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginBottom: 12 }}>
            {'— Demo Akun —'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { role: 'Owner', icon: '👑', name: 'Naufal Majid', u: 'naufal', p: 'owner123' },
              { role: 'Admin', icon: '🔑', name: 'Rina Safitri', u: 'rina', p: 'admin123' },
              { role: 'Finance', icon: '💰', name: 'Dian Pratiwi', u: 'dian', p: 'finance123' },
              { role: 'Kasir', icon: '🖥️', name: 'Andi (Bandung)', u: 'andi', p: 'kasir123' },
            ].map(acc => (
              <div
                key={acc.u}
                onClick={() => fillLogin(acc.u, acc.p)}
                style={{
                  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px 10px', cursor: 'pointer', textAlign: 'center',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.background = 'var(--accent-light)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--bg)'
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--accent)' }}>
                  {acc.icon} {acc.role}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2 }}>
                  {acc.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
